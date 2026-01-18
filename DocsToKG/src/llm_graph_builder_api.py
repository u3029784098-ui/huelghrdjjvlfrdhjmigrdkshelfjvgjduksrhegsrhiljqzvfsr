import requests
import os
import json
import neo4j_api
import pickle
import subprocess

class LLMGraphBuilderAPI:
    def __init__(self, username, password, database, url, neo4j_uri, aura_ds=True):
        self.username = username
        self.password = password
        self.database = database
        self.url = url
        self.headers = {
            "accept": "application/json, text/plain, */*",
            "Origin": "https://llm-graph-builder.neo4jlabs.com",
            "Referer": "https://llm-graph-builder.neo4jlabs.com/",
            "User-Agent": "Mozilla/5.0"
        }
        self.neo4j_api = neo4j_api.Neo4jAPI(uri=neo4j_uri, user=username, password=password, database=database, aura_ds=aura_ds)


    def _get_element_ids(self, query):
        all_nodes = self.neo4j_api.execute_query(query)
        element_ids = {all_nodes[0][i]["n"].element_id for i in range(len(all_nodes[0]))}

        return element_ids

    def upload_file(self, file_path):
        url = f"{self.url}/upload"
        
        file_name = os.path.basename(file_path)

        # Fields required by the backend
        data = {
            "chunkNumber": "1",
            "totalChunks": "1",
            "originalname": file_name,
            "uri": self.uri,
            "database": self.database,
            "userName": self.username,
            "password": self.password
        }

        with open(file_path, "rb") as f:
            files = {
                "file": (file_name, f, "application/octet-stream")
            }

            print("Uploading...")

            response = requests.post(
                url,
                headers=self.headers,
                data=data,
                files=files
            )

        print("Status:", response.status_code)
        try:
            print("Response:", response.json())
        except:
            print(response.text)

        return response
    
    def delete_file(self, filenames, source_types, delete_entities=True):
        """
        Delete documents and optionally their associated entities from LLM Graph Builder.

        Args:
            filenames (list): List of file names to delete.
            source_types (list): List of source types (e.g., ["local file"]).
            delete_entities (bool): Whether to also delete the entities

        Returns:
            dict: Response from the server
        """
        url = f"{self.url}/delete_document_and_entities"

        # Prepare multipart form data
        data = {
            'deleteEntities': str(delete_entities).lower(),  # "true" or "false"
            'filenames': json.dumps(filenames),
            'source_types': json.dumps(source_types),
            'uri': self.uri,
            'database': self.database,
            'userName': self.username,
            'password': self.password
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                data=data,
                timeout=120
            )
            response.raise_for_status()
            return {
                'success': True,
                'status_code': response.status_code,
                'response': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'status_code': getattr(e.response, 'status_code', None),
                'response': getattr(e.response, 'text', None)
            }


    def generate_graph(
        self,
        file_name,
        tmp_results = None,
        model="openai_gpt_4.1",
        allowed_nodes=None,
        allowed_relationship=None,
        token_chunk_size=200,
        chunk_overlap=10,
        chunks_to_combine=1,
        retry_condition=None,
        additional_instructions=None,
        source_type="local file",
    ):
        """
        Generate a semantic graph from a document using LLM Graph Builder.

        Args:
            file_name (str): Name of the uploaded file to process.
            model (str): LLM model to use (default "openai_gpt_4.1").
            allowed_nodes (list): Optional list of allowed node types.
                Example: ["Person", "Organization", "Location"]
            allowed_relationship (list): Optional list of allowed relationships as triplets.
                IMPORTANT: Must be in format [source_type, relationship, target_type, ...]
                Example: ["Person", "WORKS_AT", "Organization", "Person", "LIVES_IN", "Location"]
                Length must be a multiple of 3.
            token_chunk_size (int): Size of token chunks.
            chunk_overlap (int): Number of overlapping tokens between chunks.
            chunks_to_combine (int): Number of chunks to combine.
            retry_condition (str): Optional retry instructions.
            additional_instructions (str): Optional semantic processing instructions.
            source_type (str): Source type of the file (default "local file").

        Returns:
            dict: Response from the server
        """
        url = f"{self.url}/extract"

        # Validate allowed_relationship format
        if allowed_relationship is not None:
            if len(allowed_relationship) % 3 != 0:
                return {
                    "success": False,
                    "error": f"allowed_relationship must be a multiple of 3. Got {len(allowed_relationship)} items. "
                            f"Format: [source_type, relationship, target_type, ...]",
                    "status_code": None,
                    "response": None
                }

        data = {
            "model": model,
            "source_type": source_type,
            "file_name": file_name,
            "uri": self.uri,
            "database": self.database,
            "userName": self.username,
            "password": self.password,
            "token_chunk_size": token_chunk_size,
            "chunk_overlap": chunk_overlap,
            "chunks_to_combine": chunks_to_combine,
            "allowedNodes": allowed_nodes,
            "allowedRelationship": allowed_relationship,
            "retry_condition": retry_condition or "",
            "additional_instructions": additional_instructions or ""
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                data=data,
                timeout=300  # Allow up to 5 minutes
            )
            response.raise_for_status()
            if not os.path.exists(tmp_results):
                # Expand the tilde to the full home directory path
                tmp_results = os.path.expanduser(tmp_results)

                # Ensure the parent directory exists
                os.makedirs(os.path.dirname(tmp_results), exist_ok=True)
                empty_set = set()
                # Save it to a pickle file
                with open(tmp_results, "wb") as f:
                    pickle.dump(empty_set, f)

            if os.path.exists(tmp_results):
                with open(tmp_results, "rb") as f:
                    old_element_ids = pickle.load(f)

                all_element_ids = self._get_element_ids("MATCH (n) WHERE NOT n:LexicalGraph RETURN n;")
                new_element_ids = all_element_ids - old_element_ids

                with open(tmp_results, "wb") as f:
                    pickle.dump(all_element_ids, f)
                
                # Remove the __Entity__ label from all the nodes
                self.neo4j_api.execute_query("MATCH (n:__Entity__) REMOVE n:__Entity__;")

                # Remove the Existing chunks from the new elements
                # Prepare the delete query
                query = """
                MATCH (n:Chunk)
                WHERE elementId(n) IN $ids
                DETACH DELETE n;
                """
                # Execute the deletion
                self.neo4j_api.execute_query(query, ids=list(new_element_ids))

                # Prepare the query to add a label
                query = """
                MATCH (n)
                WHERE elementId(n) IN $ids AND NOT n:Document
                SET n:DomainGraph
                RETURN count(n) AS updatedCount;
                """

                # Execute the query
                self.neo4j_api.execute_query(query, ids=list(new_element_ids))

                # Link the lexical graph to the domain graph
                # Select only the chunks
                query = """
                MATCH (n:Chunk)
                RETURN n;
                """
                chunks = self.neo4j_api.execute_query(query)[0]

                query = """
                MATCH (n:DomainGraph)
                WHERE elementId(n) IN $ids
                RETURN n;
                """
                new_element_nodes = self.neo4j_api.execute_query(query, ids=list(new_element_ids))[0]

                for chunk in chunks:
                    for new_elem in new_element_nodes:
                        # Check if the element ID is in the chunk text

                        if new_elem["n"]["id"] in chunk["n"]["text"]:
                            # Cypher query to create PART_OF relationship
                            query = """
                            MATCH (e), (c)
                            WHERE elementId(e) = $elem_id AND elementId(c) = $chunk_id
                            MERGE (e)-[:PART_OF]->(c)
                            """
                            # Execute the query with parameters
                            self.neo4j_api.execute_query(
                                query,
                                elem_id=new_elem["n"].element_id,
                                chunk_id=chunk["n"].element_id
                            )

                    
            return {
                "success": True,
                "status_code": response.status_code,
                "response": response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "status_code": getattr(e.response, "status_code", None),
                "response": getattr(e.response, "text", None)
            }
        

    def graph_post_process(self, tasks):
        """
        Run post-processing tasks on the generated graph.

        Args:
            tasks (list): List of post-processing tasks to execute.
                Example:
                [
                    "materialize_text_chunk_similarities",
                    "enable_hybrid_search_and_fulltext_search_in_bloom",
                    "materialize_entity_similarities",
                    "graph_schema_consolidation"
                ]

        Returns:
            dict: API response with success flag, status code, and server response.
        """

        url = f"{self.url}/post_processing"
        url = url.replace("prodbackend", "prod-backend")

        # Ensure tasks is a list
        if not isinstance(tasks, list):
            return {
                "success": False,
                "error": "tasks must be a list of strings",
                "status_code": None,
                "response": None
            }

        # Prepare multipart form-data payload (as Chrome DevTools shows)
        data = {
            "tasks": tasks,
            "uri": self.uri,
            "database": self.database,
            "userName": self.username,
            "password": self.password
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                data=data,
                timeout=200
            )
            response.raise_for_status()

            return {
                "success": True,
                "status_code": response.status_code,
                "response": response.json()
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "status_code": getattr(e.response, "status_code", None),
                "response": getattr(e.response, "text", None)
            }


