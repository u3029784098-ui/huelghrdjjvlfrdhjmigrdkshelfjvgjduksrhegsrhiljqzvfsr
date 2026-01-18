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
from typing_extensions import List, TypedDict
from langchain_neo4j import Neo4jGraph
from langchain_neo4j import GraphCypherQAChain
from rdflib import Graph
from rdflib_neo4j import Neo4jStoreConfig, Neo4jStore, HANDLE_VOCAB_URI_STRATEGY
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_community.graphs.graph_document import Node, Relationship
from tqdm import tqdm


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
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.database = database
        self.gds = GraphDataScience(uri, auth=(user, password), database=database, aura_ds=aura_ds)
        self.sub_graphs = []
        self.graph = Neo4jGraph(url=uri, username=user, password=password, database=database)
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
            if t2c_llm["type"] == "ollama":
                t2c_llm = OllamaLLM(model_name=t2c_llm["model_name"])
            elif t2c_llm["type"] == "openai":
                t2c_llm = OpenAILLM(model_name=t2c_llm["model_name"])
            if llm["type"] == "ollama":
                llm = OllamaLLM(model_name=llm["model_name"])
            elif llm["type"] == "openai":
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
            if t2c_llm["type"] == "ollama":
                t2c_llm = OllamaLLM(model_name=t2c_llm["model_name"])
            elif t2c_llm["type"] == "openai":
                t2c_llm = OpenAILLM(model_name=t2c_llm["model_name"])
            if llm["type"] == "ollama":
                llm = init_chat_model(llm["model_name"], model_provider="ollama")
            elif llm["type"] == "openai":
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
    
    def create_knowledge_graph(self, folder_path, 
                               separator="\n\n", 
                               chunk_size=1500, 
                               chunk_overlap=200, 
                               embedding_provider:Dict = None, 
                               llm:Dict = None,
                               vector_dim=1536, 
                               vector_sim_func = "cosine"):
        loader = DirectoryLoader(folder_path, glob="**/*.txt")
        docs = loader.load()
        text_splitter = CharacterTextSplitter(
            separator=separator,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        chunks = text_splitter.split_documents(docs)

        if embedding_provider["type"] == "ollama":
            embedding_provider = OllamaEmbeddings(
                model=embedding_provider["model_name"]
            )
        if llm["type"] == "ollama":
            llm = OllamaEmbeddings(
                model = llm["model_name"]
            )
        id = 0
        for chunk in tqdm(chunks, desc="Number of chunks created", total=len(chunks)):
            # Extract the filename
            filename = os.path.basename(chunk.metadata["source"]).split(".")[0]

            # Create a unique identifier for the chunk    
            chunk_id = f"{filename}.{id}"

            # Embed the chunk
            chunk_embedding = embedding_provider.embed_query(chunk.page_content)

            # Add the Document and Chunk nodes to the graph
            properties = {
                "filename": filename,
                "chunk_id": chunk_id,
                "text": chunk.page_content,
                "textEmbedding": chunk_embedding
            }

            self.graph.query("""
                MERGE (d:Document {id: $filename})
                MERGE (c:Chunk {id: $chunk_id})
                SET c.text = $text
                MERGE (d)<-[:PART_OF]-(c)
                WITH c
                CALL db.create.setNodeVectorProperty(c, 'textEmbedding', $textEmbedding)
                """, 
                properties
            )

            if id !=0 :
                # Create NEXT_CHUNK relationship
                self.execute_query(f"""
                    MATCH (c1:Chunk {{id: '{filename}.{id-1}'}}),
                        (c2:Chunk {{id: '{filename}.{id}'}})
                    MERGE (c1)-[r:NEXT_CHUNK]->(c2);
                """)
            id += 1

        # Create the vector index
        self.graph.query(f"""
            CREATE VECTOR INDEX `vector`
            FOR (c:Chunk) ON (c.embedding)
            OPTIONS {{
                indexConfig: {{
                    `vector.dimensions`: {vector_dim},
                    `vector.similarity_function`: '{vector_sim_func}'
                }}
            }};
        """)



        doc_transformer = LLMGraphTransformer(
            llm=llm,
        )

        for chunk in chunks:
            # Generate the entities and relationships from the chunk
            graph_docs = doc_transformer.convert_to_graph_documents([chunk])
        for chunk in chunks:
            
            filename = os.path.basename(chunk.metadata["source"]).split(".")[0]
            chunk_id = f"{filename}.{chunk.metadata["page"]}"

            graph_docs = doc_transformer.convert_to_graph_documents([chunk])

            # Map the entities in the graph documents to the chunk node
            for graph_doc in graph_docs:
                chunk_node = Node(
                    id=chunk_id,
                    type="Chunk"
                )

                for node in graph_doc.nodes:

                    graph_doc.relationships.append(
                        Relationship(
                            source=chunk_node,
                            target=node, 
                            type="HAS_ENTITY"
                            )
                        )

            # add the graph documents to the graph
            self.graph.add_graph_documents(graph_docs)
    def close(self):
        self.driver.close()


NEO4J_URI = "neo4j://127.0.0.1:7687"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "battwin1234*"
NEO4J_DATABASE = "textkg"
AURA_INSTANCEID = "7e180123"
AURA_INSTANCENAME = "Instance01"
instance = Neo4jAPI(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE)

instance.create_knowledge_graph("data/text", embedding_provider={"type": "ollama", "model_name": "llama3.1:latest"}, llm={"type": "ollama", "model_name": "llama3.1:latest"})

instance.close()


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

# response = instance.text_query(queries=["How many quarks a proton has ?"], t2c_llm={"type": "ollama", "model_name": "qwen2.5-coder:latest"}, llm={"type": "ollama", "model_name": "llama3.1:latest"}, lang_chain=True)
# print(response)
# change_label_query = """MATCH (n)
#             WHERE n.uri CONTAINS "#"
#             RETURN n;
#             """
# res = instance.execute_query(change_label_query)
# print(res)