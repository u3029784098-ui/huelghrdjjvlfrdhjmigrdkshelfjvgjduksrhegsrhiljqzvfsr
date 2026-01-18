import dspy
from dspy import InputField, OutputField, Signature, Predict
import requests
import json

# 1️⃣ Custom LM class to call Ollama's API
class OllamaLocal(dspy.LM):
    def __init__(self, model='mistral', base_url='http://localhost:11434'):
        super().__init__(model=model)
        self.model = model
        self.url = f"{base_url}/api/generate"

    def forward(self, prompt, **kwargs):
        response = requests.post(self.url, json={
            "model": self.model,
            "prompt": prompt,
            "stream": False
        })
        return response.json()['response'].strip()

# 2️⃣ Create LM instance explicitly
lm_instance = OllamaLocal(model='mistral')

# 3️⃣ Configure DSPy globally
dspy.settings.configure(lm=lm_instance)

# 4️⃣ Define the NER Signature
class UnsupervisedNER(Signature):
    text = InputField()
    entities = OutputField(desc="JSON dictionary of entity types and lists")

# 5️⃣ Create the DSPy Predict program
ner_program = Predict(UnsupervisedNER)

# 6️⃣ Custom forward function using LM instance
def ner_forward(text):
    prompt = f"""
Extract named entities from the following text. Return the output as a valid JSON dictionary where keys are entity types and values are lists of entity names.

Text:
\"\"\"{text}\"\"\"

JSON output:
"""
    return lm_instance.forward(prompt)

# 7️⃣ Monkey patch forward
ner_program.forward = ner_forward

# 8️⃣ Enhanced function to build KG with entity properties
def build_kg_with_properties(entities):
    """
    entities: dict of entity types to lists of entities.
    Returns dict of entities mapping to their properties:
      {
        entity_name: {
          "type": entity_type,
          "related_to": [list of connected entities]
        }
      }
    """
    kg = {}

    # Initialize entities with types
    for etype, elist in entities.items():
        for e in elist:
            kg[e] = {"type": etype, "related_to": []}

    # Add relations between entities of different types
    types = list(entities.keys())
    for i in range(len(types)):
        for j in range(i + 1, len(types)):
            t1, t2 = types[i], types[j]
            for e1 in entities[t1]:
                for e2 in entities[t2]:
                    kg[e1]["related_to"].append(e2)
                    kg[e2]["related_to"].append(e1)

    return kg

# 9️⃣ Sample text
text = """
The Standard Model of particle physics includes fermions like the electron, muon, up quark, and down quark. In 2012, the Higgs boson was confirmed at CERN using the Large Hadron Collider.
"""

# 🔟 Run NER
llm_response = ner_program(text=text)

try:
    entities = json.loads(llm_response)
    print("Named Entities (parsed JSON):")
    print(json.dumps(entities, indent=2))

    # 1️⃣1️⃣ Build KG with properties
    kg = build_kg_with_properties(entities)
    print("\nKnowledge Graph with entity properties:")
    print(json.dumps(kg, indent=2))

except json.JSONDecodeError:
    print("Failed to parse JSON from model output:")
    print(llm_response)
