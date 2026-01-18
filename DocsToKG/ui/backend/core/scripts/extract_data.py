import argparse
from pathlib import Path
from doc_proc_extractor import DocProcExtractor
import requests
import os


def parse_args():
    parser = argparse.ArgumentParser(
        description="Document Processing Extractor CLI"
    )

    parser.add_argument(
        "--folder-path",
        required=True,
        help="Path to the folder containing raw documents",
    )

    parser.add_argument(
        "--metadata-path",
        required=True,
        help="Output path for metadata results",
    )

    parser.add_argument(
        "--text-path",
        required=True,
        help="Output path for extracted text",
    )

    parser.add_argument(
        "--formulas-path",
        required=True,
        help="Output path for extracted formulas",
    )

    parser.add_argument(
        "--figures-path",
        required=True,
        help="Output path for extracted figures",
    )

    parser.add_argument(
        "--hierarchy-path",
        required=True,
        help="Output path for document hierarchy",
    )

    parser.add_argument(
        "--shrinks-path",
        required=True,
        help="Output path for shrinks",
    )

    parser.add_argument(
        "--valid-tasks",
        nargs="+",
        required=True,
        help="Tasks to execute (e.g. shrinks figures)",
    )

    parser.add_argument(
        "--no-pipeline",
        action="store_true",
        help="Disable pipeline execution",
    )

    parser.add_argument(
        "--run-id",
        type=int,
        required=False,
        default=None,
        help="Run ID for progress tracking (optional)",
    )

    parser.add_argument(
        "--project-name",
        type=str,
        required=False,
        default=None,
        help="Project name for verification API call (optional)",
    )

    parser.add_argument(
        "--api-url",
        type=str,
        required=False,
        default="http://localhost:3000",
        help="API base URL for verification (optional)",
    )

    return parser.parse_args()


def main():
    args = parse_args()

    # Expand user (~) and resolve paths to absolute locations. Ensure output folders exist.
    output_structure = {
        "metadata": str(Path(args.metadata_path).expanduser().resolve()),
        "text": str(Path(args.text_path).expanduser().resolve()),
        "formulas": str(Path(args.formulas_path).expanduser().resolve()),
        "figures": str(Path(args.figures_path).expanduser().resolve()),
        "hierarchy": str(Path(args.hierarchy_path).expanduser().resolve()),
        "shrinks": str(Path(args.shrinks_path).expanduser().resolve()),
    }

    # Create output directories if they don't exist
    for p in output_structure.values():
        Path(p).mkdir(parents=True, exist_ok=True)

    folder_path = str(Path(args.folder_path).expanduser().resolve())
    # Ensure input folder exists
    if not Path(folder_path).exists():
        raise SystemExit(f"Input folder does not exist: {folder_path}")

    l = args.valid_tasks
    l.append("shrinks")
    l.append("hierarchy")
    dpex = DocProcExtractor(
        folder_path=folder_path,
        output_structure=output_structure,
        apply_pipeline=not args.no_pipeline,
        valid_tasks=l,
        run_id=args.run_id,
    )


if __name__ == "__main__":
    main()
