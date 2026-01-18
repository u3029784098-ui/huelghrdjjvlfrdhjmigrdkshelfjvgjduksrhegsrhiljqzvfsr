# Installation commands:
# pip install wikipedia sentence-transformers scikit-learn numpy
# OR in notebook: !pip install wikipedia sentence-transformers scikit-learn numpy

import os
import wikipedia
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
import dspy
from dspy import InputField, OutputField, Signature
from huggingface_hub import login
import ollama


class OllamaLM(dspy.LM):
    """Custom Ollama language model for DSPy"""

    def __init__(
        self, model="llama3.1:latest", base_url="http://localhost:11434", **kwargs
    ):
        super().__init__(model=model)
        self.model = model
        self.base_url = base_url
        self.provider = "ollama"
        self.history = []
        self.kwargs = {"temperature": 0.7, "max_tokens": 2000, **kwargs}

    def __call__(self, prompt=None, messages=None, **kwargs):

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


# DSPy Signature for LaTeX correction
class QA(Signature):
    """
    Provides an answer to a natural language question based on a given context.

    This signature models a question-answering task where the system extracts or
    infers the most relevant and accurate answer from the supplied contextual text.
    """

    question: str = InputField(
        desc="The natural language question to be answered."
    )
    context: str = InputField(
        desc="The textual context or passage that contains or supports the answer."
    )
    answer: str = OutputField(
        desc="The concise, contextually grounded answer derived from the input."
    )


class AnswerQuestion(dspy.Module):
    """
    Chain-of-Thought module that answers a question based on a given context.

    It reasons step by step over the context to produce a precise answer.
    """

    def __init__(self):
        super().__init__()
        self.answer = dspy.ChainOfThought(QA)

    def forward(self, question, context):
        result = self.answer(question=question, context=context)
        return result


class WikipediaRAG:
    """
    Wikipedia RAG system with similarity search using sentence embeddings.
    """

    def __init__(self, model_name='/home/billal-mokhtari/Documents/Projects/Luminah/models/all-MiniLM-L6-v2', token: str | None = None):
        """
        Initialize the RAG system with a sentence transformer model.

        Args:
            model_name: Hugging Face model for embeddings (default is fast and efficient)
        """
        print(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.documents = []
        self.embeddings = []

        # Prefer explicit token parameter, otherwise fall back to env var.
        hf_token = token or os.getenv("HF_TOKEN")
        if hf_token:
            login(hf_token)
        else:
            print("Warning: No Hugging Face token provided; login skipped.")

        print("Model loaded successfully!")

    def fetch_wikipedia_content(self, query: str, num_results: int = 3) -> List[Dict]:
        """
        Fetch Wikipedia articles related to the query.

        Args:
            query: Search query
            num_results: Number of articles to fetch

        Returns:
            List of dictionaries containing article info
        """
        print(f"\nSearching Wikipedia for: '{query}'...")

        try:
            # Search for relevant articles
            search_results = wikipedia.search(query, results=num_results)

            articles = []
            for title in search_results:
                try:
                    # Fetch full article content
                    page = wikipedia.page(title, auto_suggest=False)

                    article = {
                        'title': page.title,
                        'content': page.content,
                        'url': page.url,
                        'summary': page.summary
                    }
                    articles.append(article)
                    print(f"✓ Fetched: {page.title}")

                except wikipedia.exceptions.DisambiguationError as e:
                    print(f"✗ Disambiguation error for '{title}', skipping...")
                except wikipedia.exceptions.PageError:
                    print(f"✗ Page not found for '{title}', skipping...")

            return articles

        except Exception as e:
            print(f"Error fetching Wikipedia content: {e}")
            return []

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks for better retrieval.

        Args:
            text: Text to chunk
            chunk_size: Size of each chunk in characters
            overlap: Overlap between chunks

        Returns:
            List of text chunks
        """
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                if last_period > chunk_size * 0.5:
                    chunk = chunk[:last_period + 1]
                    end = start + last_period + 1

            chunks.append(chunk.strip())
            start = end - overlap

        return chunks

    def build_index(self, articles: List[Dict], chunk_size: int = 500):
        """
        Build searchable index from Wikipedia articles.

        Args:
            articles: List of article dictionaries
            chunk_size: Size of text chunks
        """
        print("\nBuilding document index...")

        self.documents = []
        texts_to_embed = []

        for article in articles:
            # Chunk the article content
            chunks = self.chunk_text(article['content'], chunk_size=chunk_size)

            for i, chunk in enumerate(chunks):
                doc = {
                    'title': article['title'],
                    'url': article['url'],
                    'chunk_id': i,
                    'text': chunk
                }
                self.documents.append(doc)
                texts_to_embed.append(chunk)

        # Generate embeddings for all chunks
        print(f"Generating embeddings for {len(texts_to_embed)} chunks...")
        self.embeddings = self.model.encode(texts_to_embed, show_progress_bar=True)
        print("Index built successfully!")

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search for most relevant document chunks using similarity search.

        Args:
            query: Search query
            top_k: Number of top results to return

        Returns:
            List of most relevant documents with similarity scores
        """
        if not self.documents or len(self.embeddings) == 0:
            print("No documents indexed. Please build index first.")
            return []

        # Embed the query
        query_embedding = self.model.encode([query])[0]

        # Calculate cosine similarity
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]

        # Get top-k results
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = []
        for idx in top_indices:
            result = {
                'document': self.documents[idx],
                'similarity_score': float(similarities[idx])
            }
            results.append(result)

        return results

    def answer_question(self, question: str, top_k: int = 3) -> Dict:
        """
        Answer a question using retrieved context (RAG).

        Args:
            question: Question to answer
            top_k: Number of context chunks to retrieve

        Returns:
            Dictionary with question, context, and metadata
        """
        results = self.search(question, top_k=top_k)

        context = "\n\n".join([
            f"[Source: {r['document']['title']}]\n{r['document']['text']}"
            for r in results
        ])

        return {
            'question': question,
            'context': context,
            'sources': [
                {
                    'title': r['document']['title'],
                    'url': r['document']['url'],
                    'similarity': r['similarity_score']
                }
                for r in results
            ]
        }
    
    def provide_context(self, expression, question, original_content = False, num_articles=3, top_k = 5, chunk_size=500, lm="llama3.1:latest"):

        articles = self.fetch_wikipedia_content(expression, num_results=num_articles)

        results = None
        if articles:
            self.build_index(articles, chunk_size=chunk_size)

            results = rag.search(question, top_k) if original_content else self.answer_question(question, top_k)
            qa = AnswerQuestion()
            results = qa.forward(question, results["context"])

        return articles, results
            
            


# Example usage
if __name__ == "__main__":
    lm = OllamaLM(model="llama3.1:latest")
    dspy.configure(
        lm=lm,
        lm_kwargs={"device": "cpu"}  # this tells dspy to run the model on CPU
    )

    # Initialize RAG system
    rag = WikipediaRAG()

    text = "Albert Einstein died in xxxx"

    # Example 1: Search and index Wikipedia articles
    query = "Provide a context about {KG}"
    articles, results = rag.provide_context("relativity theory", query)

    print(articles, results)

# - Triplet extraction algorithms
# - Domain-specific LLM 
# - Download Wiki, and download it to see what are the concepts 
# https://angryloki.github.io/wikidata-graph-builder/
# https://www.wikidata.org/wiki/Wikidata:Tools/Visualize_data