# Generated from Latex.g4 by ANTLR 4.13.2
from antlr4 import *
if "." in __name__:
    from .LatexParser import LatexParser
else:
    from LatexParser import LatexParser

# This class defines a complete generic visitor for a parse tree produced by LatexParser.

class LatexVisitor(ParseTreeVisitor):

    # Visit a parse tree produced by LatexParser#document.
    def visitDocument(self, ctx:LatexParser.DocumentContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#expr.
    def visitExpr(self, ctx:LatexParser.ExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#equation.
    def visitEquation(self, ctx:LatexParser.EquationContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#relation.
    def visitRelation(self, ctx:LatexParser.RelationContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#addExpr.
    def visitAddExpr(self, ctx:LatexParser.AddExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#mulExpr.
    def visitMulExpr(self, ctx:LatexParser.MulExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#highMulExpr.
    def visitHighMulExpr(self, ctx:LatexParser.HighMulExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#unaryExpr.
    def visitUnaryExpr(self, ctx:LatexParser.UnaryExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#powExpr.
    def visitPowExpr(self, ctx:LatexParser.PowExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#baseExpr.
    def visitBaseExpr(self, ctx:LatexParser.BaseExprContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#atom.
    def visitAtom(self, ctx:LatexParser.AtomContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#atomBase.
    def visitAtomBase(self, ctx:LatexParser.AtomBaseContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#subscriptPart.
    def visitSubscriptPart(self, ctx:LatexParser.SubscriptPartContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#superscriptPart.
    def visitSuperscriptPart(self, ctx:LatexParser.SuperscriptPartContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#fraction.
    def visitFraction(self, ctx:LatexParser.FractionContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#derivative.
    def visitDerivative(self, ctx:LatexParser.DerivativeContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#integral.
    def visitIntegral(self, ctx:LatexParser.IntegralContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#limit.
    def visitLimit(self, ctx:LatexParser.LimitContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#summation.
    def visitSummation(self, ctx:LatexParser.SummationContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#product.
    def visitProduct(self, ctx:LatexParser.ProductContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#sqrt.
    def visitSqrt(self, ctx:LatexParser.SqrtContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#function.
    def visitFunction(self, ctx:LatexParser.FunctionContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#exprList.
    def visitExprList(self, ctx:LatexParser.ExprListContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#trigFunc.
    def visitTrigFunc(self, ctx:LatexParser.TrigFuncContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#logFunc.
    def visitLogFunc(self, ctx:LatexParser.LogFuncContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#customFunc.
    def visitCustomFunc(self, ctx:LatexParser.CustomFuncContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#macro.
    def visitMacro(self, ctx:LatexParser.MacroContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#leftRight.
    def visitLeftRight(self, ctx:LatexParser.LeftRightContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#leftDelim.
    def visitLeftDelim(self, ctx:LatexParser.LeftDelimContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#rightDelim.
    def visitRightDelim(self, ctx:LatexParser.RightDelimContext):
        return self.visitChildren(ctx)


    # Visit a parse tree produced by LatexParser#greekLetter.
    def visitGreekLetter(self, ctx:LatexParser.GreekLetterContext):
        return self.visitChildren(ctx)



del LatexParser