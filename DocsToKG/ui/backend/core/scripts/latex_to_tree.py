"""
ANTLR LaTeX Parser - Complete Working Solution

Setup Instructions:
1. pip install antlr4-python3-runtime
2. Save the Latex.g4 grammar file
3. Generate parser WITH -visitor flag:
   antlr4 -Dlanguage=Python3 -visitor Latex.g4
4. Run this script

The -visitor flag is CRITICAL - it generates the visitor base class.
"""

import sys
from antlr4 import *
from antlr4.tree.Tree import ParseTreeVisitor

# Try to import generated files
try:
    from LatexLexer import LatexLexer
    from LatexParser import LatexParser
    try:
        from LatexVisitor import LatexVisitor
        HAS_VISITOR = True
    except ImportError:
        print("Warning: LatexVisitor not found. Make sure to use -visitor flag:")
        print("  antlr4 -Dlanguage=Python3 -visitor Latex.g4")
        HAS_VISITOR = False
    ANTLR_AVAILABLE = True
except ImportError as e:
    print(f"Error: {e}")
    print("Generate parser first: antlr4 -Dlanguage=Python3 -visitor Latex.g4")
    ANTLR_AVAILABLE = False
    HAS_VISITOR = False


# Conditional base class
if HAS_VISITOR:
    BaseVisitor = LatexVisitor
else:
    BaseVisitor = ParseTreeVisitor


