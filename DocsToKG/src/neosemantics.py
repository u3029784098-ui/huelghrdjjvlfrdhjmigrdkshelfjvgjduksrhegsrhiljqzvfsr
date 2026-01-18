
from neo4j import GraphDatabase
from rdflib import Graph, Namespace, RDF, RDFS, OWL
from rdflib.term import URIRef, Literal, BNode
from typing import Dict, List, Set, Optional, Union
import logging
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NeoSemantics:
    """
    Python implementation of neosemantics functionality for importing RDF data into Neo4j.
    Maps OWL/RDF ontologies to property graph model:
    - Classes become node labels
    - Object properties become relationships between class nodes
    - Data properties become node properties
    - Instances get labels from their classes and IS_A relationships
    """
    
    def __init__(self, uri: str, user: str, password: str, database: str = "neo4j"):
        """
        Initialize connection to Neo4j database.
        
        Args:
            uri: Neo4j connection URI (e.g., "bolt://localhost:7687")
            user: Neo4j username
            password: Neo4j password
            database: Neo4j database name (default: "neo4j")
        """
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.database = database
        self.rdf_graph = Graph()
        self.namespace_prefixes: Dict[str, str] = {}
        self.class_map: Dict[str, str] = {}  # Maps URIs to label names
        
    def close(self):
        """Close the Neo4j driver connection."""
        self.driver.close()
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        
    def _get_local_name(self, uri: URIRef) -> str:
        """Extract local name from URI."""
        uri_str = str(uri)
        if '#' in uri_str:
            return uri_str.split('#')[-1]
        elif '/' in uri_str:
            return uri_str.split('/')[-1]
        return uri_str
    
    def _get_namespace(self, uri: URIRef) -> str:
        """Extract namespace from URI."""
        uri_str = str(uri)
        if '#' in uri_str:
            return uri_str.rsplit('#', 1)[0] + '#'
        elif '/' in uri_str:
            return uri_str.rsplit('/', 1)[0] + '/'
        return uri_str
    
    def _sanitize_label(self, name: str) -> str:
        """Sanitize name to be valid Neo4j label/relationship type."""
        # Replace invalid characters with underscore
        import re
        sanitized = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        # Ensure it doesn't start with a number
        if sanitized and sanitized[0].isdigit():
            sanitized = '_' + sanitized
        return sanitized if sanitized else 'UnnamedResource'
    
    def _convert_literal(self, literal: Literal) -> Union[str, int, float, bool]:
        """Convert RDF literal to Python native type."""
        if literal.datatype:
            dt = str(literal.datatype)
            try:
                if 'integer' in dt or 'int' in dt:
                    return int(literal)
                elif 'double' in dt or 'float' in dt or 'decimal' in dt:
                    return float(literal)
                elif 'boolean' in dt:
                    return str(literal).lower() in ('true', '1')
            except (ValueError, TypeError):
                pass
        return str(literal)
    
    def load_rdf(self, source: str, format: str = 'turtle') -> 'NeoSemantics':
        """
        Load RDF data from file or string.
        
        Args:
            source: File path or RDF string
            format: RDF format ('turtle', 'xml', 'n3', 'nt', etc.)
            
        Returns:
            self for method chaining
        """
        try:
            # Try as file first
            self.rdf_graph.parse(source, format=format)
            logger.info(f"Loaded RDF from file: {source}")
        except FileNotFoundError:
            # Try as string data
            self.rdf_graph.parse(data=source, format=format)
            logger.info(f"Loaded RDF from string data")
        except Exception as e:
            logger.error(f"Failed to load RDF: {e}")
            raise
            
        # Extract namespace prefixes
        for prefix, namespace in self.rdf_graph.namespaces():
            self.namespace_prefixes[prefix] = str(namespace)
            
        logger.info(f"Loaded {len(self.rdf_graph)} triples")
        return self
    
    def init_graph(self, clear: bool = False):
        """
        Initialize Neo4j graph, optionally clearing existing data.
        
        Args:
            clear: If True, delete all nodes and relationships
        """
        with self.driver.session(database=self.database) as session:
            if clear:
                logger.warning("Clearing all data from Neo4j database")
                session.run("MATCH (n) DETACH DELETE n")
                
            # Create basic index for URI lookups
            try:
                session.run("CREATE INDEX uri_index IF NOT EXISTS FOR (n) ON (n.uri)")
            except Exception as e:
                logger.debug(f"Index might already exist: {e}")
                    
        logger.info("Graph initialized")
    
    def import_ontology(self):
        """
        Import RDF ontology structure:
        - Classes become nodes with their class name as label
        - Object properties become relationships between class nodes
        - Subclass relationships preserved
        """
        with self.driver.session(database=self.database) as session:
            # Get all OWL/RDFS Classes
            classes = set(self.rdf_graph.subjects(RDF.type, OWL.Class)) | \
                      set(self.rdf_graph.subjects(RDF.type, RDFS.Class))
            
            # Build class map: URI -> Label name
            for cls in classes:
                if isinstance(cls, BNode):
                    continue
                uri = str(cls)
                name = self._get_local_name(cls)
                label = self._sanitize_label(name)
                self.class_map[uri] = label
            
            logger.info(f"Found {len(self.class_map)} classes")
            
            # Create class nodes with their own class name as label
            for cls_uri, label_name in self.class_map.items():
                rdfs_label = self.rdf_graph.value(URIRef(cls_uri), RDFS.label)
                comment = self.rdf_graph.value(URIRef(cls_uri), RDFS.comment)
                
                props = {
                    "uri": cls_uri,
                    "name": label_name
                }
                
                if rdfs_label:
                    props["rdfs_label"] = str(rdfs_label)
                if comment:
                    props["comment"] = str(comment)
                
                # Create node with dynamic label
                query = f"""
                    MERGE (c:{label_name}:Class {{uri: $uri}})
                    SET c += $props
                """
                session.run(query, uri=cls_uri, props=props)
            
            logger.info(f"Imported {len(self.class_map)} class nodes")
            
            # Import subclass relationships
            subclass_count = 0
            for subclass, superclass in self.rdf_graph.subject_objects(RDFS.subClassOf):
                if isinstance(subclass, BNode) or isinstance(superclass, BNode):
                    continue
                
                sub_uri = str(subclass)
                super_uri = str(superclass)
                
                if sub_uri in self.class_map and super_uri in self.class_map:
                    session.run("""
                        MATCH (sub:Class {uri: $sub_uri})
                        MATCH (super:Class {uri: $super_uri})
                        MERGE (sub)-[:SUBCLASS_OF]->(super)
                    """, sub_uri=sub_uri, super_uri=super_uri)
                    subclass_count += 1
            
            logger.info(f"Imported {subclass_count} subclass relationships")
            
            # Import Object Properties as relationships between classes
            obj_props = set(self.rdf_graph.subjects(RDF.type, OWL.ObjectProperty))
            
            rel_count = 0
            for prop in obj_props:
                if isinstance(prop, BNode):
                    continue
                    
                uri = str(prop)
                name = self._get_local_name(prop)
                rel_type = self._sanitize_label(name).upper()
                
                # Get domain and range
                domain = self.rdf_graph.value(prop, RDFS.domain)
                range_cls = self.rdf_graph.value(prop, RDFS.range)
                
                # Create relationship between domain and range classes
                if domain and range_cls:
                    domain_uri = str(domain)
                    range_uri = str(range_cls)
                    
                    if domain_uri in self.class_map and range_uri in self.class_map:
                        query = f"""
                            MATCH (domain:Class {{uri: $domain_uri}})
                            MATCH (range:Class {{uri: $range_uri}})
                            MERGE (domain)-[r:{rel_type}]->(range)
                            SET r.uri = $prop_uri,
                                r.property_name = $prop_name
                        """
                        session.run(query, 
                                  domain_uri=domain_uri, 
                                  range_uri=range_uri,
                                  prop_uri=uri,
                                  prop_name=name)
                        rel_count += 1
            
            logger.info(f"Imported {rel_count} object property relationships between classes")
            
            # Import OWL Restrictions on properties
            restriction_count = 0
            for cls_uri, cls_label in self.class_map.items():
                cls_ref = URIRef(cls_uri)
                
                # Get all superclasses including restrictions
                for superclass in self.rdf_graph.objects(cls_ref, RDFS.subClassOf):
                    # Check if superclass is a restriction (blank node)
                    if isinstance(superclass, BNode):
                        restriction_type = self.rdf_graph.value(superclass, RDF.type)
                        
                        if restriction_type == OWL.Restriction:
                            # Get the property the restriction is on
                            on_property = self.rdf_graph.value(superclass, OWL.onProperty)
                            
                            if on_property:
                                prop_name = self._get_local_name(on_property)
                                rel_type = self._sanitize_label(prop_name).upper()
                                
                                # Get the target class
                                on_class = self.rdf_graph.value(superclass, OWL.onClass)
                                some_values = self.rdf_graph.value(superclass, OWL.someValuesFrom)
                                all_values = self.rdf_graph.value(superclass, OWL.allValuesFrom)
                                
                                target_class = on_class or some_values or all_values
                                
                                if target_class and str(target_class) in self.class_map:
                                    # Collect restriction properties
                                    rel_props = {
                                        "type": "Restriction",
                                        "property_uri": str(on_property)
                                    }
                                    
                                    # Cardinality constraints
                                    qualified_card = self.rdf_graph.value(superclass, OWL.qualifiedCardinality)
                                    min_qualified_card = self.rdf_graph.value(superclass, OWL.minQualifiedCardinality)
                                    max_qualified_card = self.rdf_graph.value(superclass, OWL.maxQualifiedCardinality)
                                    cardinality = self.rdf_graph.value(superclass, OWL.cardinality)
                                    min_card = self.rdf_graph.value(superclass, OWL.minCardinality)
                                    max_card = self.rdf_graph.value(superclass, OWL.maxCardinality)
                                    
                                    if qualified_card:
                                        rel_props["qualifiedCardinality"] = int(qualified_card)
                                    if min_qualified_card:
                                        rel_props["minQualifiedCardinality"] = int(min_qualified_card)
                                    if max_qualified_card:
                                        rel_props["maxQualifiedCardinality"] = int(max_qualified_card)
                                    if cardinality:
                                        rel_props["cardinality"] = int(cardinality)
                                    if min_card:
                                        rel_props["minCardinality"] = int(min_card)
                                    if max_card:
                                        rel_props["maxCardinality"] = int(max_card)
                                    
                                    # Value restrictions
                                    if on_class:
                                        rel_props["restrictionType"] = "onClass"
                                    elif some_values:
                                        rel_props["restrictionType"] = "someValuesFrom"
                                    elif all_values:
                                        rel_props["restrictionType"] = "allValuesFrom"
                                    
                                    has_value = self.rdf_graph.value(superclass, OWL.hasValue)
                                    if has_value:
                                        rel_props["hasValue"] = str(has_value)
                                    
                                    # Create relationship with restriction properties
                                    query = f"""
                                        MATCH (domain:Class {{uri: $domain_uri}})
                                        MATCH (range:Class {{uri: $range_uri}})
                                        MERGE (domain)-[r:{rel_type}]->(range)
                                        SET r += $props
                                    """
                                    session.run(query,
                                              domain_uri=cls_uri,
                                              range_uri=str(target_class),
                                              props=rel_props)
                                    restriction_count += 1
            
            logger.info(f"Imported {restriction_count} restriction-based relationships between classes")
    
    def import_instances(self, batch_size: int = 1000):
        """
        Import RDF instances (individuals):
        - Each instance gets labels from its rdf:type classes
        - Object properties become relationships between instances
        - Data properties become node properties
        - IS_A relationships link instances to their class definitions
        
        Args:
            batch_size: Number of instances to process in each batch
        """
        # Get all classes
        all_classes = set(self.rdf_graph.subjects(RDF.type, OWL.Class)) | \
                      set(self.rdf_graph.subjects(RDF.type, RDFS.Class))
        
        # Get all object properties
        obj_props = set(self.rdf_graph.subjects(RDF.type, OWL.ObjectProperty))
        obj_prop_map = {}  # URI -> relationship type name
        for prop in obj_props:
            if not isinstance(prop, BNode):
                uri = str(prop)
                name = self._get_local_name(prop)
                rel_type = self._sanitize_label(name).upper()
                obj_prop_map[uri] = rel_type
        
        # Find all instances
        instances = set()
        for s, p, o in self.rdf_graph.triples((None, RDF.type, None)):
            if o in all_classes and not isinstance(s, BNode):
                instances.add(s)
        
        logger.info(f"Found {len(instances)} instances to import")
        
        with self.driver.session(database=self.database) as session:
            batch = []
            
            for instance in instances:
                uri = str(instance)
                name = self._get_local_name(instance)
                
                # Get all types (classes) for this instance
                types = list(self.rdf_graph.objects(instance, RDF.type))
                type_uris = [str(t) for t in types if not isinstance(t, BNode) and t in all_classes]
                
                # Get labels from class map
                labels = [self.class_map.get(t) for t in type_uris if t in self.class_map]
                
                if not labels:
                    labels = ["Individual"]  # Default label if no class found
                
                # Collect data properties
                properties = {"uri": uri, "name": name}
                object_rels = []
                
                for pred, obj in self.rdf_graph.predicate_objects(instance):
                    pred_uri = str(pred)
                    
                    # Skip rdf:type
                    if pred == RDF.type:
                        continue
                    
                    prop_name = self._get_local_name(pred)
                    sanitized_prop = self._sanitize_label(prop_name)
                    
                    # Check if it's an object property
                    if pred_uri in obj_prop_map and isinstance(obj, URIRef):
                        object_rels.append({
                            "rel_type": obj_prop_map[pred_uri],
                            "target": str(obj),
                            "property_uri": pred_uri
                        })
                    # Data property
                    elif isinstance(obj, Literal):
                        properties[sanitized_prop] = self._convert_literal(obj)
                    # Object property not in ontology, but still a URI reference
                    elif isinstance(obj, URIRef):
                        rel_type = self._sanitize_label(prop_name).upper()
                        object_rels.append({
                            "rel_type": rel_type,
                            "target": str(obj),
                            "property_uri": pred_uri
                        })
                
                batch.append({
                    "uri": uri,
                    "labels": labels,
                    "type_uris": type_uris,
                    "properties": properties,
                    "object_rels": object_rels
                })
                
                # Process batch
                if len(batch) >= batch_size:
                    self._process_instance_batch(session, batch)
                    batch = []
            
            # Process remaining instances
            if batch:
                self._process_instance_batch(session, batch)
        
        logger.info(f"Imported {len(instances)} instances")
    
    def _process_instance_batch(self, session, batch: List[Dict]):
        """Process a batch of instances."""
        for item in batch:
            # Create instance node with class labels
            labels_str = ':'.join(item["labels"])
            
            query = f"""
                MERGE (i:{labels_str} {{uri: $uri}})
                SET i += $props
            """
            session.run(query, uri=item["uri"], props=item["properties"])
            
            # Create IS_A relationships to class definition nodes
            for type_uri in item["type_uris"]:
                if type_uri in self.class_map:
                    session.run("""
                        MATCH (i {uri: $inst_uri})
                        MATCH (c:Class {uri: $class_uri})
                        MERGE (i)-[:IS_A]->(c)
                    """, inst_uri=item["uri"], class_uri=type_uri)
            
            # Create object property relationships between instances
            for rel in item["object_rels"]:
                rel_type = rel["rel_type"]
                query = f"""
                    MATCH (i {{uri: $inst_uri}})
                    MERGE (t {{uri: $target_uri}})
                    MERGE (i)-[r:{rel_type}]->(t)
                    SET r.property_uri = $prop_uri
                """
                session.run(query, 
                          inst_uri=item["uri"], 
                          target_uri=rel["target"],
                          prop_uri=rel["property_uri"])
    
    def import_all(self, clear: bool = False, batch_size: int = 1000):
        """
        Import complete RDF graph: ontology and instances.
        
        Args:
            clear: If True, clear existing data before import
            batch_size: Batch size for instance import
        """
        self.init_graph(clear=clear)
        self.import_ontology()
        self.import_instances(batch_size=batch_size)
        logger.info("RDF import complete")
    
    def get_stats(self) -> Dict:
        """Get statistics about imported data."""
        with self.driver.session(database=self.database) as session:
            # Count class nodes
            class_result = session.run("MATCH (c:Class) RETURN count(c) as count")
            class_count = class_result.single()["count"]
            
            # Count instance nodes (exclude Class nodes)
            inst_result = session.run("""
                MATCH (n)
                WHERE NOT n:Class
                RETURN count(n) as count
            """)
            inst_count = inst_result.single()["count"]
            
            # Count IS_A relationships
            is_a_result = session.run("MATCH ()-[r:IS_A]->() RETURN count(r) as count")
            is_a_count = is_a_result.single()["count"]
            
            # Count all relationships
            rel_result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
            rel_count = rel_result.single()["count"]
            
            return {
                "classes": class_count,
                "instances": inst_count,
                "is_a_relationships": is_a_count,
                "total_relationships": rel_count,
                "instance_relationships": rel_count - is_a_count
            }

# Example usage
if __name__ == "__main__":
    neo = NeoSemantics(
        uri="neo4j://127.0.0.1:7687",
        user="neo4j",
        password="battwin1234*",
        database="pcap"
    )
    
    try:
        # Load and import RDF data
        neo.load_rdf("data/ontologies/cve.rdf", format="xml")
        neo.import_all(clear=True)
        
        # Get statistics
        stats = neo.get_stats()
        print(f"Import Statistics:")
        print(f"  Classes: {stats['classes']}")
        print(f"  Instances: {stats['instances']}")
        print(f"  IS_A relationships: {stats['is_a_relationships']}")
        print(f"  Instance relationships: {stats['instance_relationships']}")
        print(f"  Total relationships: {stats['total_relationships']}")
        
    finally:
        neo.close()