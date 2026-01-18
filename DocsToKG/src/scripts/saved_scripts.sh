python3 src/scripts/extract_metadata.py results/sample/sample.pdf results/sample/sample.json
python3 src/scripts/extract_text.py results/sample/sample.pdf results/sample/sample.txt
python3 src/scripts/extract_formulas.py results/sample/sample.txt results/sample/sample.csv
python3 extract_figures.py ../../results/sample/sample.pdf ../../results/sample/figures
python3 remove_non_significant_figures.py --folder ../../results/sample/figures --labels "Figure" "Table" "Text" "Technical drawing" "Scientific figure" "Schema" "Other" --accepted "Figure" "Technical drawing" "Scientific figure" "Schema" --threshold 0.6
node latex_to_mathml.mjs "x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}" -o ../../results/formula_tests/formula_1.xml
