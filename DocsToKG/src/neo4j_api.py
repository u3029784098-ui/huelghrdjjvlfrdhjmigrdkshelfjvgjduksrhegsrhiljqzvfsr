from pickle import INST
from matplotlib import table
from neo4j import GraphDatabase
import csv
from datetime import datetime
from graphdatascience import GraphDataScience
import os
from neo4j_graphrag.llm import OllamaLLM, OpenAILLM
from neo4j import GraphDatabase
from neo4j_graphrag.generation import GraphRAG
from neo4j_graphrag.retrievers import Text2CypherRetriever
from typing import Dict, List, Union
from langchain_core.documents import Document
from langchain.chat_models import init_chat_model
from langgraph.graph import START, StateGraph
from langchain_core.prompts import PromptTemplate
from typing_extensions import List, TypedDict, Tuple, Optional
from langchain_neo4j import Neo4jGraph
from langchain_neo4j import GraphCypherQAChain
from rdflib import Graph
from rdflib_neo4j import Neo4jStoreConfig, Neo4jStore, HANDLE_VOCAB_URI_STRATEGY
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_community.graphs.graph_document import Node, Relationship
from tqdm import tqdm
import re
import hashlib

def generate_id(text: str) -> str:
    """Generate a unique ID using hash."""
    return hashlib.md5(text.encode()).hexdigest()


def parse_folder_name(folder_name: str) -> Tuple[Optional[int], Optional[int], str, Optional[str]]:
    """
    Parse folder name in format: l{level}-n{order}-{name}
    Returns: (level, order, clean_name, number_in_name)
    """
    pattern = r'^l(\d+)-n(\d+)-(.+)$'
    match = re.match(pattern, folder_name)
    
    if match:
        level = int(match.group(1))
        order = int(match.group(2))
        name = match.group(3)
        
        # Extract number from name if present (e.g., "2 General design pipeline")
        number_pattern = r'^(\d+(?:\.\d+)*)\s+'
        number_match = re.match(number_pattern, name)
        number = number_match.group(1) if number_match else None
        
        return level, order, name, number
    
    return None, None, folder_name, None


def process_content_file(
    file_path: str,
    parent_id: str,
    driver,
    database: str,
    text_splitter: CharacterTextSplitter,
    embeddings_model,
) -> List[str]:
    """
    Process content.txt file: chunk it, create embeddings, and create nodes.
    Returns list of chunk IDs.
    """
    if not os.path.exists(file_path):
        return []
    
    # Load document
    loader = TextLoader(file_path, encoding='utf-8')
    try:
        docs = loader.load()
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []
    
    # Split into chunks
    chunks = text_splitter.split_documents(docs)
    
    if not chunks:
        return []
    
    chunk_ids = []
    
    with driver.session(database=database) as session:
        # Process each chunk
        for idx, chunk in enumerate(chunks):
            chunk_text = chunk.page_content
            chunk_id = generate_id(f"{parent_id}_chunk_{idx}")
            
            # Generate embedding
            try:
                embedding = embeddings_model.embed_query(chunk_text)
            except Exception as e:
                print(f"Error generating embedding for chunk {idx}: {e}")
                # Use zero vector as fallback
                embedding = [0.0] * 1536
            
            # Create chunk node
            session.run(
                "MERGE (c:Chunk {id: $id}) "
                "SET c.text = $text, c.embedding = $embedding, c.index = $index",
                id=chunk_id, text=chunk_text, embedding=embedding, index=idx
            )
            chunk_ids.append(chunk_id)
            
            # Create HAS relationship from parent to first chunk
            if idx == 0:
                session.run(
                    "MATCH (a {id: $from_id}), (b {id: $to_id}) "
                    "MERGE (a)-[:HAS_CHILD]->(b)",
                    from_id=parent_id, to_id=chunk_id
                )
            
            # Create NEXT relationship between consecutive chunks
            if idx > 0:
                session.run(
                    "MATCH (a {id: $from_id}), (b {id: $to_id}) "
                    "MERGE (a)-[:NEXT]->(b)",
                    from_id=chunk_ids[idx - 1], to_id=chunk_id
                )
    
    return chunk_ids