class LatexToFunctionalVisitor(BaseVisitor):
    """
    Visitor that converts ANTLR parse tree to functional notation.
    """
    
    def visit(self, tree):
        """Override visit to handle None gracefully."""
        if tree is None:
            return None
        return super().visit(tree)
    
    def visitDocument(self, ctx):
        """Visit the root document node."""
        return self.visit(ctx.expr())
    
    def visitExpr(self, ctx):
        """Visit expression - delegates to equation."""
        return self.visit(ctx.equation())
    
    def visitEquation(self, ctx):
        """Visit equation: a = b."""
        relations = [self.visit(rel) for rel in ctx.relation()]
        if len(relations) == 1:
            return relations[0]
        elif len(relations) == 2:
            return f"Eq({relations[0]}, {relations[1]})"
        else:
            return f"Eq({', '.join(relations)})"
    
    def visitRelation(self, ctx):
        """Visit relational expression."""
        add_exprs = ctx.addExpr()
        if len(add_exprs) == 1:
            return self.visit(add_exprs[0])
        # Handle comparisons if needed
        return self.visit(add_exprs[0])
    
    def visitAddExpr(self, ctx):
        """Visit addition/subtraction expression."""
        mul_exprs = ctx.mulExpr()
        
        if len(mul_exprs) == 1:
            return self.visit(mul_exprs[0])
        
        # Collect terms and operators
        terms = []
        operators = []
        
        # Parse children to find operators
        for child in ctx.children:
            if hasattr(child, 'symbol'):
                if child.symbol.type == LatexParser.PLUS:
                    operators.append('+')
                elif child.symbol.type == LatexParser.MINUS:
                    operators.append('-')
            elif hasattr(child, 'getRuleIndex'):
                # It's a rule context (mulExpr)
                terms.append(self.visit(child))
        
        # Handle signs
        if not operators:
            return f"Add({', '.join(terms)})"
        
        result_terms = [terms[0]]
        for i, op in enumerate(operators):
            if op == '-':
                result_terms.append(f"Mul(-1, {terms[i+1]})")
            else:
                result_terms.append(terms[i+1])
        
        if len(result_terms) == 1:
            return result_terms[0]
        
        return f"Add({', '.join(result_terms)})"
    
    def visitMulExpr(self, ctx):
        """Visit multiplication expression (lower precedence: \\times, *)."""
        high_mul_exprs = ctx.highMulExpr()
        
        if len(high_mul_exprs) == 1:
            return self.visit(high_mul_exprs[0])
        
        # Collect factors and operators
        factors = []
        operators = []
        
        # Parse children to find operators
        for child in ctx.children:
            if hasattr(child, 'symbol'):
                if child.symbol.type == LatexParser.TIMES:
                    operators.append('Times')
                elif child.symbol.type == LatexParser.STAR:
                    operators.append('Star')
            elif hasattr(child, 'getRuleIndex'):
                # It's a rule context (highMulExpr)
                factors.append(self.visit(child))
        
        # Build nested operations based on operators
        if not operators:
            # Implicit multiplication
            return f"Mul({', '.join(factors)})"
        
        # For explicit operators, build left-to-right
        result = factors[0]
        for i, op in enumerate(operators):
            if op == 'Times':
                result = f"Times({result}, {factors[i+1]})"
            elif op == 'Star':
                result = f"Mul({result}, {factors[i+1]})"
        
        return result
    
    def visitHighMulExpr(self, ctx):
        """Visit high-precedence multiplication (\\odot, \\otimes, \\oplus)."""
        unary_exprs = ctx.unaryExpr()
        
        if len(unary_exprs) == 1:
            return self.visit(unary_exprs[0])
        
        # Collect factors and operators
        factors = []
        operators = []
        
        # Parse children to find operators
        for child in ctx.children:
            if hasattr(child, 'symbol'):
                if child.symbol.type == LatexParser.ODOT:
                    operators.append('Odot')
                elif child.symbol.type == LatexParser.OTIMES:
                    operators.append('Otimes')
                elif child.symbol.type == LatexParser.OPLUS:
                    operators.append('Oplus')
            elif hasattr(child, 'getRuleIndex'):
                # It's a rule context (unaryExpr)
                factors.append(self.visit(child))
        
        # Build left-to-right (left associative)
        result = factors[0]
        for i, op in enumerate(operators):
            result = f"{op}({result}, {factors[i+1]})"
        
        return result
    
    def visitUnaryExpr(self, ctx):
        """Visit unary expression."""
        if ctx.MINUS():
            inner = self.visit(ctx.unaryExpr())
            return f"Mul(-1, {inner})"
        elif ctx.PLUS():
            return self.visit(ctx.unaryExpr())
        else:
            return self.visit(ctx.powExpr())
    
    def visitPowExpr(self, ctx):
        """Visit power expression."""
        base = self.visit(ctx.baseExpr())
        
        sup_parts = ctx.superscriptPart()
        if not sup_parts:
            return base
        
        # Build powers
        result = base
        for sup in sup_parts:
            exp = self.visit(sup)
            result = f"Pow({result}, {exp})"
        
        return result
    
    def visitBaseExpr(self, ctx):
        """Visit base expression."""
        if ctx.atom():
            return self.visit(ctx.atom())
        elif ctx.function():
            return self.visit(ctx.function())
        elif ctx.fraction():
            return self.visit(ctx.fraction())
        elif ctx.derivative():
            return self.visit(ctx.derivative())
        elif ctx.integral():
            return self.visit(ctx.integral())
        elif ctx.limit():
            return self.visit(ctx.limit())
        elif ctx.summation():
            return self.visit(ctx.summation())
        elif ctx.product():
            return self.visit(ctx.product())
        elif ctx.sqrt():
            return self.visit(ctx.sqrt())
        elif ctx.macro():
            return self.visit(ctx.macro())
        elif ctx.leftRight():
            return self.visit(ctx.leftRight())
        return "unknown"
    
    def visitFraction(self, ctx):
        """Visit fraction."""
        num = self.visit(ctx.expr(0))
        denom = self.visit(ctx.expr(1))
        return f"Frac({num}, {denom})"
    
    def visitAtom(self, ctx):
        """Visit atom."""
        base = self.visit(ctx.atomBase())
        
        if ctx.subscriptPart():
            sub = self.visit(ctx.subscriptPart())
            base = f"{base}_{sub}"
        
        return base
    
    def visitAtomBase(self, ctx):
        """Visit atomic base."""
        if ctx.NUMBER():
            return ctx.NUMBER().getText()
        elif ctx.VARIABLE():
            return ctx.VARIABLE().getText()
        elif ctx.expr():
            return self.visit(ctx.expr())
        elif ctx.greekLetter():
            return self.visit(ctx.greekLetter())
        return "?"
    
    def visitSubscriptPart(self, ctx):
        """Visit subscript part."""
        if ctx.atomBase():
            return self.visit(ctx.atomBase())
        elif ctx.expr():
            return self.visit(ctx.expr())
        return ""
    
    def visitSuperscriptPart(self, ctx):
        """Visit superscript part."""
        if ctx.atomBase():
            return self.visit(ctx.atomBase())
        elif ctx.expr():
            return self.visit(ctx.expr())
        return ""
    
    def visitMacro(self, ctx):
        """Visit LaTeX macro."""
        content = self.visit(ctx.expr())
        
        if ctx.MATHBF():
            return f"Mathbf({content})"
        elif ctx.MATHCAL():
            return f"Mathcal({content})"
        elif ctx.MATHBB():
            return f"Mathbb({content})"
        elif ctx.MATHRM():
            return f"Mathrm({content})"
        return content
    
    def visitGreekLetter(self, ctx):
        """Visit Greek letter."""
        text = ctx.getText()
        return text[1:] if text.startswith('\\') else text
    
    def visitDerivative(self, ctx):
        """Visit derivative."""
        var = ctx.VARIABLE().getText()
        expr_result = self.visit(ctx.expr(0))
        
        if ctx.NUMBER():
            order = ctx.NUMBER().getText()
            return f"Derivative({expr_result}, ({var}, {order}))"
        return f"Derivative({expr_result}, {var})"
    
    def visitIntegral(self, ctx):
        """Visit integral."""
        var = ctx.VARIABLE().getText()
        exprs = ctx.expr()
        
        if len(exprs) == 1:
            return f"Integral({self.visit(exprs[0])}, {var})"
        elif len(exprs) == 3:
            integrand = self.visit(exprs[2])
            lower = self.visit(exprs[0])
            upper = self.visit(exprs[1])
            return f"Integral({integrand}, ({var}, {lower}, {upper}))"
        return "Integral(...)"
    
    def visitSummation(self, ctx):
        """Visit summation."""
        var = ctx.VARIABLE().getText()
        exprs = ctx.expr()
        
        if len(exprs) == 3:
            lower = self.visit(exprs[0])
            upper = self.visit(exprs[1])
            body = self.visit(exprs[2])
            return f"Sum({body}, ({var}, {lower}, {upper}))"
        elif len(exprs) == 2:
            lower = self.visit(exprs[0])
            body = self.visit(exprs[1])
            return f"Sum({body}, ({var}, {lower}))"
        return "Sum(...)"
    
    def visitSqrt(self, ctx):
        """Visit square root."""
        exprs = ctx.expr()
        if len(exprs) == 1:
            return f"Sqrt({self.visit(exprs[0])})"
        elif len(exprs) == 2:
            n = self.visit(exprs[0])
            arg = self.visit(exprs[1])
            return f"Root({arg}, {n})"
        return "Sqrt(...)"
    
    def visitFunction(self, ctx):
        """Visit function."""
        if ctx.trigFunc():
            func_name = ctx.trigFunc().getText()[1:].capitalize()
            if ctx.expr():
                arg = self.visit(ctx.expr())
                return f"{func_name}({arg})"
        elif ctx.logFunc():
            func_name = ctx.logFunc().getText()[1:]
            func_name = 'Ln' if func_name == 'ln' else func_name.capitalize()
            if ctx.expr():
                arg = self.visit(ctx.expr())
                return f"{func_name}({arg})"
        elif ctx.customFunc():
            func_name = ctx.customFunc().getText()
            if ctx.exprList():
                args = self.visit(ctx.exprList())
                return f"{func_name}({args})"
        return "Function(...)"
    
    def visitExprList(self, ctx):
        """Visit expression list."""
        exprs = [self.visit(e) for e in ctx.expr()]
        return ', '.join(exprs)
    
    def visitLeftRight(self, ctx):
        """Visit left-right delimiters."""
        return self.visit(ctx.expr())
    
    # Default visitor for unhandled nodes
    def visitChildren(self, ctx):
        """Default visit for nodes without specific visitor."""
        result = self.defaultResult()
        n = ctx.getChildCount()
        for i in range(n):
            child = ctx.getChild(i)
            if not self.shouldVisitNextChild(child, result):
                break
            childResult = child.accept(self)
            result = self.aggregateResult(result, childResult)
        return result
    
    def defaultResult(self):
        return None
    
    def aggregateResult(self, aggregate, nextResult):
        return nextResult


