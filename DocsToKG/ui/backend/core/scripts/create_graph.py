import argparse
import os

from neo4j_api import Neo4jAPI
from llm_graph_builder_api import LLMGraphBuilderAPI


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create Lexical and Domain Graphs in Neo4j"
    )

    parser.add_argument("--uri", required=True)
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--database", required=True)

    parser.add_argument(
        "--aura-ds",
        action="store_true",
        help="Set this flag if using Neo4j AuraDS"
    )

    parser.add_argument("--hierarchy-path", required=True)
    parser.add_argument("--shrinks-path", required=True)

    parser.add_argument("--embedding-provider", required=True)
    parser.add_argument("--embedding-model", required=True)

    parser.add_argument("--llm-provider", required=True)
    parser.add_argument("--llm-model", required=True)

    parser.add_argument("--similarity-metric", required=True)
    parser.add_argument("--separator", required=True)

    parser.add_argument("--chunk-size", type=int, required=True)
    parser.add_argument("--chunk-overlap", type=int, required=True)
    parser.add_argument("--vector-dim", type=int, required=True)

    parser.add_argument(
        "--level-labels",
        nargs="+",
        default=["H1", "H2", "H3", "H4", "H5", "H6"]
    )

    parser.add_argument(
        "--lexical-meta-label",
        default="LexicalGraph"
    )

    parser.add_argument(
        "--domain-meta-label",
        default="DomainGraph"
    )

    parser.add_argument("--llmgb-url", required=True)

    parser.add_argument(
        "--allowed-nodes",
        nargs="+",
        required=False,
        default=""
    )

    parser.add_argument(
        "--allowed-relationships",
        nargs="+",
        required=False,
        default=""
    )

    parser.add_argument(
        "--additional-instructions",
        required=False
    )

    return parser.parse_args()


def main():
    args = parse_args()

    neo4j = Neo4jAPI(
        uri=args.uri,
        user=args.username,
        password=args.password,
        database=args.database,
        aura_ds=args.aura_ds
    )

    embedding_provider = {
        "provider": args.embedding_provider,
        "model_name": args.embedding_model
    }

    llm = {
        "provider": args.llm_provider,
        "model_name": args.llm_model
    }

    # Create lexical graph
    neo4j.create_lexical_graph(
        folder_path=args.hierarchy_path,
        embedding_provider=embedding_provider,
        llm=llm,
        vector_sim_func=args.similarity_metric,
        separator=args.separator,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        vector_dim=args.vector_dim,
        level_labels=args.level_labels,
        meta_label=args.lexical_meta_label
    )

    llm_graph_builder = LLMGraphBuilderAPI(
        username=args.username,
        password=args.password,
        database=args.database,
        url=args.llmgb_url,
        neo4j_uri=args.uri,
        aura_ds=args.aura_ds
    )

    # Upload and process shrinks documents
    for filename in os.listdir(args.shrinks_path):
        file_path = os.path.join(args.shrinks_path, filename)

        if not os.path.isfile(file_path):
            continue

        llm_graph_builder.upload_file(file_path, model=f"{args.llm_provider}_{args.llm_model}")

        llm_graph_builder.generate_graph(
            file_name=os.path.basename(file_path),
            model=f"{args.llm_provider}_{args.llm_model}",
            allowed_nodes=args.allowed_nodes,
            allowed_relationships=args.allowed_relationships,
            additional_instructions=args.additional_instructions,
            token_chunk_size=args.chunk_size,
            chunk_overlap=args.chunk_overlap,
            meta_label=args.domain_meta_label,
            tmp_results="~/.luminah/tmp_nodes.pkl"
        )


if __name__ == "__main__":
    main()
