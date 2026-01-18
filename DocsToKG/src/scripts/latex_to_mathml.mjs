import mjAPI from "mathjax-node";
import fs from "fs";
import path from "path";

// Configure MathJax
mjAPI.config({
  MathJax: {
    // Standard MathJax configuration
  },
});

mjAPI.start();

/**
 * Converts LaTeX math expression to MathML
 * @param {string} latex - The LaTeX expression to convert
 * @param {boolean} display - Whether to use display mode (default: false)
 * @returns {Promise<string>} - Promise that resolves to the MathML string
 */
export function latexToMathML(latex, display = false) {
  return new Promise((resolve, reject) => {
    mjAPI.typeset(
      {
        math: latex,
        format: display ? "TeX" : "inline-TeX",
        mml: true,
      },
      (data) => {
        if (data.errors) {
          reject(new Error(data.errors.join("\n")));
        } else {
          resolve(data.mml);
        }
      },
    );
  });
}

/**
 * Converts LaTeX to MathML with optional formatting
 * @param {string} latex - The LaTeX expression to convert
 * @param {boolean} display - Whether to use display mode
 * @param {boolean} pretty - Whether to format the output (default: true)
 * @returns {Promise<string>} - Promise that resolves to the MathML string
 */
export async function convertLatex(latex, display = false, pretty = true) {
  try {
    const mathml = await latexToMathML(latex, display);

    if (pretty) {
      return formatXML(mathml);
    }

    return mathml;
  } catch (error) {
    throw error;
  }
}

/**
 * Formats XML string with indentation
 * @param {string} xml - The XML string to format
 * @returns {string} - Formatted XML string
 */
function formatXML(xml) {
  let formatted = "";
  let indent = "";

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      indent = indent.substring(2);
    }
    formatted += indent + "<" + node + ">\n";
    if (node.match(/^<?\w[^>]*[^\/]$/)) {
      indent += "  ";
    }
  });

  return formatted.substring(1, formatted.length - 2);
}

/**
 * Parse command line arguments
 * @returns {Object} - Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    latex: null,
    output: null,
    display: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-o" || arg === "--output") {
      result.output = args[++i];
    } else if (arg === "-d" || arg === "--display") {
      result.display = true;
    } else if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (!result.latex) {
      result.latex = arg;
    }
  }

  return result;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
LaTeX to MathML Converter

Usage:
  node prog.mjs "latex code" [options]

Arguments:
  latex code          The LaTeX expression to convert (required)

Options:
  -o, --output PATH   Output file path (if not specified, prints to stdout)
  -d, --display       Use display mode (block math)
  -h, --help          Show this help message

Examples:
  node prog.mjs "x^2 + y^2 = z^2"
  node prog.mjs "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}" -o output.xml
  node prog.mjs "\\\\int_0^1 x^2 dx" --display -o integral.xml
`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const args = parseArgs();

    // Show help if requested or no latex provided
    if (args.help || !args.latex) {
      showHelp();
      process.exit(args.help ? 0 : 1);
    }

    try {
      // Convert LaTeX to MathML
      const mathml = await convertLatex(args.latex, args.display, true);

      // Output to file or stdout
      if (args.output) {
        const outputPath = path.resolve(args.output);
        fs.writeFileSync(outputPath, mathml, "utf8");
        console.log(`MathML saved to: ${outputPath}`);
      } else {
        console.log(mathml);
      }
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  })();
}