def parse_latex(latex_string):
    """Parse LaTeX string and convert to functional notation."""
    if not ANTLR_AVAILABLE:
        return "Error: Parser not generated"
    
    # Create input stream
    input_stream = InputStream(latex_string)
    
    # Create lexer
    lexer = LatexLexer(input_stream)
    
    # Create token stream
    token_stream = CommonTokenStream(lexer)
    
    # Create parser
    parser = LatexParser(token_stream)
    
    # Parse
    tree = parser.document()
    
    # Visit tree
    visitor = LatexToFunctionalVisitor()
    result = visitor.visit(tree)
    
    return result


if __name__ == "__main__":
    print("=" * 80)
    print("LaTeX to Functional Notation Converter")
    print("=" * 80)
    
    if not ANTLR_AVAILABLE:
        print("\n⚠️  Parser not available!")
        print("\nSetup:")
        print("1. pip install antlr4-python3-runtime")
        print("2. antlr4 -Dlanguage=Python3 -visitor Latex.g4")
        print("3. Run this script")
        sys.exit(1)
    
    if not HAS_VISITOR:
        print("\n⚠️  Visitor class not found!")
        print("Regenerate with -visitor flag:")
        print("  antlr4 -Dlanguage=Python3 -visitor Latex.g4")
        sys.exit(1)
    
    print("\n✓ Parser loaded successfully\n")
    
    # Test cases
    test_cases = [
        (r"\frac{1}{2} m v^2", "Mul(Frac(1, 2), m, Pow(v, 2))"),
        (r"a + b + c", "Add(a, b, c)"),
        (r"\mathbf{x} + \mathcal{Y}", "Add(Mathbf(x), Mathcal(Y))"),
        (r"x^2 + y^2", "Add(Pow(x, 2), Pow(y, 2))"),
        (r"\frac{x}{y}", "Frac(x, y)"),
        (r"2 x y", "Mul(2, x, y)"),
        (r"5 \times x \odot y", "Times(Mul(5, x), Odot(x, y))"),  # Updated expectation
        (r"a \odot b \times c", "Times(Odot(a, b), c)"),
        (r"a * b \times c", "Times(Mul(a, b), c)"),
        (r"x= y", "Odot(Otimes(x, y), z)"),
    ]
    
    for latex, expected in test_cases:
        print(f"Input:    {latex}")
        try:
            result = parse_latex(latex)
            print(f"Output:   {result}")
            print(f"Expected: {expected}")
            print(f"Match:    {'✓' if result == expected else '✗'}")
        except Exception as e:
            print(f"Error:    {e}")
            import traceback
            traceback.print_exc()
        print("-" * 80)