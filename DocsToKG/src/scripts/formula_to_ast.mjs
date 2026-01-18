import { parseMath } from "latex-math";
import fs from "fs";

// Get arguments from command line
// Usage: node script.mjs "\\frac{1}{2}" output.json
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node script.mjs '<latex>' <output_path>");
  process.exit(1);
}

const latex = args[0]; // LaTeX input string
const outputPath = args[1]; // Output JSON file path

// Parse LaTeX into AST
const ast = parseMath(latex);

// Save AST to JSON file
fs.writeFileSync(outputPath, JSON.stringify(ast, null, 2), "utf-8");

console.log(`AST for LaTeX '${latex}' saved to ${outputPath}`);

// Optional: log keys and values
for (const [key, value] of Object.entries(ast)) {
  console.log(`Key: ${key}, Value:`, value);
}
