import re
import csv
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))
from utils import extract_formulas

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_formulas.py <input.txt> <output.csv>")
        sys.exit(1)

    mmd_file = sys.argv[1]
    output_csv = sys.argv[2]

    extract_formulas(mmd_file, output_csv)