# Example usage
if __name__ == "__main__":
    url = "https://prodprocessing-backend-967196130891.us-central1.run.app"
    file_path = "Neo4j-3e96bf6c-Created-2025-11-26.txt"
    username = "neo4j"
    password = "WwO7UslE8DzciMfGWIM4qkcp3scqb4j-ZtuGL_RMyo0"
    database = "neo4j"
    neo4j_uri = "neo4j+s://0e0b1a48.databases.neo4j.io"

    llm_graph_builder = LLMGraphBuilderAPI(
        username=username,
        password=password,
        database=database,
        url=url,
        neo4j_uri=neo4j_uri
    )
    
    # Example 1: No restrictions (let the LLM decide)
    # response = llm_graph_builder.generate_graph("chunk_12.txt")
    
    # Example 2: With node restrictions
    # allowed_nodes = ["Person", "Organization", "Location", "Event", "Concept"]
    # response = llm_graph_builder.generate_graph(
    #     "chunk_12.txt",
    #     allowed_nodes=allowed_nodes
    # )
    
    # Example 3: With node and relationship restrictions
    allowed_nodes = ""
    allowed_relationship = ""
    additional_instructions = """
You are a sophisticated semantic analysis engine designed to perform comprehensive entity extraction and relationship identification from any given text. Your primary function is to analyze the raw semantic content while systematically disregarding all aspects related to text structure, formatting, and linguistic presentation.

ENTITY EXTRACTION PROTOCOL:

Conduct deep semantic analysis to identify all meaningful entities present in the text. An entity is defined as any distinct, conceptually significant element that carries substantive meaning within the domain context. Your entity identification process should follow these principles:

- Scan for conceptually discrete elements that represent concrete or abstract objects, living beings, concepts, occurrences, quantities, or states
- Identify entities based on their semantic significance and contextual relevance rather than surface-level mentions
- Establish canonical representations for each entity that capture their essential meaning, consolidating all textual variations and references to the same conceptual element
- Categorize entities according to their fundamental nature and primary characteristics within the semantic landscape
- Apply consistent typological classification that reflects the entity's core identity and functional role
- Prioritize extraction of entities that demonstrate contextual importance and relational potential

ENTITY CATEGORIZATION FRAMEWORK:

Classify each identified entity into appropriate semantic categories based on comprehensive analysis of:
- The entity's inherent properties and characteristics
- Its functional role within the contextual narrative
- Its relationships with other elements in the semantic space
- Its categorical attributes and classificatory features

Ensure categorization reflects the most specific and semantically accurate type assignment possible.

RELATIONSHIP EXTRACTION METHODOLOGY:

Execute thorough relationship mining by analyzing how entities interact, connect, and associate within the semantic framework. Relationship identification must adhere to these guidelines:

- Detect authentic semantic connections that represent meaningful interactions between entities
- Analyze the nature and directionality of each relationship to establish proper source-target mapping
- Formulate relationship labels using precise, semantically rich verb phrases that accurately capture the connection essence
- Prioritize relationships that demonstrate substantive conceptual linkage over incidental co-occurrence
- Evaluate relationship strength based on contextual significance and semantic depth

RELATIONSHIP TYPOLOGY CONSIDERATIONS:

Identify relationships that encompass diverse semantic connection types including but not limited to:
- Functional interactions and operational dependencies
- Hierarchical structures and organizational frameworks
- Causal chains and influence networks
- Temporal sequences and historical connections
- Spatial configurations and geographical relationships
- Conceptual associations and taxonomic classifications
- Compositional relationships and structural dependencies
- Affiliative connections and membership associations

SEMANTIC PROCESSING CONSTRAINTS:

You must rigorously exclude and ignore the following elements during analysis:

- All text formatting features including fonts, styles, colors, and layout attributes
- Structural markers such as paragraphs, sections, headings, bullet points, and numbering
- Lexical and meta-textual elements including titles, subtitles, captions, and labels
- Grammatical structures and syntactic patterns that don't contribute to core meaning
- Textual organization and presentation aspects
- Chunk boundaries and document segmentation
- Linguistic styling and rhetorical devices
- Surface-level co-occurrence patterns without semantic foundation

ANALYSIS DEPTH REQUIREMENTS:

Perform multi-layered semantic analysis that:
- Penetrates beyond surface text to uncover deep semantic structures
- Identifies implicit relationships and contextual connections
- Recognizes conceptual patterns and domain-specific frameworks
- Maintains consistency in entity resolution across the entire text
- Ensures relational accuracy through contextual verification
- Validates extracted elements against semantic coherence principles

OUTPUT QUALITY ASSURANCE:

Ensure all extracted entities and relationships meet these quality standards:
- Semantic relevance to the core content and domain context
- Conceptual clarity and unambiguous representation
- Relational accuracy and directional precision
- Typological consistency and classificatory appropriateness
- Comprehensive coverage of significant semantic elements
- Elimination of redundant or trivial connections
- Integration into a coherent knowledge structure

Process the input text through this comprehensive semantic analysis framework to construct a complete representation of the conceptual landscape, focusing exclusively on meaningful entities and their authentic relationships while systematically excluding all presentational and structural artifacts.
    """
    
    response = llm_graph_builder.generate_graph(
        "chunk_12.txt",
        tmp_results="~/.luminah/tmp_nodes.pkl",
        allowed_nodes=allowed_nodes,
        allowed_relationship=allowed_relationship,
        additional_instructions=additional_instructions
    )
    # response = llm_graph_builder.graph_post_process(["materialize_text_chunk_similarities","enable_hybrid_search_and_fulltext_search_in_bloom","materialize_entity_similarities"])
    # print(response)