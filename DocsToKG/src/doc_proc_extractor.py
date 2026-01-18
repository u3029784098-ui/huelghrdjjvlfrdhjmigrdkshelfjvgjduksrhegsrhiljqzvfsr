import os
import json
import shutil
import subprocess
import tempfile
from typing import Optional
import exiftool
from PIL import Image
from pathlib import Path
import torch
import clip
import cv2
import fitz  # PyMuPDF
import layoutparser as lp
import matplotlib.pyplot as plt
import sys
import re
from charset_normalizer import from_path


class DocProcExtractor:
    def __init__(
        self,
        folder_path: str,
        output_structure: Optional[dict] = None,
        apply_pipeline: bool = True,
        valid_tasks: Optional[list[str]] = None,
    ):
        # --- Handle defaults safely
        if output_structure is None:
            output_structure = {
                "metadata": "results/metadata",
                "text": "results/text",
                "formulas": "results/formulas",
                "figures": "results/figures",
                "hierarchy": "results/hierarchy",
                "shrinks": "results/shrinks"
            }

        if valid_tasks is None:
            valid_tasks = ["metadata", "text"]

        assert all(k in output_structure for k in valid_tasks), (
            "Invalid task in valid_tasks"
        )

        self.folder_path = os.path.abspath(folder_path)
        self.output_structure = {
            k: os.path.abspath(v) for k, v in output_structure.items()
        }
        self.apply_pipeline = apply_pipeline
        self.valid_tasks = valid_tasks

        # List files in folder
        self.files = [
            f
            for f in os.listdir(self.folder_path)
            if os.path.isfile(os.path.join(self.folder_path, f))
        ]
        print(f"[INFO] Found {len(self.files)} files in {self.folder_path}")

        if self.apply_pipeline:
            self.pipeline()

    # -------------------- Metadata Extraction --------------------

    def extract_metadata(self, input_file: str, output_dir: str) -> dict:
        """Extract metadata using ExifTool and save to JSON."""
        output_file = os.path.join(
            output_dir,
            f"metadata_{os.path.splitext(os.path.basename(input_file))[0]}.json",
        )
        metadata = {}
        try:
            with exiftool.ExifTool() as et:
                exif_output = et.execute("-G", "-j", input_file)

            if isinstance(exif_output, bytes):
                exif_output = exif_output.decode("utf-8")

            metadata_list = json.loads(exif_output)
            if isinstance(metadata_list, list) and metadata_list:
                metadata = metadata_list[0]
        except Exception as e:
            print(f"[WARNING] Failed to extract metadata for {input_file}: {e}")

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)

        print(f"[INFO] Metadata saved to: {output_file}")
        return metadata

    # -------------------- Extract text --------------------
    def extract_text(self, input_path: str, output_base_path: str):
        """
        Run Nougat OCR/Math extraction.
        Converts images to temporary PDFs automatically.
        The extracted text is saved as <output_base_path>/<basename>.txt
        """

        output_base_path = os.path.join(
            output_base_path,
            f"text_{os.path.splitext(os.path.basename(input_path))[0]}",
        )
        os.makedirs(output_base_path, exist_ok=True)

        # Handle image → temporary PDF
        tmp_pdf_path = None
        ext = os.path.splitext(input_path)[1].lower()
        if ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            tmp_pdf_fd, tmp_pdf_path = tempfile.mkstemp(suffix=".pdf")
            try:
                Image.open(input_path).convert("RGB").save(tmp_pdf_path)
                print(f"[INFO] Converted image → temporary PDF: {tmp_pdf_path}")
            except Exception as e:
                print(f"[ERROR] Failed to convert image {input_path}: {e}")
                return
            input_path = tmp_pdf_path  # replace with temporary PDF for Nougat

        # Run Nougat
        try:
            result = subprocess.run(
                ["nougat", input_path, "-o", output_base_path, "--no-skipping"],
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                print(f"[ERROR] Nougat failed on {input_path}")
                print(f"[STDERR]\n{result.stderr}")
                print(f"[STDOUT]\n{result.stdout}")
                return
        except FileNotFoundError:
            print(
                "[ERROR] Nougat command not found. Install with `pip install nougat-ocr`."
            )
            return
        except Exception as e:
            print(f"[ERROR] Unexpected error running Nougat: {e}")
            return
        finally:
            # Delete temp file if created
            if tmp_pdf_path and os.path.exists(tmp_pdf_path):
                os.remove(tmp_pdf_path)
                print(f"[CLEANUP] Deleted temporary file: {tmp_pdf_path}")

        # Handle Nougat output
        if os.path.isdir(output_base_path):
            files_inside = os.listdir(output_base_path)
            if files_inside:
                file_inside = files_inside[0]
                src_file = os.path.join(output_base_path, file_inside)
                final_file = f"{output_base_path}.txt"
                shutil.move(src_file, final_file)
                os.rmdir(output_base_path)
                print(f"[INFO] File created at: {final_file}")
            else:
                print("[WARNING] No file found inside the generated folder.")
        else:
            print("[WARNING] Expected folder not found. Nougat may have failed.")

    def extract_hierarchy(self, input_path, output_path):
        """
        Reads a markdown-like text file and creates a folder hierarchy 
        based on any level of markdown titles (#, ##, ###, ####, ...).
        Each section's text (until the next header) is written into content.txt.

        Args:
            input_path (str): Path to the input text/markdown file.
            output_path (str): Path to the root output directory.
        """
        output_path = os.path.join(output_path, f"hierarchy_{os.path.basename(input_path).split(".")[0]}")
        if not os.path.exists(os.path.join(self.output_structure["text"], f"text_{os.path.basename(input_path).split(".")[0]}.txt")):
            self.extract_text(input_path, os.path.join(self.output_structure["text"], f"text_{os.path.basename(input_path).split(".")[0]}.txt"))

        # Read the file content
        input_path = os.path.join(self.output_structure["text"], f"text_{os.path.basename(input_path).split(".")[0]}.txt")
        result = from_path(input_path).best()
        text = str(result)
        lines = text.splitlines(True)

        # Regex pattern for markdown headers of any level
        header_pattern = re.compile(r"^(#+)\s+(.*)")

        # Stack to maintain (level, folder_path) hierarchy
        stack = []
        current_content = []
        counters = []

        def extract_text_before_heading(text: str) -> str:
            """
            Extract text from the beginning of `text` until the first Markdown heading (line starting with '#').
            Returns the text before the first heading.
            """
            match = re.search(r'(?m)^#+', text)  # Find the first line starting with one or more '#'
            if match:
                return text[:match.start()].rstrip('\n')
            return text.rstrip('\n')  # If no heading, return all text

        text_before_heading = extract_text_before_heading(text)
        
        os.makedirs(output_path, exist_ok=True)
        with open(os.path.join(output_path, "content.txt"), "w", encoding="utf-8") as file:
            file.write(text_before_heading)


        def write_content():
            """Write current accumulated text to content.txt in the current folder."""
            if stack:
                folder_path = stack[-1][1]
                os.makedirs(folder_path, exist_ok=True)
                content_file = os.path.join(folder_path, "content.txt")
                with open(content_file, "w", encoding="utf-8") as f_out:
                    f_out.write("".join(current_content).strip())
        for line in lines:
            header_match = header_pattern.match(line)

            if header_match:
                # Found a new header
                write_content()
                current_content = []

                level = len(header_match.group(1))  # Number of '#' = header level
                title = header_match.group(2).strip()

                # Adjust the stack according to the current level
                while stack and stack[-1][0] >= level:
                    stack.pop()

                # Adjust counters for current level
                while len(counters) < level:
                    counters.append(0)
                while len(counters) > level:
                    counters.pop()
                counters[level-1] += 1
                # Reset deeper levels
                for i in range(level, len(counters)):
                    counters[i] = 0

                # Determine the correct parent path
                number_prefix = str(counters[level-1])
                numbered_title = f"l{level-1}-n{number_prefix}-{title}"
                if stack:
                    folder_path = os.path.join(stack[-1][1], f"{numbered_title}")
                else:
                    folder_path = os.path.join(output_path, f"{numbered_title}")

                stack.append((level, folder_path))

            else:
                # Regular content line (belongs to the current section)
                current_content.append(line)

        # Write the last section content
        write_content()

        print(f"✅ Folder hierarchy successfully created at: {output_path}")
    

    # Figures extractor
    def __classify_image_clip(
        self, image_path: str, labels: list, model, preprocess, device="cpu"
    ):
        """
        Classify an image using CLIP and return probabilities for each label.
        """
        image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
        text_tokens = clip.tokenize(labels).to(device)

        with torch.no_grad():
            logits_per_image, _ = model(image, text_tokens)
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
        return dict(zip(labels, probs))

    def __detect_and_save_figures(
        self,
        image_path,
        output_folder="figures_output",
        score_thresh=0.5,
        show_image=False,
        save_crops=True,
    ):
        """
        Detects figures in an image using LayoutParser's PubLayNet model,
        draws bounding boxes, optionally displays the image and saves cropped figures.

        Args:
            image_path (str): Path to the input image.
            output_folder (str): Folder to save cropped figures.
            score_thresh (float): Confidence threshold for detection.
            show_image (bool): Whether to display the image with bounding boxes.
            save_crops (bool): Whether to save cropped figures as separate files.
        """
        # Create output folder if needed
        os.makedirs(output_folder, exist_ok=True)

        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Image not found: {image_path}")
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Load PubLayNet model
        model = lp.Detectron2LayoutModel(
            config_path="lp://PubLayNet/faster_rcnn_R_50_FPN_3x/config",
            label_map={4: "Figure"},
            extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", score_thresh],
        )

        # Detect layout
        layout = model.detect(image_rgb)

        # Filter figures
        figures = lp.Layout([b for b in layout if b.type == "Figure"])

        # Draw boxes on the image
        image_with_boxes = image_rgb.copy()
        for block in figures:
            x1, y1, x2, y2 = map(int, block.coordinates)
            cv2.rectangle(
                image_with_boxes, (x1, y1), (x2, y2), color=(255, 0, 0), thickness=2
            )
            cv2.putText(
                image_with_boxes,
                block.type,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 0, 0),
                1,
            )

        # Show image
        if show_image:
            plt.figure(figsize=(12, 12))
            plt.imshow(image_with_boxes)
            plt.axis("off")
            plt.title("Detected Figures")
            plt.show()

        # Save cropped figures
        if save_crops:
            for idx, block in enumerate(figures):
                x1, y1, x2, y2 = map(int, block.coordinates)
                cropped = image_rgb[y1:y2, x1:x2]
                cv2.imwrite(
                    os.path.join(output_folder, f"figure_{idx}.png"),
                    cv2.cvtColor(cropped, cv2.COLOR_RGB2BGR),
                )

        return figures, image_with_boxes

    def __extract_images_from_pdf(self, pdf_path, output_folder="extracted_images"):
        """
        Extracts all images from a PDF and saves them in the specified folder.

        Args:
            pdf_path (str): Path to the PDF file.
            output_folder (str): Directory where images will be saved.
        """
        os.makedirs(output_folder, exist_ok=True)
        doc = fitz.open(pdf_path)

        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            print(f"[INFO] Found {len(image_list)} images on page {page_num + 1}")

            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                image_filename = os.path.join(
                    output_folder, f"page{page_num + 1}_img{img_index + 1}.{image_ext}"
                )
                with open(image_filename, "wb") as f:
                    f.write(image_bytes)

        print(f"[INFO] Extraction completed. Images saved in '{output_folder}' folder.")

    def filter_images(
        self,
        folder: str,
        labels: list[str],
        accepted_labels: list[str],
        threshold: float = 0.5,
        verbose: bool = True,
    ):
        """
        Filters images inside a folder based on CLIP classification confidence.

        Parameters
        ----------
        folder : str
            Path to the folder containing images.
        labels : list[str]
            All possible labels used for classification.
        accepted_labels : list[str]
            Labels that are considered "accepted" (images below threshold are deleted).
        threshold : float, optional
            Minimum probability required to keep an image (default: 0.5).
        verbose : bool, optional
            If True, prints progress messages (default: True).

        Returns
        -------
        dict
            Summary of images kept and removed:
            {
                "kept": [list of filenames],
                "removed": [list of filenames]
            }
        """
        folder_path = Path(folder)

        if not folder_path.is_dir():
            raise ValueError(f"Folder not found: {folder_path}")

        # Load CLIP model
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model, preprocess = clip.load("ViT-B/32", device=device)

        kept_files = []
        removed_files = []

        # Iterate over all images
        for img_file in folder_path.iterdir():
            if img_file.suffix.lower() not in [
                ".png",
                ".jpg",
                ".jpeg",
                ".bmp",
                ".tiff",
            ]:
                continue

            probs_dict = self.__classify_image_clip(
                str(img_file), labels, model, preprocess, device
            )

            # Compute max probability among accepted labels
            accepted_probs = [
                probs_dict[label] for label in accepted_labels if label in probs_dict
            ]
            max_prob = max(accepted_probs) if accepted_probs else 0.0

            if max_prob < threshold:
                if verbose:
                    print(
                        f"[REMOVE] {img_file.name} (max accepted prob: {max_prob:.2f})"
                    )
                removed_files.append(img_file.name)
            else:
                if verbose:
                    print(f"[KEEP] {img_file.name} (max accepted prob: {max_prob:.2f})")
                kept_files.append(img_file.name)

        return {"kept": kept_files, "removed": removed_files}

    def extract_figures(
        self,
        input_path,
        output_folder,
        score_thresh=0.5,
        classify_thresh=0.5,
        labels=[],
        accepted_labels=[],
    ):
        ext = os.path.splitext(input_path)[-1].lower()
        output_folder = os.path.join(
            output_folder,
            f"figures_{os.path.splitext(os.path.basename(input_path))[0]}",
        )
        if ext == ".pdf":
            print(f"[INFO] Processing PDF: {input_path}")
            self.__extract_images_from_pdf(input_path, output_folder)
        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff"]:
            print(f"[INFO] Processing image: {input_path}")
            self.__detect_and_save_figures(
                input_path,
                output_folder=output_folder,
                score_thresh=score_thresh,
                show_image=False,
            )
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
        history_files = self.filter_images(
            output_folder,
            labels=labels,
            accepted_labels=accepted_labels,
            threshold=classify_thresh,
        )
        with open(os.path.join(output_folder, "history.json"), "w") as f:
            json.dump(history_files, f)

    # -------------------- Task Dispatcher --------------------

    def shrink_file(self, input_file, output_folder, chunk_length=10_000, overlap_size=100):
        """
            output_folder = "shrinked_file"
        """

        base_name = os.path.splitext(os.path.basename(input_file))[0]

        input_file = os.path.join(self.output_structure["text"], f"text_{base_name}.txt")
        output_folder = os.path.join(self.output_structure["shrinks"], f"shrinks_{base_name}")

        if not os.path.exists(input_file):
            self.extract_text(input_file, output_folder)


        # Ensure output folder exists
        os.makedirs(output_folder, exist_ok=True)

        # Read input file
        with open(input_file, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_length
            chunk_text = text[start:end]
            chunks.append(chunk_text)

            # Move start forward with overlap
            start = end - overlap_size

            if start < 0:
                break

        # Save chunks
        for i, chunk in enumerate(chunks):
            chunk_path = os.path.join(output_folder, f"chunk_{i+1}.txt")
            with open(chunk_path, "w", encoding="utf-8") as out:
                out.write(chunk)

        return len(chunks)


    def extract_data(self, task: str):
        """Dispatch task-specific extraction."""
        match_task = {
            "metadata": {
                "output": "metadata",
                "prefix": "metadata",
                "extension": ".json",
                "function": self.extract_metadata,
                "kwargs": {},
            },
            "text": {
                "output": "text",
                "prefix": "text",
                "extension": "",
                "function": self.extract_text,
                "kwargs": {},
            },
            "figures": {
                "output": "figures",
                "prefix": "figures",
                "extension": ".png",
                "function": self.extract_figures,
                "kwargs": {
                    "score_thresh": 0.5,
                    "classify_thresh": 0.5,
                    "labels": [
                        "Figure",
                        "Table",
                        "Text",
                        "Technical drawing",
                        "Scientific figure",
                        "Schema",
                        "Other",
                    ],
                    "accepted_labels": [
                        "Figure",
                        "Technical drawing",
                        "Scientific figure",
                        "Schema",
                    ],
                },
            },
            "hierarchy": {
                "output": "hierarchy",
                "function": self.extract_hierarchy,
                "kwargs": {}
            },
            "shrinks": {
                "output": "shrinks",
                "function": self.shrink_file,
                "kwargs": {
                    "chunk_length": 10_000,
                    "overlap_size": 100
                }
            }
        }

        os.makedirs(self.output_structure[match_task[task]["output"]], exist_ok=True)

        for file in self.files:
            input_path = os.path.join(self.folder_path, file)
            filename_no_ext, _ = os.path.splitext(file)
            output_path = self.output_structure[match_task[task]["output"]]
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            print(f"[TASK] Running '{task}' on {file}")
            match_task[task]["function"](
                input_path, output_path, **match_task[task]["kwargs"]
            )

    # -------------------- Main Pipeline --------------------

    def pipeline(self):
        for task in self.valid_tasks:
            self.extract_data(task)


# -------------------- Script Entry --------------------

if __name__ == "__main__":
    folder_path = "../results/raw"
    output_structure = {
        "metadata": "../results/metadata",
        "text": "../results/text",
        "formulas": "../results/formulas",
        "figures": "../results/figures",
        "hierarchy": "../results/hierarchy",
        "shrinks": "../results/shrinks"
    }
    valid_tasks = ["shrinks"]

    dpex = DocProcExtractor(
        folder_path=folder_path,
        output_structure=output_structure,
        apply_pipeline=True,
        valid_tasks=valid_tasks,
    )
