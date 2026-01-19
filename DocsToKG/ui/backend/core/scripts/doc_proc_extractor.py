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
import csv
import re
from charset_normalizer import from_path
import mysql.connector
import subprocess
import tempfile
import dspy
from dspy import InputField, OutputField, Signature
import pandas as pd
from tqdm import tqdm


class OllamaLM(dspy.LM):
    """Custom Ollama language model for DSPy"""

    def __init__(
        self, model="qwen2.5-coder:latest", base_url="http://localhost:11434", **kwargs
    ):
        super().__init__(model=model)
        self.model = model
        self.base_url = base_url
        self.provider = "ollama"
        self.history = []
        self.kwargs = {"temperature": 0.7, "max_tokens": 2000, **kwargs}

    def __call__(self, prompt=None, messages=None, **kwargs):
        import ollama

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
class CorrectLaTeX(Signature):
    """Correct invalid LaTeX code based on error messages."""

    latex_code: str = InputField(desc="The invalid LaTeX code")
    error_message: str = InputField(desc="Error message from LaCheck")
    corrected_latex: str = OutputField(
        desc="The corrected LaTeX code, output ONLY the corrected code without explanations"
    )


class LaTeXCorrector(dspy.Module):
    """DSPy module for correcting LaTeX code"""

    def __init__(self):
        super().__init__()
        self.correct = dspy.ChainOfThought(CorrectLaTeX)

    def forward(self, latex_code, error_message):
        result = self.correct(latex_code=latex_code, error_message=error_message)
        return result.corrected_latex


