# from pyalex import Works, Authors, Institutions

# # Set your email for polite pool (faster API access)
# # This is optional but recommended
# import pyalex

# pyalex.config.email = "your.email@example.com"

# # Example 1: Search for works (papers) about machine learning
# print("=== Searching for Machine Learning Papers ===")
# works = (
#     Works()
#     .search(
#         "Zero- and Few-Shots Knowledge Graph Triplet Extraction with Large Language Models"
#     )
#     .get()
# )


# def reconstruct_abstract(index):
#     words = sorted(
#         [(pos, word) for word, positions in index.items() for pos in positions]
#     )
#     return " ".join(word for _, word in words)


# for work in works[:1]:  # Display first 5 results
#     # Example usage:
#     abstract = reconstruct_abstract(work["abstract_inverted_index"])
#     print(abstract)
#     print(work)
#     print(f"\nTitle: {work['title']}")
#     print(f"Year: {work['publication_year']}")
#     print(f"Citations: {work['cited_by_count']}")
#     print(f"DOI: {work['doi']}")

import dspy

def search_wikipedia(query: str) -> list[str]:
    results = dspy.ColBERTv2(url="http://20.102.90.50:2017/wiki17_abstracts")(query, k=3)
    return [x["text"] for x in results]

rag = dspy.ChainOfThought("context, question -> response")

question = "What's the name of the castle that David Gregory inherited?"
rag(context=search_wikipedia(question), question=question)