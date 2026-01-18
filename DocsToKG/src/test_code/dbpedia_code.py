import dspy
from typing import Optional


# Configure DSPy with Ollama
class OllamaLM(dspy.LM):
    """Custom Ollama language model for DSPy"""

    def __init__(
        self, model="qwen2.5-coder:latest", base_url="http://localhost:11434", **kwargs
    ):
        super().__init__(model=model)
        self.model = model
        self.base_url = base_url
        self.provider = "ollama"
        self.history = []
        self.kwargs = {"temperature": 0.7, "max_tokens": 2000, **kwargs}

    def __call__(self, prompt=None, messages=None, **kwargs):
        import ollama

        if messages is None and prompt:
            messages = [{"role": "user", "content": prompt}]

        # Merge default kwargs with call-time kwargs
        request_kwargs = {**self.kwargs, **kwargs}

        # Use ollama library for the API call
        options = {}
        if "temperature" in request_kwargs:
            options["temperature"] = request_kwargs["temperature"]

        response = ollama.chat(
            model=self.model, messages=messages, options=options if options else None
        )
        return [response["message"]["content"]]

    def basic_request(self, prompt, **kwargs):
        return self(prompt=prompt, **kwargs)


# Function to fetch and parse DBpedia ontology
def fetch_dbpedia_ontology(cache_file="dbpedia_ontology_cache.txt", use_cache=True):
    """
    Fetch DBpedia ontology information from the web and extract relevant schema details.

    Args:
        cache_file: Path to cache the ontology to avoid repeated downloads
        use_cache: Whether to use cached version if available

    Returns:
        String containing formatted ontology information
    """
    import os
    import requests
    from rdflib import Graph, Namespace, RDF, RDFS, OWL

    # Check cache first
    if use_cache and os.path.exists(cache_file):
        print(f"Loading ontology from cache: {cache_file}")
        with open(cache_file, "r", encoding="utf-8") as f:
            return f.read()

    print("Fetching DBpedia ontology from https://dbpedia.org/ontology/...")

    try:
        # Fetch the ontology in RDF/XML format
        response = requests.get(
            "https://dbpedia.org/ontology/",
            headers={"Accept": "application/rdf+xml"},
            timeout=30,
        )
        response.raise_for_status()

        # Parse with rdflib
        g = Graph()
        g.parse(data=response.text, format="xml")

        # Define namespaces
        DBO = Namespace("http://dbpedia.org/ontology/")

        # Extract classes
        classes = []
        for s in g.subjects(RDF.type, OWL.Class):
            if str(s).startswith("http://dbpedia.org/ontology/"):
                class_name = str(s).split("/")[-1]
                # Get label/comment if available
                label = g.value(s, RDFS.label)
                comment = g.value(s, RDFS.comment)
                classes.append(
                    {
                        "name": class_name,
                        "label": str(label) if label else "",
                        "comment": str(comment)[:100] if comment else "",
                    }
                )

        # Extract properties
        properties = []
        for s in g.subjects(RDF.type, RDF.Property):
            if str(s).startswith("http://dbpedia.org/ontology/"):
                prop_name = str(s).split("/")[-1]
                label = g.value(s, RDFS.label)
                comment = g.value(s, RDFS.comment)
                domain = g.value(s, RDFS.domain)
                range_val = g.value(s, RDFS.range)

                properties.append(
                    {
                        "name": prop_name,
                        "label": str(label) if label else "",
                        "comment": str(comment)[:100] if comment else "",
                        "domain": str(domain).split("/")[-1] if domain else "",
                        "range": str(range_val).split("/")[-1] if range_val else "",
                    }
                )

        # Format the ontology information
        ontology_text = """DBpedia Ontology Schema

Common Prefixes:
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

Important Usage Notes:
1. Resources use dbr: prefix (e.g., dbr:France, dbr:Albert_Einstein)
2. Use underscores in resource names (e.g., dbr:New_York_City)
3. Always add LIMIT to queries (e.g., LIMIT 10)
4. Use FILTER(lang(?variable) = 'en') for text fields to get English results
5. Property names use camelCase (e.g., birthDate, populationTotal)

Common DBpedia Classes (use with rdf:type or 'a'):
"""
        # Add top classes (limit to most common ones)
        common_classes = [
            "Person",
            "Place",
            "Country",
            "City",
            "Organisation",
            "Company",
            "Film",
            "Book",
            "MusicalArtist",
            "Politician",
            "Athlete",
            "Building",
            "River",
            "Mountain",
        ]

        for cls in classes:
            if cls["name"] in common_classes:
                ontology_text += f"\n- dbo:{cls['name']}"
                if cls["comment"]:
                    ontology_text += f" - {cls['comment']}"

        ontology_text += "\n\nCommon DBpedia Properties:\n"

        # Add important properties
        important_props = [
            "birthDate",
            "birthPlace",
            "deathDate",
            "abstract",
            "populationTotal",
            "capital",
            "leader",
            "leaderName",
            "foundedBy",
            "founder",
            "director",
            "starring",
            "author",
            "nationality",
            "occupation",
            "spouse",
            "child",
            "parent",
            "country",
            "location",
            "area",
            "elevation",
            "length",
        ]

        for prop in properties:
            if prop["name"] in important_props:
                ontology_text += f"\n- dbo:{prop['name']}"
                if prop["domain"]:
                    ontology_text += f" (domain: {prop['domain']})"
                if prop["comment"]:
                    ontology_text += f" - {prop['comment']}"

        ontology_text += """

Example Query Patterns:
- Find person info: SELECT ?name WHERE { dbr:PersonName foaf:name ?name }
- Find with property: SELECT ?value WHERE { dbr:Resource dbo:property ?value }
- Current leader: SELECT ?leader WHERE { dbr:Country dbo:leader ?leader }
- With type filter: SELECT ?label WHERE { ?x a dbo:City ; rdfs:label ?label . FILTER(lang(?label) = 'en') } LIMIT 10
"""

        # Cache the result
        with open(cache_file, "w", encoding="utf-8") as f:
            f.write(ontology_text)

        print(f"Ontology cached to: {cache_file}")
        return ontology_text

    except Exception as e:
        print(f"Error fetching ontology: {e}")
        print("Using fallback minimal schema...")

        # Fallback minimal schema
        return """DBpedia Common Prefixes:
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

Common Classes: Person, Place, Country, City, Organisation, Film
Common Properties: birthDate, populationTotal, capital, leader, abstract
Use LIMIT 10 and FILTER(lang(?var) = 'en') for text fields.
"""