class DocProcExtractor:
    def __init__(
        self,
        folder_path: str,
        output_structure: Optional[dict] = None,
        apply_pipeline: bool = True,
        valid_tasks: Optional[list[str]] = None,
        run_id: Optional[int] = None,
        nbr_attempts: int = 1,
        llm_provider: Optional[str] = None,
        llm_model: Optional[str] = None,
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
        self.run_id = run_id
        self.nbr_attempts = nbr_attempts
        self.llm_provider = llm_provider
        self.llm_model = llm_model
        
        # Initialize LLM if provider and model are provided
        self.lm = None
        if self.llm_provider and self.llm_model:
            self.lm = {
                "provider": self.llm_provider,
                "model_name": self.llm_model
            }
        
        self.db_connection = None

        # Initialize database connection if run_id is provided
        if self.run_id:
            self._init_db_connection()

        # List files in folder
        self.files = [
            f
            for f in os.listdir(self.folder_path)
            if os.path.isfile(os.path.join(self.folder_path, f))
        ]
        print(f"[INFO] Found {len(self.files)} files in {self.folder_path}")

        if self.apply_pipeline:
            self.pipeline()

    def _init_db_connection(self):
        """Initialize database connection for progress tracking."""
        try:
            db_config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'port': int(os.getenv('DB_PORT', '3308')),
                'user': os.getenv('DB_USER', 'admin'),
                'password': os.getenv('DB_PASSWORD', 'admin'),
                'database': os.getenv('DB_NAME', 'docs_to_kg')
            }
            self.db_connection = mysql.connector.connect(**db_config)
            
            # Test the connection
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            
            print(f"[INFO] ✓ Database connection established for run_id={self.run_id}")
            print(f"[INFO] Connected to {db_config['host']}:{db_config['port']}/{db_config['database']}")
        except Exception as e:
            print(f"[ERROR] Failed to connect to database: {e}")
            print(f"[DEBUG] DB_HOST={os.getenv('DB_HOST')}, DB_PORT={os.getenv('DB_PORT')}, DB_NAME={os.getenv('DB_NAME')}, DB_USER={os.getenv('DB_USER')}")
            self.db_connection = None
            import traceback
            traceback.print_exc()


    # Extract formulas
    def _check_latex_string(self, latex_code: str):
        """
        Validate LaTeX code using LaCheck.
        Returns a tuple (is_valid, output), where is_valid is True/False
        and output is LaCheck's feedback.
        """
        with tempfile.NamedTemporaryFile(mode="w+", suffix=".tex", delete=False) as tmpfile:
            tmpfile.write(latex_code)
            tmpfile.flush()
            try:
                result = subprocess.run(
                    ["lacheck", tmpfile.name], capture_output=True, text=True
                )
                output = result.stdout.strip()
                is_valid = len(output) == 0
                return is_valid, output
            finally:
                tmpfile.close()


    def _validate_and_correct_latex(self, lm, latex_code: str, max_attempts: int = 3):
        """
        Validate LaTeX code and attempt to correct it using AI if invalid.

        Args:
            latex_code: The LaTeX code to validate
            max_attempts: Maximum number of correction attempts

        Returns:
            tuple: (is_valid, final_code, correction_history)
        """
        corrector = LaTeXCorrector()
        correction_history = []
        current_code = latex_code
        if lm["provider"] == "ollama":
            lm = OllamaLM(model=lm["model_name"])
        
        dspy.configure(lm = lm)

        for attempt in range(max_attempts):
            is_valid, error_msg = self._check_latex_string(current_code)

            if is_valid:
                return True, current_code, correction_history

            print(f"\nAttempt {attempt + 1}: LaTeX validation failed")
            print(f"Error: {error_msg}")

            # Use AI to correct the code
            print("Attempting AI correction...")
            corrected_code = corrector.forward(
                latex_code=current_code, error_message=error_msg
            )

            # Clean up the corrected code (remove markdown code blocks if present)
            corrected_code = corrected_code.strip()
            if corrected_code.startswith("```"):
                lines = corrected_code.split("\n")
                corrected_code = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else corrected_code
                )
            corrected_code = corrected_code.strip()

            correction_history.append(
                {
                    "attempt": attempt + 1,
                    "original": current_code,
                    "error": error_msg,
                    "corrected": corrected_code,
                }
            )

            print(f"Corrected code: {corrected_code}")
            current_code = corrected_code

        # Final validation after all attempts
        is_valid, error_msg = self._check_latex_string(current_code)
        return is_valid, current_code, correction_history

    def _extract_formulas(self, mmd_file, output_csv):
        # Read the content of the mmd file
        with open(mmd_file, "r", encoding="utf-8") as f:
            text = f.read()

        # Regex patterns for formulas
        patterns = [
            r"\\\[(.*?)\\\]",  # Display math \[ ... \]
            r"\\\((.*?)\\\)",  # Inline math \( ... \)
        ]

        formulas = []

        i = 0
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.DOTALL):
                formula_content = match.group(1)

                # Check for \tag{...} inside the formula
                tag_match = re.search(r"\\tag\{(.*?)\}", formula_content)
                tag = tag_match.group(1) if tag_match else ""

                # Remove the tag from formula
                if tag:
                    formula_content = re.sub(r"\\tag\{.*?\}", "", formula_content)
                    formula_content = formula_content.strip()

                # Start and end positions in the original file
                start_pos = match.start()
                end_pos = match.end()

                formulas.append([i, formula_content, tag, start_pos, end_pos])
                i += 1

        # Write to CSV
        with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["id", "Formula", "Tag", "Location start", "Location end"])
            writer.writerows(formulas)

        print(f"Extracted {len(formulas)} formulas to {output_csv}")


    def _validate_document(self, lm, max_attempts, path_file, save_path):
        df = pd.read_csv(path_file)
        validated_df = df.copy()
        validated_df["history"] = None

        for i in tqdm(range(len(df)), desc="Number of formulas"):
            latex = df.at[i, "Formula"]
            is_valid, final_code, history = self._validate_and_correct_latex(lm, latex, max_attempts)

            if not is_valid:
                validated_df.at[i, "Formula"] = final_code

            validated_df.at[i, "history"] = str(history)
        validated_df.to_csv(save_path, index=False)
        return validated_df
    
    def extract_formulas(self, input_path: str, output_dir: str, lm, max_attempts):
        # Extract the text if not already extracted
        text_path = os.path.join(self.output_structure["text"], f"text_{os.path.basename(input_path).split(".")[0]}.txt")
        if not os.path.exists(text_path):
            self.extract_text(input_path, self.output_structure["text"])
        
        output_csv = os.path.join(output_dir, f"formulas_{os.path.basename(input_path).split(".")[0]}.csv")
        self._extract_formulas(text_path, output_csv=output_csv)
        self._validate_document(lm=lm, max_attempts=max_attempts, path_file=output_csv, save_path=output_csv)

    def _update_progress(self, task: str, processed: int, total: int):
        """Update progress in database for a specific task."""
        if not self.db_connection or not self.run_id:
            return

        try:
            # Map task names to database column names
            task_column_map = {
                "metadata": "extract_metadata_state",
                "text": "extract_text_state",
                "figures": "extract_figures_state",
                "tables": "extract_tables_state",
                "formulas": "extract_formulas_state",
            }

            if task not in task_column_map:
                return

            column = task_column_map[task]
            percentage = (processed / total * 100) if total > 0 else 0

            cursor = self.db_connection.cursor()
            query = f"UPDATE Run SET {column} = %s WHERE id = %s"
            cursor.execute(query, (percentage, self.run_id))
            self.db_connection.commit()
            cursor.close()

            print(f"[PROGRESS] {task}: {processed}/{total} ({percentage:.1f}%)")
        except Exception as e:
            print(f"[WARNING] Failed to update progress for {task}: {e}")

    def _mark_document_extracted(self, filename: str, task: str):
        """Mark a document as extracted for a specific task in the database."""
        if not self.db_connection:
            print(f"[WARNING] No database connection, cannot mark {filename} as {task} extracted")
            return
            
        if not self.run_id:
            print(f"[WARNING] No run_id, cannot mark {filename} as {task} extracted")
            return

        try:
            # Map task names to database column names
            task_column_map = {
                "metadata": "metadata_extracted",
                "text": "text_extracted",
                "figures": "figures_extracted",
                "tables": "tables_extracted",
                "hierarchy": "tables_extracted",  # hierarchy is stored as tables
                "formulas": "formulas_extracted",
                "shrinks": None  # shrinks don't have a dedicated column
            }

            if task not in task_column_map:
                print(f"[WARNING] Unknown task '{task}', cannot mark as extracted")
                return
                
            column = task_column_map[task]
            if column is None:
                print(f"[INFO] Task '{task}' does not have extraction tracking")
                return
            
            # Check if extraction actually produced files before marking
            if not self._verify_extraction_output(filename, task):
                print(f"[WARNING] No output files found for {filename} ({task}), not marking as extracted")
                return
            
            # Query to find document by name and run_id
            cursor = self.db_connection.cursor()
            update_query = f"""
                UPDATE Document 
                SET {column} = TRUE 
                WHERE id_run = %s AND document_name = %s
            """
            
            print(f"[DEBUG] Updating {filename} for run_id={self.run_id}, column={column}")
            cursor.execute(update_query, (self.run_id, filename))
            affected_rows = cursor.rowcount
            self.db_connection.commit()
            cursor.close()

            if affected_rows > 0:
                print(f"[EXTRACTED] ✓ Marked {filename} as {task} extracted ({affected_rows} rows updated)")
            else:
                print(f"[WARNING] No rows updated for {filename} (run_id={self.run_id})")
        except Exception as e:
            print(f"[ERROR] Failed to mark document as extracted: {e}")
            import traceback
            traceback.print_exc()

    
    def _verify_extraction_output(self, filename: str, task: str) -> bool:
        """Verify if extraction actually produced output files for a given task."""
        filename_no_ext = os.path.splitext(filename)[0]
        output_path = self.output_structure.get(task if task != "hierarchy" else "hierarchy")
        
        if not output_path or not os.path.exists(output_path):
            print(f"[DEBUG] Output path does not exist: {output_path}")
            return False
        
        try:
            if task == "metadata":
                # Check for metadata_{filename}.json
                expected_file = os.path.join(output_path, f"metadata_{filename_no_ext}.json")
                exists = os.path.isfile(expected_file)
                print(f"[DEBUG] Checking metadata: {expected_file} → {'✓ exists' if exists else '✗ missing'}")
                return exists
            
            elif task == "text":
                # Check for text_{filename}.txt
                expected_file = os.path.join(output_path, f"text_{filename_no_ext}.txt")
                exists = os.path.isfile(expected_file)
                print(f"[DEBUG] Checking text: {expected_file} → {'✓ exists' if exists else '✗ missing'}")
                return exists
            
            elif task == "figures":
                # Check for figures_{filename}/ directory with images
                expected_dir = os.path.join(output_path, f"figures_{filename_no_ext}")
                if os.path.isdir(expected_dir):
                    files = os.listdir(expected_dir)
                    has_images = any(f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.gif')) for f in files)
                    print(f"[DEBUG] Checking figures: {expected_dir} → {'✓ has images' if has_images else '✗ no images'}")
                    return has_images
                print(f"[DEBUG] Checking figures: {expected_dir} → ✗ missing")
                return False
            
            elif task == "hierarchy":
                # Check for hierarchy_{filename}/ directory with content
                expected_dir = os.path.join(output_path, f"hierarchy_{filename_no_ext}")
                if os.path.isdir(expected_dir):
                    files = os.listdir(expected_dir)
                    has_content = len(files) > 0
                    print(f"[DEBUG] Checking hierarchy: {expected_dir} → {'✓ has content' if has_content else '✗ empty'}")
                    return has_content
                print(f"[DEBUG] Checking hierarchy: {expected_dir} → ✗ missing")
                return False
            
            elif task == "formulas":
                # Check for formulas_{filename}/ directory with content
                expected_dir = os.path.join(output_path, f"formulas_{filename_no_ext}")
                if os.path.isdir(expected_dir):
                    files = os.listdir(expected_dir)
                    has_content = len(files) > 0
                    print(f"[DEBUG] Checking formulas: {expected_dir} → {'✓ has content' if has_content else '✗ empty'}")
                    return has_content
                print(f"[DEBUG] Checking formulas: {expected_dir} → ✗ missing")
                return False
            
            elif task == "shrinks":
                # Check for shrinks_{filename}/ directory with chunks
                expected_dir = os.path.join(output_path, f"shrinks_{filename_no_ext}")
                if os.path.isdir(expected_dir):
                    files = [f for f in os.listdir(expected_dir) if f.startswith('chunk_')]
                    has_chunks = len(files) > 0
                    print(f"[DEBUG] Checking shrinks: {expected_dir} → {'✓ has chunks' if has_chunks else '✗ no chunks'}")
                    return has_chunks
                print(f"[DEBUG] Checking shrinks: {expected_dir} → ✗ missing")
                return False
            
            return False
            
        except Exception as e:
            print(f"[ERROR] Error verifying extraction output: {e}")
            return False

    def __del__(self):
        """Close database connection when object is destroyed."""
        if self.db_connection:
            try:
                self.db_connection.close()
                print("[INFO] Database connection closed")
            except:
                pass

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
            # Filter to only get files (no directories)
            files_only = [f for f in files_inside if os.path.isfile(os.path.join(output_base_path, f))]
            
            if files_only:
                file_inside = files_only[0]
                src_file = os.path.join(output_base_path, file_inside)
                final_file = f"{output_base_path}.txt"
                shutil.move(src_file, final_file)
                # Clean up any remaining directories before removing the folder
                try:
                    for item in os.listdir(output_base_path):
                        item_path = os.path.join(output_base_path, item)
                        if os.path.isdir(item_path):
                            shutil.rmtree(item_path)
                except Exception as e:
                    print(f"[WARNING] Failed to clean subdirectories: {e}")
                os.rmdir(output_base_path)
                print(f"[INFO] File created at: {final_file}")
            else:
                print("[WARNING] No file found inside the generated folder.")
        else:
            print("[WARNING] Expected folder not found. Nougat may have failed.")

    # Extract Hierarchy
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
            self.extract_text(input_path, self.output_structure["text"])

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

    def _cleanup_directories_from_text_output(self, text_output_path: str):
        """
        Ensure that only files exist in the text output directory.
        Remove any subdirectories that may have been created.
        """
        if not os.path.isdir(text_output_path):
            return

        try:
            for item in os.listdir(text_output_path):
                item_path = os.path.join(text_output_path, item)
                if os.path.isdir(item_path):
                    print(f"[CLEANUP] Removing unexpected directory in text output: {item_path}")
                    shutil.rmtree(item_path)
        except Exception as e:
            print(f"[WARNING] Failed to cleanup directories from text output: {e}")

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
                "post_cleanup": True,
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
            },
            "formulas": {
                "output": "formulas",
                "function": self.extract_formulas,
                "kwargs": {
                    "lm": {"provider": "ollama", "model_name": "qwen2.5-coder:latest"},
                    "max_attempts": self.nbr_attempts
                }
            }
        }

        os.makedirs(self.output_structure[match_task[task]["output"]], exist_ok=True)

        total_files = len(self.files)
        processed = 0

        # Initialize progress to 0
        self._update_progress(task, 0, total_files)

        for file in self.files:
            input_path = os.path.join(self.folder_path, file)
            filename_no_ext, _ = os.path.splitext(file)
            output_path = self.output_structure[match_task[task]["output"]]
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            print(f"[TASK] Running '{task}' on {file}")
            try:
                match_task[task]["function"](
                    input_path, output_path, **match_task[task]["kwargs"]
                )
                # Mark as extracted after successful completion
                self._mark_document_extracted(file, task)
            except Exception as e:
                print(f"[ERROR] Failed to extract {task} from {file}: {e}")

            # Update progress after each file
            processed += 1
            self._update_progress(task, processed, total_files)

        # Post-extraction cleanup for text task: ensure only files, no directories
        if task == "text" and match_task[task].get("post_cleanup", False):
            self._cleanup_directories_from_text_output(self.output_structure["text"])

    # -------------------- Main Pipeline --------------------

    def pipeline(self):
        for task in self.valid_tasks:
            self.extract_data(task)


# # -------------------- Script Entry --------------------

if __name__ == "__main__":
    folder_path = "../../../../results/raw"
    output_structure = {
        "metadata": "../../../../results/metadata",
        "text": "../../../../results/text",
        "formulas": "../../../../results/formulas",
        "figures": "../../../../results/figures",
        "hierarchy": "../../../../results/hierarchy",
        "shrinks": "../../../../results/shrinks"
    }
    valid_tasks = ["formulas"]

    dpex = DocProcExtractor(
        folder_path=folder_path,
        output_structure=output_structure,
        apply_pipeline=True,
        valid_tasks=valid_tasks,
    )