class Neo4jAPI:
    SUPPORTED_FORMATS = {
        '.owl': 'xml',
        '.rdf': 'xml',
        '.ttl': 'turtle',
        '.n3': 'n3',
        '.nt': 'nt',
        '.nq': 'nquads',
        '.trig': 'trig',
        '.jsonld': 'json-ld',
        '.xml': 'xml'
    }
    def __init__(self, uri, user, password, database="neo4j", aura_ds=False):
        self.driver = GraphDatabase.driver(uri, auth=(user, password), database=database)
        self.database = database
        try:
            self.gds = GraphDataScience(uri, auth=(user, password), database=database, aura_ds=aura_ds)
        except:
            print("GDS requires a local version of Neo4j")

        self.sub_graphs = []

        try:
            self.graph = Neo4jGraph(url=uri, username=user, password=password, database=database)
        except:
            print("Neo4jGraph requires a local version of Neo4j")

        # Create Neo4j store configuration
        self.store_config = Neo4jStoreConfig(
            auth_data={'uri': uri, 'database': database, 
                      'user': user, 'pwd': password},
            custom_prefixes={},
            handle_vocab_uri_strategy=HANDLE_VOCAB_URI_STRATEGY.MAP,
            batching=True
        )
    def _generate_label_from_filename(self, file_path: str) -> str:
        """Generate a Neo4j label from the CSV filename (CamelCase)."""
        base = os.path.basename(file_path)  # e.g. "student_courses.csv"
        name, _ = os.path.splitext(base)  # -> "student_courses"
        parts = name.split("_")  # -> ["student", "courses"]
        return "".join(p.capitalize() for p in parts)  # -> "StudentCourses"

    def load_csv(self, file_path, table_id, table_ref, description="", label=None):
        """Load CSV into Neo4j, link nodes to a global Table node."""
        node_label = label if label else self._generate_label_from_filename(file_path)

        created_at = datetime.utcnow().isoformat()
        updated_at = created_at

        with self.driver.session(database=self.database) as session:
            # Create or merge the global Table node
            session.run(
                """
                MERGE (t:Table {id: $id, reference: $reference})
                ON CREATE SET t.created_at = $created_at,
                              t.updated_at = $updated_at,
                              t.description = $description
                ON MATCH SET  t.updated_at = $updated_at
                """,
                id=table_id,
                reference=table_ref,
                created_at=created_at,
                updated_at=updated_at,
                description=description,
            )

            # Read CSV and create nodes
            with open(file_path, "r") as f:
                reader = csv.DictReader(f, skipinitialspace=True)
                for row in reader:
                    props = ", ".join(f"{key}: ${key}" for key in row.keys())
                    query = f"""
                    CREATE (n:{node_label} {{{props}}})
                    WITH n
                    MATCH (t:Table {{id: $table_id, reference: $table_ref}})
                    CREATE (n)-[:REPRESENTS]->(t)
                    """
                    session.run(query, **row, table_id=table_id, table_ref=table_ref)
    def execute_query(self, query: str, **kwargs):
        """
        Execute any Cypher query and return the results as a list of dictionaries.
        Example:
            results = instance.execute_query("MATCH (n) RETURN n LIMIT 5")
        """
        return self.driver.execute_query(query, database_=self.database, **kwargs)
    
    def create_subgraph(self, graph_name, node_spec, relationship_spec, cypher=False):
        if not cypher:
            result = self.gds.graph.project(
                graph_name=graph_name,
                node_spec=node_spec,
                relationship_spec=relationship_spec
            )
        else:
            result = self.gds.graph.project.cypher(
                graph_name=graph_name,
                node_spec=node_spec,
                relationship_spec=relationship_spec
            )
        return result

    def delete_subgraph(self, graph_name):
        self.gds.graph.drop(graph_name, False)      

    def get_subgraphs(self):
        return self.gds.graph.list()
    
    def get_subgraph_by_name(self, graph_name, columns=None):
        results = self.gds.graph.list(graph_name)

        columns.append("graphName") if (columns is not None and "graphName" not in columns) else columns
        return results[columns] if columns is not None else results
    
    def create_embeddings(self, graph_name, algorithm, **kwargs):
        graph = self.gds.graph.get(graph_name=graph_name)
        if algorithm == "Node2Vec":
            return self.gds.beta.node2vec.write(graph, **kwargs)
        
    def text_query(self, queries, t2c_llm: Dict, llm: Dict, examples=None, lang_chain=False, template=None, cypher_template=None):
        if not lang_chain:
            if t2c_llm["provider"] == "ollama":
                t2c_llm = OllamaLLM(model_name=t2c_llm["model_name"])
            elif t2c_llm["provider"] == "openai":
                t2c_llm = OpenAILLM(model_name=t2c_llm["model_name"])
            if llm["provider"] == "ollama":
                llm = OllamaLLM(model_name=llm["model_name"])
            elif llm["provider"] == "openai":
                llm = OpenAILLM(model_name=llm["model_name"])


            retriever = Text2CypherRetriever(
                driver=self.driver,
                llm=t2c_llm,
                examples=examples,
                neo4j_database=self.database
            )
            # rag = GraphRAG(retriever=retriever, llm=llm)
            results = []
            for query in queries:
                retriever_result = retriever.search(query)
                # Format a better prompt
                context_data = "\n".join([item.content for item in retriever_result.items])
                
                prompt = f"""
                You are a precise text formatter.

                Your task:
                - Read the given Question and Answer.
                - Produce ONE clear, affirmative sentence that explicitly conveys the information from the answer.
                - Do NOT repeat the question text.
                - Do NOT invent or infer anything not in the answer.
                - Use proper grammar, punctuation, and capitalization.
                - If the answer contains multiple facts, combine them into a single coherent statement.

                Question:
                {query}

                Answer:
                {context_data}

                Format your output as:
                <Formatted Sentence>

                Examples:
                Q: Who wrote The Little Prince?
                A: The Little Prince was written by Antoine de Saint-Exupéry.
                → Output: Antoine de Saint-Exupéry wrote The Little Prince.

                Q: What is the capital of Japan?
                A: Japan’s capital city is Tokyo.
                → Output: Tokyo is the capital of Japan.

                Now format the current input:
                """

                answer = llm.invoke(prompt)
                results.append({
                    "query": query,
                    "retriever_result": retriever_result,
                    "answer": answer
                })

            return results
        else:
            if t2c_llm["provider"] == "ollama":
                t2c_llm = OllamaLLM(model_name=t2c_llm["model_name"])
            elif t2c_llm["provider"] == "openai":
                t2c_llm = OpenAILLM(model_name=t2c_llm["model_name"])
            if llm["provider"] == "ollama":
                llm = init_chat_model(llm["model_name"], model_provider="ollama")
            elif llm["provider"] == "openai":
                llm = init_chat_model(llm["model_name"], model_provider="openai")

            template = """Use the following pieces of context to answer the question at the end.
            If you don't know the answer, just say that you don't know, don't try to make up an answer.
            {context}

            Question: {question}

            Answer:""" if template is None else template
            cypher_template = """Task:Generate Cypher statement to query a graph database.
            Instructions:
            Use only the provided relationship types and properties in the schema.
            Do not use any other relationship types or properties that are not provided.
            For movie titles that begin with "The", move "the" to the end, for example "The 39 Steps" becomes "39 Steps, The".
            Exclude NULL values when finding the highest value of a property.

            Schema:
            {schema}
            Examples:
            1. Question: Get user ratings?
            Cypher: MATCH (u:User)-[r:RATED]->(m:Movie) WHERE u.name = "User name" RETURN r.rating AS userRating
            2. Question: Get average rating for a movie?
            Cypher: MATCH (m:Movie)<-[r:RATED]-(u:User) WHERE m.title = 'Movie Title' RETURN avg(r.rating) AS userRating
            3. Question: Get movies for a genre?
            Cypher: MATCH ((m:Movie)-[:IN_GENRE]->(g:Genre) WHERE g.name = 'Genre Name' RETURN m.title AS movieTitle

            Note: Do not include any explanations or apologies in your responses.
            Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
            Do not include any text except the generated Cypher statement.

            The question is:
            {question}""" if cypher_template is None else cypher_template

            prompt = PromptTemplate.from_template(template)

            class State(TypedDict):
                question: str
                context: List[dict]
                answer: str
            
            cypher_prompt = PromptTemplate(
                input_variables=["schema", "question"], 
                template=cypher_template
            )
            cypher_qa = GraphCypherQAChain.from_llm(
                graph=self.graph, 
                llm=llm, 
                cypher_prompt=cypher_prompt,
                allow_dangerous_requests=True,
                verbose=True,
            )
            def retrieve(state: State):
                context = cypher_qa.invoke(
                    {"query": state["question"]}
                )
                return {"context": context}

            # Generate the answer based on the question and context
            def generate(state: State):
                messages = prompt.invoke({"question": state["question"], "context": state["context"]})
                response = llm.invoke(messages)
                return {"answer": response.content}
            
            workflow = StateGraph(State).add_sequence([retrieve, generate])
            workflow.add_edge(START, "retrieve")
            app = workflow.compile()
            response = [app.invoke({"question": question}) for question in queries]

            return response
    def load_semantic_data(self, folder_path):
        """
        Load semantic data files from a folder into Neo4j.
        Supports OWL, RDF, TTL, N3, NT, NQ, TriG, and JSON-LD formats.
        
        Args:
            folder_path (str): Path to folder containing semantic data files
            
        Returns:
            dict: Summary of loaded files with statistics
        """
        folder = Path(folder_path)
        
        if not folder.exists():
            raise FileNotFoundError(f"Folder not found: {folder_path}")
        
        if not folder.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {folder_path}")
        
        results = {
            'loaded_files': [],
            'failed_files': [],
            'total_triples': 0
        }
        
        # Find all supported files
        semantic_files = []
        for ext in self.SUPPORTED_FORMATS.keys():
            semantic_files.extend(folder.glob(f'*{ext}'))
        
        if not semantic_files:
            print(f"No semantic data files found in {folder_path}")
            return results
        
        print(f"Found {len(semantic_files)} semantic data file(s)")
        
        # Create Neo4j store
        neo4j_store = Neo4jStore(config=self.store_config)
        
        try:
            # Load each file
            for file_path in semantic_files:
                try:
                    triples_loaded = self._load_file(file_path, neo4j_store)
                    results['loaded_files'].append({
                        'file': file_path.name,
                        'triples': triples_loaded
                    })
                    results['total_triples'] += triples_loaded
                    print(f"✓ Loaded {file_path.name}: {triples_loaded} triples")
                except Exception as e:
                    results['failed_files'].append({
                        'file': file_path.name,
                        'error': str(e)
                    })
                    print(f"✗ Failed to load {file_path.name}: {e}")
            change_label_query = """MATCH (n)
            WHERE n.uri CONTAINS "#"
            RETURN n;
            """
            self.execute_query(change_label_query)
            
        finally:
            neo4j_store.close()
        
        return results
    
    def _load_file(self, file_path, neo4j_store=None):
        """
        Load a single semantic data file into Neo4j.
        
        Args:
            file_path (Path): Path to the semantic data file
            neo4j_store (Neo4jStore): Existing store or None to create new one
            
        Returns:
            int: Number of triples loaded
        """
        file_ext = file_path.suffix.lower()
        format_type = self.SUPPORTED_FORMATS.get(file_ext, 'xml')
        
        # Create temporary RDF graph to parse the file
        temp_graph = Graph()
        
        # Parse the file
        temp_graph.parse(str(file_path), format=format_type)
        triples_count = len(temp_graph)
        
        # Create or use existing Neo4j store
        close_store = False
        if neo4j_store is None:
            neo4j_store = Neo4jStore(config=self.store_config)
            close_store = True
        
        try:
            # Create graph with Neo4j store
            neo4j_graph = Graph(store=neo4j_store)
            
            # Add all triples to Neo4j
            for triple in temp_graph:
                neo4j_graph.add(triple)
            
            return triples_count
        finally:
            if close_store:
                neo4j_store.close()
    
    def load_from_url(self, url, format_type='xml'):
        """
        Load semantic data directly from a URL.
        
        Args:
            url (str): URL of the semantic data file
            format_type (str): RDF format (default: 'xml')
            
        Returns:
            int: Number of triples loaded
        """
        # Create temporary RDF graph
        temp_graph = Graph()
        temp_graph.parse(url, format=format_type)
        triples_count = len(temp_graph)
        
        # Create Neo4j store and graph
        neo4j_store = Neo4jStore(config=self.store_config)
        
        try:
            neo4j_graph = Graph(store=neo4j_store)
            
            # Add all triples to Neo4j
            for triple in temp_graph:
                neo4j_graph.add(triple)
            
            print(f"Loaded {triples_count} triples from {url}")
            return triples_count
        finally:
            neo4j_store.close()
    
    def load_from_string(self, rdf_string, format_type='xml'):
        """
        Load semantic data from a string.
        
        Args:
            rdf_string (str): RDF data as string
            format_type (str): RDF format (default: 'xml')
            
        Returns:
            int: Number of triples loaded
        """
        # Create temporary RDF graph
        temp_graph = Graph()
        temp_graph.parse(data=rdf_string, format=format_type)
        triples_count = len(temp_graph)
        
        # Create Neo4j store and graph
        neo4j_store = Neo4jStore(config=self.store_config)
        
        try:
            neo4j_graph = Graph(store=neo4j_store)
            
            # Add all triples to Neo4j
            for triple in temp_graph:
                neo4j_graph.add(triple)
            
            print(f"Loaded {triples_count} triples from string")
            return triples_count
        finally:
            neo4j_store.close()
    
    def create_lexical_graph(self, folder_path, 
                            separator="\n\n", 
                            chunk_size=1500, 
                            chunk_overlap=200, 
                            embedding_provider: Dict = None, 
                            llm: Dict = None,
                            vector_dim=1536, 
                            vector_sim_func="cosine",
                            level_labels=["H1", "H2", "H3", "H4", "H5", "H6"],
                            meta_label: str = "LexicalGraph"):
        """
        Create a knowledge graph from text files with hierarchical section structure.
        Supports Document -> Section -> Subsection -> Subsubsection -> Chunk hierarchy.
        
        Args:
            folder_path: Path to the root folder
            separator: Text separator for chunking
            chunk_size: Size of each chunk
            chunk_overlap: Overlap between chunks
            embedding_provider: Dict with 'type' and 'model_name' for embeddings
            llm: Dict with 'type' and 'model_name' for LLM
            vector_dim: Dimension of embedding vectors
            vector_sim_func: Similarity function for vector index (cosine, euclidean)
            level_labels: Labels for each level (H1, H2, etc.)
        """
        # Load all documents
        loader = DirectoryLoader(folder_path, glob="**/*.txt")
        docs = loader.load()
        
        # Initialize text splitter
        text_splitter = CharacterTextSplitter(
            separator=separator,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        
        # Initialize embedding provider
        if embedding_provider and embedding_provider["provider"] == "ollama":
            embedding_model = OllamaEmbeddings(
                model=embedding_provider["model_name"]
            )
        else:
            raise ValueError("embedding_provider must be specified with type 'ollama'")
        
        # Initialize LLM (if needed for graph transformation)
        if llm and llm["provider"] == "ollama":
            llm_model = ChatOllama(model=llm["model_name"])
            doc_transformer = LLMGraphTransformer(llm=llm_model)
        else:
            llm_model = None
            doc_transformer = None
        
        with self.driver.session(database=self.database) as session:
            # Create vector index
            try:
                session.run("DROP INDEX chunk_embedding_index IF EXISTS")
            except:
                pass
            
            session.run(
                f"CREATE VECTOR INDEX chunk_embedding_index IF NOT EXISTS "
                f"FOR (c:Chunk) ON c.embedding "
                f"OPTIONS {{indexConfig: {{`vector.dimensions`: {vector_dim}, "
                f"`vector.similarity_function`: '{vector_sim_func}'}}}}"
            )
            
            # Create root document node
            folder_name = os.path.basename(folder_path)
            doc_id = generate_id(folder_name)
            
            session.run(
                "MERGE (d:Document {id: $id}) "
                "SET d.name = $name",
                id=doc_id, name=folder_name
            )
        
        # Process root content.txt if exists
        root_content_path = os.path.join(folder_path, "content.txt")
        if os.path.exists(root_content_path):
            process_content_file(
                root_content_path, 
                doc_id, 
                self.driver,
                self.database,
                text_splitter,
                embedding_model
            )
        
        # Track nodes at each level for NEXT relationships
        level_nodes: Dict[int, List[Tuple[int, str, str]]] = {}  # level -> [(order, id, name)]
        
        # Recursively process subfolders
        def process_folder(current_path: str, parent_id: str, parent_level: Optional[int] = None, meta_label: str = "LexicalGraph"):
            """Recursively process folders and create nodes."""
            try:
                items = sorted(os.listdir(current_path))
            except Exception as e:
                print(f"Error listing directory {current_path}: {e}")
                return
            
            for item in items:
                item_path = os.path.join(current_path, item)
                
                if os.path.isdir(item_path):
                    # Parse folder name
                    level, order, name, number = parse_folder_name(item)
                    
                    if level is not None:
                        # Determine label
                        if level < len(level_labels):
                            label = level_labels[level]
                        else:
                            label = f"H{level + 1}"
                        
                        # Create node ID
                        node_id = generate_id(item_path)
                        
                        # Create heading node
                        with self.driver.session(database=self.database) as session:
                            query = f"MERGE (n:{label}:{meta_label} {{id: $id}}) SET n.name = $name"
                            params = {"id": node_id, "name": name}
                            
                            if number:
                                query += ", n.number = $number"
                                params["number"] = number
                            
                            session.run(query, **params)
                        
                        # Track node for NEXT relationships
                        if level not in level_nodes:
                            level_nodes[level] = []
                        level_nodes[level].append((order, node_id, name))
                        
                        # Create HAS_CHILD relationship from parent
                        # Only create if this is direct child (no intermediate level)
                        if parent_level is None or level == parent_level + 1:
                            with self.driver.session(database=self.database) as session:
                                session.run(
                                    "MATCH (a {id: $from_id}), (b {id: $to_id}) "
                                    "MERGE (a)-[:HAS_CHILD]->(b)",
                                    from_id=parent_id, to_id=node_id
                                )
                        
                        # Process content.txt in this folder
                        content_path = os.path.join(item_path, "content.txt")
                        if os.path.exists(content_path):
                            process_content_file(
                                content_path, 
                                node_id, 
                                self.driver,
                                self.database,
                                text_splitter,
                                embedding_model
                            )
                        
                        # Recursively process subfolders
                        process_folder(current_path=item_path, parent_id=node_id, parent_level=level, meta_label=meta_label)
        
        # Process all subfolders
        process_folder(folder_path, doc_id, meta_label=meta_label)
        
        # Create NEXT relationships between nodes at same level
        with self.driver.session(database=self.database) as session:
            for level, nodes in level_nodes.items():
                # Sort by order
                sorted_nodes = sorted(nodes, key=lambda x: x[0])
                
                # Create NEXT relationships
                for i in range(len(sorted_nodes) - 1):
                    current_id = sorted_nodes[i][1]
                    next_id = sorted_nodes[i + 1][1]
                    session.run(
                        "MATCH (a {id: $from_id}), (b {id: $to_id}) "
                        "MERGE (a)-[:NEXT]->(b)",
                        from_id=current_id, to_id=next_id
                    )
        
        print(f"Knowledge graph created successfully for: {folder_name}")
        print(f"Total levels processed: {len(level_nodes)}")
        for level, nodes in sorted(level_nodes.items()):
            label = level_labels[level] if level < len(level_labels) else f"H{level+1}"
            print(f"  Level {level} ({label}): {len(nodes)} nodes")



    def close(self):
        self.driver.close()




NEO4J_URI="neo4j+s://0e0b1a48.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="WwO7UslE8DzciMfGWIM4qkcp3scqb4j-ZtuGL_RMyo0"
NEO4J_DATABASE="neo4j"
AURA_INSTANCEID="0e0b1a48"
AURA_INSTANCENAME="Instance03"
instance = Neo4jAPI(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE, aura_ds=True)

instance.create_lexical_graph("../results/hierarchy/hierarchy_sample_1", embedding_provider={"provider": "ollama", "model_name": "llama3.1:latest"}, llm={"provider": "ollama", "model_name": "llama3.1:latest"})


# instance.close()


# instance.load_csv(
#     "data/Course.csv",
#     label="Course",
#     table_id="1",
#     table_ref="Table 1.1",
#     description="Course information",
# )

# results = instance.create_subgraph('proj3',
#   """MATCH (p:Person) RETURN id(p) AS id
#   UNION
#   MATCH (i:Instrument) RETURN id(i) AS id
#   """,
#   """MATCH (p:Person)-[r:LIKES]->(i:Instrument) 
#    WHERE r.rating > 2.0
#    RETURN id(p) AS source, id(i) AS target, r.rating AS rating""",   {
#     "relationshipProperties": ['rating'],
#     "relationshipType": 'LIKES'
#   }, cypher=True)
# kwargs = {
#     "writeProperty": "embedding",
#     "embeddingDimension":256,      # size of embedding vector
#     "walkLength":10,              # length of each random walk
#     "iterations":1000,               # number of walks per node
#     "returnFactor":1.0,           # p parameter
# }
# print(instance.create_embeddings("proj", "Node2Vec", **kwargs))
# print(results)
# conf = instance.get_subgraph_by_name("proj", columns=["configuration"])
# node_query, rel_query = conf.at[0, "configuration"]["nodeQuery"], conf.at[0, "configuration"]["relationshipQuery"]
# print(node_query.split("UNION"))
# instance.load_semantic_data("data/ontologies")

# response = instance.text_query(queries=["How many quarks a proton has ?"], t2c_llm={"provider": "ollama", "model_name": "qwen2.5-coder:latest"}, llm={"provider": "ollama", "model_name": "llama3.1:latest"}, lang_chain=True)
# print(response)
# change_label_query = """MATCH (n)
#             WHERE n.uri CONTAINS "#"
#             RETURN n;
#             """
# res = instance.execute_query(change_label_query)
# print(res)




        #     # Split document into chunks
        #     chunks = text_splitter.split_documents([doc])
    

        # # Create the vector index
        # self.graph.query(f"""
        #     CREATE VECTOR INDEX IF NOT EXISTS `vector`
        #     FOR (c:Chunk) ON (c.textEmbedding)
        #     OPTIONS {{
        #         indexConfig: {{
        #             `vector.dimensions`: {vector_dim},
        #             `vector.similarity_function`: '{vector_sim_func}'
        #         }}
        #     }}
        # """)

        # # Generate entities and relationships from chunks using LLM
        
        # chunks = text_splitter.split_documents(docs)
        # for chunk in tqdm(chunks, desc="Extracting entities"):
        #     filename = os.path.basename(chunk.metadata["source"]).split(".")[0]
        #     chunk_id = f"{filename}.{chunk.metadata.get('chunk_index', 0)}"
            
        #     graph_docs = doc_transformer.convert_to_graph_documents([chunk])
            
        #     for graph_doc in graph_docs:
        #         chunk_node = Node(id=chunk_id, type="Chunk")
                
        #         for node in graph_doc.nodes:
        #             graph_doc.relationships.append(
        #                 Relationship(
        #                     source=chunk_node,
        #                     target=node, 
        #                     type="HAS_ENTITY"
        #                 )
        #             )
            
        #     self.graph.add_graph_documents(graph_docs)