# Global variable to store ontology (loaded once)
dbpedia_schema = None


# Define the signature for NL to SPARQL conversion
class NLtoSPARQL(dspy.Signature):
    """Convert a natural language question into a SPARQL query for DBpedia.

    You have access to the DBpedia schema and ontology information.
    The SPARQL query should:
    - Use the correct DBpedia prefixes and properties from the schema
    - Use dbr: for resources (entities), dbo: for ontology properties
    - Include proper PREFIX declarations at the start
    - Be syntactically correct and executable
    - Use LIMIT to restrict results (e.g., LIMIT 10)
    - Filter for English language when using text fields: FILTER(lang(?var) = 'en')
    - Return relevant results for the question

    IMPORTANT: Return ONLY the SPARQL query without any markdown formatting,
    explanations, or code blocks. No ```sparql or ``` tags.
    """

    schema: str = dspy.InputField(
        desc="DBpedia schema and ontology information including common classes, properties, and patterns"
    )

    natural_language_query: str = dspy.InputField(
        desc="Natural language question to convert to SPARQL"
    )

    sparql_query: str = dspy.OutputField(
        desc="Valid SPARQL query for DBpedia that answers the question. Return ONLY the query without markdown formatting."
    )


# Define the module for converting human language to SPARQL
class HumanLangToSPARQL(dspy.Module):
    """Module to convert natural language queries to SPARQL using DSPy."""

    def __init__(self):
        super().__init__()
        # Use ChainOfThought to improve reasoning about the SPARQL query
        self.prog = dspy.ChainOfThought(NLtoSPARQL)

    def forward(self, natural_language_query: str):
        """
        Convert a natural language query to SPARQL.

        Args:
            natural_language_query: The question in natural language

        Returns:
            Dictionary with the SPARQL query
        """
        result = self.prog(
            schema=dbpedia_schema, natural_language_query=natural_language_query
        )

        # Clean the SPARQL query from markdown formatting
        cleaned_query = clean_sparql_query(result.sparql_query)

        return dspy.Prediction(
            natural_language_query=natural_language_query,
            sparql_query=cleaned_query,
            raw_sparql_query=result.sparql_query,
        )


