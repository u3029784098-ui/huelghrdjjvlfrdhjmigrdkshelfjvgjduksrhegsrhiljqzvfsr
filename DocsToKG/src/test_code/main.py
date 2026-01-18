# import subprocess
# import tempfile


# def check_latex_string(latex_code: str):
#     """
#     Validate LaTeX code using LaCheck.
#     Returns a tuple (is_valid, output), where is_valid is True/False
#     and output is LaCheck's feedback.
#     """
#     with tempfile.NamedTemporaryFile(mode="w+", suffix=".tex", delete=False) as tmpfile:
#         tmpfile.write(latex_code)
#         tmpfile.flush()  # ensure content is written

#         try:
#             result = subprocess.run(
#                 ["lacheck", tmpfile.name], capture_output=True, text=True
#             )
#             output = result.stdout.strip()
#             is_valid = len(output) == 0  # no messages = valid
#             return is_valid, output
#         finally:
#             tmpfile.close()


# # Example usage
# latex_examples = [
#     r"\mathbb{ x^2 + y^2 = 1",
# ]

# for latex in latex_examples:
#     valid, msg = check_latex_string(latex)
#     print(f"'{latex}' -> {'Valid' if valid else 'Invalid'}")
#     if msg:
#         print("LaCheck output:")
#         print(msg)
#         print()

import subprocess
import tempfile
import dspy
from dspy import InputField, OutputField, Signature
import pandas as pd
from tqdm import tqdm

# Configure DSPy with Ollama
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


def check_latex_string(latex_code: str):
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


def validate_and_correct_latex(latex_code: str, max_attempts: int = 3, lm):
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
    dspy.configure(lm = lm)

    for attempt in range(max_attempts):
        is_valid, error_msg = check_latex_string(current_code)

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
    is_valid, error_msg = check_latex_string(current_code)
    return is_valid, current_code, correction_history


def validate_document(path_file, save_path):
    df = pd.read_csv(path_file)
    validated_df = df.copy()
    validated_df["history"] = None

    for i in tqdm(range(len(df)), description="Number of formulas"):
        latex = df.at(i, "Formula")
        is_valid, final_code, history = validate_and_correct_latex(latex)

        if not is_valid:
            validated_df["Formula"] = final_code

        validated_df["history"] = "history"
    pd.save_csv(save_path)
    return validated_df


def main():
    # Initialize Ollama LM (using qwen2.5-coder which is good for code/LaTeX)
    # You can also try: "deepseek-coder", "codellama", "mistral"
    lm = OllamaLM(model="qwen2.5-coder:latest")
    dspy.configure(lm=lm)

    # Example LaTeX strings to test
    latex_examples = [
        r"\mathbb{ x^2 + y^2 = 1",  # Missing closing brace
        r"\frac{a}{b",  # Missing closing brace
        r"\int_0^1 x^2 dx",  # Valid
        r"\sum_{i=1^n i^2",  # Missing closing brace
        r"x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}",  # Valid
    ]

    print("=" * 70)
    print("LaTeX Validator and AI Corrector")
    print("=" * 70)

    for i, latex in enumerate(latex_examples, 1):
        print(f"\n{'=' * 70}")
        print(f"Example {i}: {latex}")
        print(f"{'=' * 70}")

        is_valid, final_code, history = validate_and_correct_latex(latex)

        if is_valid:
            print(f"\n✓ Final result: VALID")
            print(f"Final code: {final_code}")
        else:
            print(f"\n✗ Final result: INVALID (could not be corrected)")
            print(f"Final code: {final_code}")

        if history:
            print(f"\nCorrection history ({len(history)} attempts):")
            for entry in history:
                print(f"  Attempt {entry['attempt']}:")
                print(f"    Error: {entry['error'][:100]}...")
                print(f"    Corrected to: {entry['corrected']}")


if __name__ == "__main__":
    main()
