# Generated from Latex.g4 by ANTLR 4.13.2
from antlr4 import *
if "." in __name__:
    from .LatexParser import LatexParser
else:
    from LatexParser import LatexParser

# This class defines a complete listener for a parse tree produced by LatexParser.
class LatexListener(ParseTreeListener):

    # Enter a parse tree produced by LatexParser#document.
    def enterDocument(self, ctx:LatexParser.DocumentContext):
        pass

    # Exit a parse tree produced by LatexParser#document.
    def exitDocument(self, ctx:LatexParser.DocumentContext):
        pass


    # Enter a parse tree produced by LatexParser#expr.
    def enterExpr(self, ctx:LatexParser.ExprContext):
        pass

    # Exit a parse tree produced by LatexParser#expr.
    def exitExpr(self, ctx:LatexParser.ExprContext):
        pass


    # Enter a parse tree produced by LatexParser#equation.
    def enterEquation(self, ctx:LatexParser.EquationContext):
        pass

    # Exit a parse tree produced by LatexParser#equation.
    def exitEquation(self, ctx:LatexParser.EquationContext):
        pass


    # Enter a parse tree produced by LatexParser#relation.
    def enterRelation(self, ctx:LatexParser.RelationContext):
        pass

    # Exit a parse tree produced by LatexParser#relation.
    def exitRelation(self, ctx:LatexParser.RelationContext):
        pass


    # Enter a parse tree produced by LatexParser#addExpr.
    def enterAddExpr(self, ctx:LatexParser.AddExprContext):
        pass

    # Exit a parse tree produced by LatexParser#addExpr.
    def exitAddExpr(self, ctx:LatexParser.AddExprContext):
        pass


    # Enter a parse tree produced by LatexParser#mulExpr.
    def enterMulExpr(self, ctx:LatexParser.MulExprContext):
        pass

    # Exit a parse tree produced by LatexParser#mulExpr.
    def exitMulExpr(self, ctx:LatexParser.MulExprContext):
        pass


    # Enter a parse tree produced by LatexParser#highMulExpr.
    def enterHighMulExpr(self, ctx:LatexParser.HighMulExprContext):
        pass

    # Exit a parse tree produced by LatexParser#highMulExpr.
    def exitHighMulExpr(self, ctx:LatexParser.HighMulExprContext):
        pass


    # Enter a parse tree produced by LatexParser#unaryExpr.
    def enterUnaryExpr(self, ctx:LatexParser.UnaryExprContext):
        pass

    # Exit a parse tree produced by LatexParser#unaryExpr.
    def exitUnaryExpr(self, ctx:LatexParser.UnaryExprContext):
        pass


    # Enter a parse tree produced by LatexParser#powExpr.
    def enterPowExpr(self, ctx:LatexParser.PowExprContext):
        pass

    # Exit a parse tree produced by LatexParser#powExpr.
    def exitPowExpr(self, ctx:LatexParser.PowExprContext):
        pass


    # Enter a parse tree produced by LatexParser#baseExpr.
    def enterBaseExpr(self, ctx:LatexParser.BaseExprContext):
        pass

    # Exit a parse tree produced by LatexParser#baseExpr.
    def exitBaseExpr(self, ctx:LatexParser.BaseExprContext):
        pass


    # Enter a parse tree produced by LatexParser#atom.
    def enterAtom(self, ctx:LatexParser.AtomContext):
        pass

    # Exit a parse tree produced by LatexParser#atom.
    def exitAtom(self, ctx:LatexParser.AtomContext):
        pass


    # Enter a parse tree produced by LatexParser#atomBase.
    def enterAtomBase(self, ctx:LatexParser.AtomBaseContext):
        pass

    # Exit a parse tree produced by LatexParser#atomBase.
    def exitAtomBase(self, ctx:LatexParser.AtomBaseContext):
        pass


    # Enter a parse tree produced by LatexParser#subscriptPart.
    def enterSubscriptPart(self, ctx:LatexParser.SubscriptPartContext):
        pass

    # Exit a parse tree produced by LatexParser#subscriptPart.
    def exitSubscriptPart(self, ctx:LatexParser.SubscriptPartContext):
        pass


    # Enter a parse tree produced by LatexParser#superscriptPart.
    def enterSuperscriptPart(self, ctx:LatexParser.SuperscriptPartContext):
        pass

    # Exit a parse tree produced by LatexParser#superscriptPart.
    def exitSuperscriptPart(self, ctx:LatexParser.SuperscriptPartContext):
        pass


    # Enter a parse tree produced by LatexParser#fraction.
    def enterFraction(self, ctx:LatexParser.FractionContext):
        pass

    # Exit a parse tree produced by LatexParser#fraction.
    def exitFraction(self, ctx:LatexParser.FractionContext):
        pass


    # Enter a parse tree produced by LatexParser#derivative.
    def enterDerivative(self, ctx:LatexParser.DerivativeContext):
        pass

    # Exit a parse tree produced by LatexParser#derivative.
    def exitDerivative(self, ctx:LatexParser.DerivativeContext):
        pass


    # Enter a parse tree produced by LatexParser#integral.
    def enterIntegral(self, ctx:LatexParser.IntegralContext):
        pass

    # Exit a parse tree produced by LatexParser#integral.
    def exitIntegral(self, ctx:LatexParser.IntegralContext):
        pass


    # Enter a parse tree produced by LatexParser#limit.
    def enterLimit(self, ctx:LatexParser.LimitContext):
        pass

    # Exit a parse tree produced by LatexParser#limit.
    def exitLimit(self, ctx:LatexParser.LimitContext):
        pass


    # Enter a parse tree produced by LatexParser#summation.
    def enterSummation(self, ctx:LatexParser.SummationContext):
        pass

    # Exit a parse tree produced by LatexParser#summation.
    def exitSummation(self, ctx:LatexParser.SummationContext):
        pass


    # Enter a parse tree produced by LatexParser#product.
    def enterProduct(self, ctx:LatexParser.ProductContext):
        pass

    # Exit a parse tree produced by LatexParser#product.
    def exitProduct(self, ctx:LatexParser.ProductContext):
        pass


    # Enter a parse tree produced by LatexParser#sqrt.
    def enterSqrt(self, ctx:LatexParser.SqrtContext):
        pass

    # Exit a parse tree produced by LatexParser#sqrt.
    def exitSqrt(self, ctx:LatexParser.SqrtContext):
        pass


    # Enter a parse tree produced by LatexParser#function.
    def enterFunction(self, ctx:LatexParser.FunctionContext):
        pass

    # Exit a parse tree produced by LatexParser#function.
    def exitFunction(self, ctx:LatexParser.FunctionContext):
        pass


    # Enter a parse tree produced by LatexParser#exprList.
    def enterExprList(self, ctx:LatexParser.ExprListContext):
        pass

    # Exit a parse tree produced by LatexParser#exprList.
    def exitExprList(self, ctx:LatexParser.ExprListContext):
        pass


    # Enter a parse tree produced by LatexParser#trigFunc.
    def enterTrigFunc(self, ctx:LatexParser.TrigFuncContext):
        pass

    # Exit a parse tree produced by LatexParser#trigFunc.
    def exitTrigFunc(self, ctx:LatexParser.TrigFuncContext):
        pass


    # Enter a parse tree produced by LatexParser#logFunc.
    def enterLogFunc(self, ctx:LatexParser.LogFuncContext):
        pass

    # Exit a parse tree produced by LatexParser#logFunc.
    def exitLogFunc(self, ctx:LatexParser.LogFuncContext):
        pass


    # Enter a parse tree produced by LatexParser#customFunc.
    def enterCustomFunc(self, ctx:LatexParser.CustomFuncContext):
        pass

    # Exit a parse tree produced by LatexParser#customFunc.
    def exitCustomFunc(self, ctx:LatexParser.CustomFuncContext):
        pass


    # Enter a parse tree produced by LatexParser#macro.
    def enterMacro(self, ctx:LatexParser.MacroContext):
        pass

    # Exit a parse tree produced by LatexParser#macro.
    def exitMacro(self, ctx:LatexParser.MacroContext):
        pass


    # Enter a parse tree produced by LatexParser#leftRight.
    def enterLeftRight(self, ctx:LatexParser.LeftRightContext):
        pass

    # Exit a parse tree produced by LatexParser#leftRight.
    def exitLeftRight(self, ctx:LatexParser.LeftRightContext):
        pass


    # Enter a parse tree produced by LatexParser#leftDelim.
    def enterLeftDelim(self, ctx:LatexParser.LeftDelimContext):
        pass

    # Exit a parse tree produced by LatexParser#leftDelim.
    def exitLeftDelim(self, ctx:LatexParser.LeftDelimContext):
        pass


    # Enter a parse tree produced by LatexParser#rightDelim.
    def enterRightDelim(self, ctx:LatexParser.RightDelimContext):
        pass

    # Exit a parse tree produced by LatexParser#rightDelim.
    def exitRightDelim(self, ctx:LatexParser.RightDelimContext):
        pass


    # Enter a parse tree produced by LatexParser#greekLetter.
    def enterGreekLetter(self, ctx:LatexParser.GreekLetterContext):
        pass

    # Exit a parse tree produced by LatexParser#greekLetter.
    def exitGreekLetter(self, ctx:LatexParser.GreekLetterContext):
        pass



del LatexParser