# Optional: Function to execute SPARQL against DBpedia
def clean_sparql_query(sparql_query: str) -> str:
    """
    Clean SPARQL query by removing markdown formatting and extra whitespace.

    Args:
        sparql_query: Raw SPARQL query that might contain markdown

    Returns:
        Cleaned SPARQL query
    """
    import re

    # Remove markdown code blocks
    sparql_query = re.sub(r"```sparql\s*", "", sparql_query)
    sparql_query = re.sub(r"```\s*", "", sparql_query)

    # Remove any leading/trailing whitespace
    sparql_query = sparql_query.strip()

    return sparql_query


def execute_sparql_query(sparql_query: str) -> dict:
    """
    Execute a SPARQL query against DBpedia endpoint.

    Args:
        sparql_query: The SPARQL query to execute

    Returns:
        Dictionary with query results
    """
    from SPARQLWrapper import SPARQLWrapper, JSON

    # Clean the query first
    cleaned_query = clean_sparql_query(sparql_query)

    sparql = SPARQLWrapper("http://dbpedia.org/sparql")
    sparql.setQuery(cleaned_query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        return results
    except Exception as e:
        return {"error": str(e), "cleaned_query": cleaned_query}


# Optional: Complete pipeline with execution
class NLtoSPARQLPipeline(dspy.Module):
    """Complete pipeline: NL -> SPARQL -> Results"""

    def __init__(self):
        super().__init__()
        self.converter = HumanLangToSPARQL()

    def forward(self, natural_language_query: str, execute: bool = False):
        """
        Convert NL to SPARQL and optionally execute.

        Args:
            natural_language_query: Question in natural language
            execute: Whether to execute the query against DBpedia

        Returns:
            Prediction with SPARQL query and optionally results
        """
        result = self.converter(natural_language_query=natural_language_query)

        prediction = dspy.Prediction(
            natural_language_query=natural_language_query,
            sparql_query=result.sparql_query,
        )

        if execute:
            try:
                query_results = execute_sparql_query(result.sparql_query)
                prediction.results = query_results
            except Exception as e:
                prediction.results = {"error": str(e)}

        return prediction


# Example usage
if __name__ == "__main__":
    # Fetch the DBpedia ontology (cached after first run)
    dbpedia_schema = fetch_dbpedia_ontology(use_cache=True)

    # Initialize the Ollama LM
    lm = OllamaLM(model="qwen2.5-coder:latest", temperature=0.3)

    # Configure DSPy to use this LM
    dspy.settings.configure(lm=lm)

    # Create the complete pipeline
    pipeline = NLtoSPARQLPipeline()

    # Example queries
    test_queries = [
        "Who is the president of France?",
        "What is the capital of Germany?",
        "What is the population of Tokyo?",
        "Who founded Microsoft?",
        "When was Albert Einstein born?",
    ]

    print("=" * 80)
    print("Natural Language to SPARQL Converter with DBpedia Execution")
    print("Using: qwen2.5-coder:latest via Ollama")
    print("=" * 80)
    print()

    for query in test_queries:
        print(f"Question: {query}")
        print("-" * 80)

        try:
            # Generate SPARQL and execute against DBpedia
            result = pipeline(natural_language_query=query, execute=True)

            print(f"SPARQL Query:\n{result.sparql_query}")
            print()

            # Display results from DBpedia
            if hasattr(result, "results"):
                if "error" in result.results:
                    print(f"❌ Execution Error: {result.results['error']}")
                else:
                    print("✓ DBpedia Results:")
                    bindings = result.results.get("results", {}).get("bindings", [])

                    if bindings:
                        # Display first 5 results
                        for i, binding in enumerate(bindings[:5], 1):
                            print(f"  Result {i}:")
                            for var, value in binding.items():
                                print(f"    {var}: {value.get('value', 'N/A')}")
                            print()

                        if len(bindings) > 5:
                            print(f"  ... and {len(bindings) - 5} more results")
                    else:
                        print("  No results found")
            else:
                print("Query not executed")

        except Exception as e:
            print(f"Error: {str(e)}")

        print("=" * 80)
        print()
