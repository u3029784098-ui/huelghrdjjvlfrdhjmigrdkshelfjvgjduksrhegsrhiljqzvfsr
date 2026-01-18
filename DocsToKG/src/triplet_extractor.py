from gradio_client import Client
import re
import json
import time

class TripletExtractor:
    RELIK = "relik"
    def __init__(self, method, **kwargs):
        self.client = None
        self.method = method
        if method == TripletExtractor.RELIK:
            self.client = Client(**kwargs)
        
    def predict(self, text, **kwargs):
        if self.method == TripletExtractor.RELIK:
            result = self.client.predict(Text=text, **kwargs)
            nodes_rels = result[1]
            # Extract nodes
            nodes_match = re.search(r'nodes = new vis\.DataSet\((.*?)\);', nodes_rels, re.DOTALL)
            # Extract edges (triplets)
            edges_match = re.search(r'edges = new vis\.DataSet\((.*?)\);', nodes_rels, re.DOTALL)

            all_nodes = []
            triplets = []
            standalone_nodes = []

            if nodes_match:
                nodes_json = nodes_match.group(1)
                nodes_data = json.loads(nodes_json)
                all_nodes = [node['label'] for node in nodes_data]

            if edges_match:
                edges_json = edges_match.group(1)
                edges_data = json.loads(edges_json)
                
                # Extract clean triplets
                for edge in edges_data:
                    triplet = (edge['from'], edge['label'], edge['to'])
                    triplets.append(triplet)
                
                # Find nodes that are connected (in any triplet)
                connected_nodes = set()
                for subject, relation, obj in triplets:
                    connected_nodes.add(subject)
                    connected_nodes.add(obj)
                
                # Find standalone nodes (not in any triplet)
                standalone_nodes = [node for node in all_nodes if node not in connected_nodes]
            return {"triplets": triplets, 
                    "standalone_nodes": standalone_nodes}


text = "Lots of learning tasks require dealing with graph data which contains rich relation information among elements. Modeling physics systems, learning molecular fingerprints, predicting protein interface, and classifying diseases demand a model to learn from graph inputs. In other domains such as learning from non-structural data like texts and images, reasoning on extracted structures (like the dependency trees of sentences and the scene graphs of images) is an important research topic which also needs graph reasoning models. Graph neural networks (GNNs) are neural models that capture the dependence of graphs via message passing between the nodes of graphs. In recent years, variants of GNNs such as graph convolutional network (GCN), graph attention network (GAT), graph recurrent network (GRN) have demonstrated ground-breaking performances on many deep learning tasks. In this survey, we propose a general design pipeline for GNN models and discuss the variants of each component, systematically categorize the applications, and propose four open problems for future research."

client = {"src": "relik-ie/Information-Extraction"}
prediction = {
    "Model": "relik-ie/relik-relation-extraction-small-wikipedia-ner",
    "Relation_Threshold": 0.05,
    "Window_Size": 32,
    "Window_Stride": 16,
    "api_name": "/predict"
}

te = TripletExtractor(method="relik", **client)

start = time.time()
results = te.predict(text, **prediction)
end = time.time()    # record end time
print(f"Execution time: {end - start:.6f} seconds")
print(f"Number of tokens: {len(text.split(" "))}")

triplets = results["triplets"]
standalone_nodes = results["standalone_nodes"]

# Print results
print("=" * 60)
print("TRIPLETS (Connected Relationships):")
print("=" * 60)
for subject, relation, obj in triplets:
    print(f"({subject}, {relation}, {obj})")

print(f"\n{'=' * 60}")
print("STANDALONE NODES (Extracted Entities with No Relations):")
print("=" * 60)
for node in standalone_nodes:
    print(f"- {node}")

print(f"\n{'=' * 60}")
print("SUMMARY:")
print("=" * 60)
print(f"Total triplets: {len(triplets)}")
print(f"Standalone nodes: {len(standalone_nodes)}")