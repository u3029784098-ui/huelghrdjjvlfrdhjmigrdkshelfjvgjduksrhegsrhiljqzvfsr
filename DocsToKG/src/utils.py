import re
import csv
import argparse
import exiftool
import json
import subprocess
import shutil
import fitz  # PyMuPDF
import os
import layoutparser as lp
import cv2
import matplotlib.pyplot as plt
import torch
from PIL import Image
import clip  # pip install git+https://github.com/openai/CLIP.git


def extract_formulas(mmd_file, output_csv):
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
