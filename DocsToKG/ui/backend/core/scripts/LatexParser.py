# Generated from Latex.g4 by ANTLR 4.13.2
# encoding: utf-8
from antlr4 import *
from io import StringIO
import sys
if sys.version_info[1] > 5:
	from typing import TextIO
else:
	from typing.io import TextIO

def serializedATN():
    return [
        4,1,73,422,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,1,0,1,0,1,0,1,1,1,1,1,2,
        1,2,1,2,5,2,71,8,2,10,2,12,2,74,9,2,1,3,1,3,1,3,5,3,79,8,3,10,3,
        12,3,82,9,3,1,4,1,4,1,4,5,4,87,8,4,10,4,12,4,90,9,4,1,5,1,5,1,5,
        5,5,95,8,5,10,5,12,5,98,9,5,1,5,1,5,4,5,102,8,5,11,5,12,5,103,3,
        5,106,8,5,1,6,1,6,1,6,5,6,111,8,6,10,6,12,6,114,9,6,1,7,1,7,1,7,
        1,7,1,7,3,7,121,8,7,1,8,1,8,1,8,5,8,126,8,8,10,8,12,8,129,9,8,1,
        9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,142,8,9,1,10,1,10,
        1,10,3,10,147,8,10,1,11,1,11,1,11,1,11,1,11,1,11,1,11,1,11,1,11,
        1,11,1,11,1,11,1,11,1,11,1,11,3,11,164,8,11,1,12,1,12,1,12,1,12,
        1,12,3,12,171,8,12,1,13,1,13,1,13,1,13,1,13,3,13,178,8,13,1,14,1,
        14,1,14,1,14,1,14,1,14,1,14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,
        15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,
        15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,
        15,1,15,1,15,1,15,1,15,1,15,3,15,226,8,15,1,16,1,16,1,16,1,16,1,
        16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,
        16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,3,16,255,8,16,1,
        17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,18,1,18,1,18,1,18,1,
        18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,
        18,1,18,1,18,1,18,1,18,3,18,288,8,18,1,19,1,19,1,19,1,19,1,19,1,
        19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,
        19,1,19,1,19,1,19,3,19,312,8,19,1,20,1,20,1,20,1,20,1,20,1,20,1,
        20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,327,8,20,1,21,1,21,1,21,1,
        21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,
        21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,
        21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,
        21,3,21,372,8,21,1,22,1,22,1,22,5,22,377,8,22,10,22,12,22,380,9,
        22,1,23,1,23,1,24,1,24,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,26,1,
        26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,
        26,3,26,408,8,26,1,27,1,27,1,27,1,27,1,27,1,27,1,28,1,28,1,29,1,
        29,1,30,1,30,1,30,0,0,31,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,
        30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,0,10,1,0,47,51,1,
        0,42,43,2,0,44,44,55,55,1,0,52,54,1,0,9,20,1,0,21,23,1,0,71,72,5,
        0,56,56,58,58,60,60,64,64,68,68,5,0,57,57,59,59,61,61,64,64,69,69,
        1,0,24,35,435,0,62,1,0,0,0,2,65,1,0,0,0,4,67,1,0,0,0,6,75,1,0,0,
        0,8,83,1,0,0,0,10,105,1,0,0,0,12,107,1,0,0,0,14,120,1,0,0,0,16,122,
        1,0,0,0,18,141,1,0,0,0,20,143,1,0,0,0,22,163,1,0,0,0,24,170,1,0,
        0,0,26,177,1,0,0,0,28,179,1,0,0,0,30,225,1,0,0,0,32,254,1,0,0,0,
        34,256,1,0,0,0,36,287,1,0,0,0,38,311,1,0,0,0,40,326,1,0,0,0,42,371,
        1,0,0,0,44,373,1,0,0,0,46,381,1,0,0,0,48,383,1,0,0,0,50,385,1,0,
        0,0,52,407,1,0,0,0,54,409,1,0,0,0,56,415,1,0,0,0,58,417,1,0,0,0,
        60,419,1,0,0,0,62,63,3,2,1,0,63,64,5,0,0,1,64,1,1,0,0,0,65,66,3,
        4,2,0,66,3,1,0,0,0,67,72,3,6,3,0,68,69,5,46,0,0,69,71,3,6,3,0,70,
        68,1,0,0,0,71,74,1,0,0,0,72,70,1,0,0,0,72,73,1,0,0,0,73,5,1,0,0,
        0,74,72,1,0,0,0,75,80,3,8,4,0,76,77,7,0,0,0,77,79,3,8,4,0,78,76,
        1,0,0,0,79,82,1,0,0,0,80,78,1,0,0,0,80,81,1,0,0,0,81,7,1,0,0,0,82,
        80,1,0,0,0,83,88,3,10,5,0,84,85,7,1,0,0,85,87,3,10,5,0,86,84,1,0,
        0,0,87,90,1,0,0,0,88,86,1,0,0,0,88,89,1,0,0,0,89,9,1,0,0,0,90,88,
        1,0,0,0,91,96,3,12,6,0,92,93,7,2,0,0,93,95,3,12,6,0,94,92,1,0,0,
        0,95,98,1,0,0,0,96,94,1,0,0,0,96,97,1,0,0,0,97,106,1,0,0,0,98,96,
        1,0,0,0,99,101,3,12,6,0,100,102,3,12,6,0,101,100,1,0,0,0,102,103,
        1,0,0,0,103,101,1,0,0,0,103,104,1,0,0,0,104,106,1,0,0,0,105,91,1,
        0,0,0,105,99,1,0,0,0,106,11,1,0,0,0,107,112,3,14,7,0,108,109,7,3,
        0,0,109,111,3,14,7,0,110,108,1,0,0,0,111,114,1,0,0,0,112,110,1,0,
        0,0,112,113,1,0,0,0,113,13,1,0,0,0,114,112,1,0,0,0,115,116,5,43,
        0,0,116,121,3,14,7,0,117,118,5,42,0,0,118,121,3,14,7,0,119,121,3,
        16,8,0,120,115,1,0,0,0,120,117,1,0,0,0,120,119,1,0,0,0,121,15,1,
        0,0,0,122,127,3,18,9,0,123,124,5,63,0,0,124,126,3,26,13,0,125,123,
        1,0,0,0,126,129,1,0,0,0,127,125,1,0,0,0,127,128,1,0,0,0,128,17,1,
        0,0,0,129,127,1,0,0,0,130,142,3,20,10,0,131,142,3,42,21,0,132,142,
        3,28,14,0,133,142,3,30,15,0,134,142,3,32,16,0,135,142,3,34,17,0,
        136,142,3,36,18,0,137,142,3,38,19,0,138,142,3,40,20,0,139,142,3,
        52,26,0,140,142,3,54,27,0,141,130,1,0,0,0,141,131,1,0,0,0,141,132,
        1,0,0,0,141,133,1,0,0,0,141,134,1,0,0,0,141,135,1,0,0,0,141,136,
        1,0,0,0,141,137,1,0,0,0,141,138,1,0,0,0,141,139,1,0,0,0,141,140,
        1,0,0,0,142,19,1,0,0,0,143,146,3,22,11,0,144,145,5,62,0,0,145,147,
        3,24,12,0,146,144,1,0,0,0,146,147,1,0,0,0,147,21,1,0,0,0,148,164,
        5,70,0,0,149,164,5,72,0,0,150,164,3,60,30,0,151,152,5,56,0,0,152,
        153,3,2,1,0,153,154,5,57,0,0,154,164,1,0,0,0,155,156,5,58,0,0,156,
        157,3,2,1,0,157,158,5,59,0,0,158,164,1,0,0,0,159,160,5,60,0,0,160,
        161,3,2,1,0,161,162,5,61,0,0,162,164,1,0,0,0,163,148,1,0,0,0,163,
        149,1,0,0,0,163,150,1,0,0,0,163,151,1,0,0,0,163,155,1,0,0,0,163,
        159,1,0,0,0,164,23,1,0,0,0,165,171,3,22,11,0,166,167,5,58,0,0,167,
        168,3,2,1,0,168,169,5,59,0,0,169,171,1,0,0,0,170,165,1,0,0,0,170,
        166,1,0,0,0,171,25,1,0,0,0,172,178,3,22,11,0,173,174,5,58,0,0,174,
        175,3,2,1,0,175,176,5,59,0,0,176,178,1,0,0,0,177,172,1,0,0,0,177,
        173,1,0,0,0,178,27,1,0,0,0,179,180,5,2,0,0,180,181,5,58,0,0,181,
        182,3,2,1,0,182,183,5,59,0,0,183,184,5,58,0,0,184,185,3,2,1,0,185,
        186,5,59,0,0,186,29,1,0,0,0,187,188,5,2,0,0,188,189,5,58,0,0,189,
        190,5,1,0,0,190,191,5,59,0,0,191,192,5,58,0,0,192,193,5,1,0,0,193,
        194,5,72,0,0,194,195,5,59,0,0,195,196,5,56,0,0,196,197,3,2,1,0,197,
        198,5,57,0,0,198,226,1,0,0,0,199,200,5,2,0,0,200,201,5,58,0,0,201,
        202,5,1,0,0,202,203,5,59,0,0,203,204,5,58,0,0,204,205,5,1,0,0,205,
        206,5,72,0,0,206,207,5,63,0,0,207,208,5,70,0,0,208,209,5,59,0,0,
        209,210,5,56,0,0,210,211,3,2,1,0,211,212,5,57,0,0,212,226,1,0,0,
        0,213,214,5,2,0,0,214,215,5,58,0,0,215,216,5,8,0,0,216,217,5,59,
        0,0,217,218,5,58,0,0,218,219,5,8,0,0,219,220,5,72,0,0,220,221,5,
        59,0,0,221,222,5,56,0,0,222,223,3,2,1,0,223,224,5,57,0,0,224,226,
        1,0,0,0,225,187,1,0,0,0,225,199,1,0,0,0,225,213,1,0,0,0,226,31,1,
        0,0,0,227,228,5,6,0,0,228,229,3,2,1,0,229,230,5,1,0,0,230,231,5,
        72,0,0,231,255,1,0,0,0,232,233,5,6,0,0,233,234,5,62,0,0,234,235,
        5,58,0,0,235,236,3,2,1,0,236,237,5,59,0,0,237,238,5,63,0,0,238,239,
        5,58,0,0,239,240,3,2,1,0,240,241,5,59,0,0,241,242,3,2,1,0,242,243,
        5,1,0,0,243,244,5,72,0,0,244,255,1,0,0,0,245,246,5,6,0,0,246,247,
        5,62,0,0,247,248,3,22,11,0,248,249,5,63,0,0,249,250,3,22,11,0,250,
        251,3,2,1,0,251,252,5,1,0,0,252,253,5,72,0,0,253,255,1,0,0,0,254,
        227,1,0,0,0,254,232,1,0,0,0,254,245,1,0,0,0,255,33,1,0,0,0,256,257,
        5,7,0,0,257,258,5,62,0,0,258,259,5,58,0,0,259,260,5,72,0,0,260,261,
        5,40,0,0,261,262,3,2,1,0,262,263,5,59,0,0,263,264,3,2,1,0,264,35,
        1,0,0,0,265,266,5,4,0,0,266,267,5,62,0,0,267,268,5,58,0,0,268,269,
        5,72,0,0,269,270,5,46,0,0,270,271,3,2,1,0,271,272,5,59,0,0,272,273,
        5,63,0,0,273,274,5,58,0,0,274,275,3,2,1,0,275,276,5,59,0,0,276,277,
        3,2,1,0,277,288,1,0,0,0,278,279,5,4,0,0,279,280,5,62,0,0,280,281,
        5,58,0,0,281,282,5,72,0,0,282,283,5,46,0,0,283,284,3,2,1,0,284,285,
        5,59,0,0,285,286,3,2,1,0,286,288,1,0,0,0,287,265,1,0,0,0,287,278,
        1,0,0,0,288,37,1,0,0,0,289,290,5,5,0,0,290,291,5,62,0,0,291,292,
        5,58,0,0,292,293,5,72,0,0,293,294,5,46,0,0,294,295,3,2,1,0,295,296,
        5,59,0,0,296,297,5,63,0,0,297,298,5,58,0,0,298,299,3,2,1,0,299,300,
        5,59,0,0,300,301,3,2,1,0,301,312,1,0,0,0,302,303,5,5,0,0,303,304,
        5,62,0,0,304,305,5,58,0,0,305,306,5,72,0,0,306,307,5,46,0,0,307,
        308,3,2,1,0,308,309,5,59,0,0,309,310,3,2,1,0,310,312,1,0,0,0,311,
        289,1,0,0,0,311,302,1,0,0,0,312,39,1,0,0,0,313,314,5,3,0,0,314,315,
        5,58,0,0,315,316,3,2,1,0,316,317,5,59,0,0,317,327,1,0,0,0,318,319,
        5,3,0,0,319,320,5,60,0,0,320,321,3,2,1,0,321,322,5,61,0,0,322,323,
        5,58,0,0,323,324,3,2,1,0,324,325,5,59,0,0,325,327,1,0,0,0,326,313,
        1,0,0,0,326,318,1,0,0,0,327,41,1,0,0,0,328,329,3,46,23,0,329,330,
        5,56,0,0,330,331,3,2,1,0,331,332,5,57,0,0,332,372,1,0,0,0,333,334,
        3,46,23,0,334,335,5,63,0,0,335,336,5,70,0,0,336,337,5,56,0,0,337,
        338,3,2,1,0,338,339,5,57,0,0,339,372,1,0,0,0,340,341,3,46,23,0,341,
        342,5,63,0,0,342,343,5,58,0,0,343,344,5,70,0,0,344,345,5,59,0,0,
        345,346,5,56,0,0,346,347,3,2,1,0,347,348,5,57,0,0,348,372,1,0,0,
        0,349,350,3,46,23,0,350,351,3,2,1,0,351,372,1,0,0,0,352,353,3,48,
        24,0,353,354,5,56,0,0,354,355,3,2,1,0,355,356,5,57,0,0,356,372,1,
        0,0,0,357,358,3,48,24,0,358,359,5,62,0,0,359,360,5,58,0,0,360,361,
        3,2,1,0,361,362,5,59,0,0,362,363,5,56,0,0,363,364,3,2,1,0,364,365,
        5,57,0,0,365,372,1,0,0,0,366,367,3,50,25,0,367,368,5,56,0,0,368,
        369,3,44,22,0,369,370,5,57,0,0,370,372,1,0,0,0,371,328,1,0,0,0,371,
        333,1,0,0,0,371,340,1,0,0,0,371,349,1,0,0,0,371,352,1,0,0,0,371,
        357,1,0,0,0,371,366,1,0,0,0,372,43,1,0,0,0,373,378,3,2,1,0,374,375,
        5,65,0,0,375,377,3,2,1,0,376,374,1,0,0,0,377,380,1,0,0,0,378,376,
        1,0,0,0,378,379,1,0,0,0,379,45,1,0,0,0,380,378,1,0,0,0,381,382,7,
        4,0,0,382,47,1,0,0,0,383,384,7,5,0,0,384,49,1,0,0,0,385,386,7,6,
        0,0,386,51,1,0,0,0,387,388,5,36,0,0,388,389,5,58,0,0,389,390,3,2,
        1,0,390,391,5,59,0,0,391,408,1,0,0,0,392,393,5,37,0,0,393,394,5,
        58,0,0,394,395,3,2,1,0,395,396,5,59,0,0,396,408,1,0,0,0,397,398,
        5,38,0,0,398,399,5,58,0,0,399,400,3,2,1,0,400,401,5,59,0,0,401,408,
        1,0,0,0,402,403,5,39,0,0,403,404,5,58,0,0,404,405,3,2,1,0,405,406,
        5,59,0,0,406,408,1,0,0,0,407,387,1,0,0,0,407,392,1,0,0,0,407,397,
        1,0,0,0,407,402,1,0,0,0,408,53,1,0,0,0,409,410,5,66,0,0,410,411,
        3,56,28,0,411,412,3,2,1,0,412,413,5,67,0,0,413,414,3,58,29,0,414,
        55,1,0,0,0,415,416,7,7,0,0,416,57,1,0,0,0,417,418,7,8,0,0,418,59,
        1,0,0,0,419,420,7,9,0,0,420,61,1,0,0,0,22,72,80,88,96,103,105,112,
        120,127,141,146,163,170,177,225,254,287,311,326,371,378,407
    ]

class LatexParser ( Parser ):

    grammarFileName = "Latex.g4"

    atn = ATNDeserializer().deserialize(serializedATN())

    decisionsToDFA = [ DFA(ds, i) for i, ds in enumerate(atn.decisionToState) ]

    sharedContextCache = PredictionContextCache()

    literalNames = [ "<INVALID>", "'d'", "'\\frac'", "'\\sqrt'", "'\\sum'", 
                     "'\\prod'", "'\\int'", "'\\lim'", "'\\partial'", "'\\sin'", 
                     "'\\cos'", "'\\tan'", "'\\sec'", "'\\csc'", "'\\cot'", 
                     "'\\arcsin'", "'\\arccos'", "'\\arctan'", "'\\sinh'", 
                     "'\\cosh'", "'\\tanh'", "'\\log'", "'\\ln'", "'\\exp'", 
                     "'\\alpha'", "'\\beta'", "'\\gamma'", "'\\delta'", 
                     "'\\epsilon'", "'\\theta'", "'\\lambda'", "'\\mu'", 
                     "'\\pi'", "'\\sigma'", "'\\phi'", "'\\omega'", "'\\mathbf'", 
                     "'\\mathcal'", "'\\mathbb'", "'\\mathrm'", "'\\to'", 
                     "'\\infty'", "'+'", "'-'", "<INVALID>", "<INVALID>", 
                     "'='", "'\\neq'", "'<'", "'>'", "<INVALID>", "<INVALID>", 
                     "'\\odot'", "'\\otimes'", "'\\oplus'", "'*'", "'('", 
                     "')'", "'{'", "'}'", "'['", "']'", "'_'", "'^'", "'|'", 
                     "','", "'\\left'", "'\\right'", "'\\langle'", "'\\rangle'" ]

    symbolicNames = [ "<INVALID>", "<INVALID>", "FRAC", "SQRT", "SUM", "PROD", 
                      "INT", "LIM", "PARTIAL", "SIN", "COS", "TAN", "SEC", 
                      "CSC", "COT", "ARCSIN", "ARCCOS", "ARCTAN", "SINH", 
                      "COSH", "TANH", "LOG", "LN", "EXP", "ALPHA", "BETA", 
                      "GAMMA", "DELTA", "EPSILON", "THETA", "LAMBDA", "MU", 
                      "PI", "SIGMA", "PHI", "OMEGA", "MATHBF", "MATHCAL", 
                      "MATHBB", "MATHRM", "TO", "INFTY", "PLUS", "MINUS", 
                      "TIMES", "DIV", "EQUALS", "NEQ", "LT", "GT", "LE", 
                      "GE", "ODOT", "OTIMES", "OPLUS", "STAR", "LPAREN", 
                      "RPAREN", "LBRACE", "RBRACE", "LBRACKET", "RBRACKET", 
                      "UNDERSCORE", "CARET", "PIPE", "COMMA", "LEFT", "RIGHT", 
                      "LANGLE", "RANGLE", "NUMBER", "WORD", "VARIABLE", 
                      "WS" ]

    RULE_document = 0
    RULE_expr = 1
    RULE_equation = 2
    RULE_relation = 3
    RULE_addExpr = 4
    RULE_mulExpr = 5
    RULE_highMulExpr = 6
    RULE_unaryExpr = 7
    RULE_powExpr = 8
    RULE_baseExpr = 9
    RULE_atom = 10
    RULE_atomBase = 11
    RULE_subscriptPart = 12
    RULE_superscriptPart = 13
    RULE_fraction = 14
    RULE_derivative = 15
    RULE_integral = 16
    RULE_limit = 17
    RULE_summation = 18
    RULE_product = 19
    RULE_sqrt = 20
    RULE_function = 21
    RULE_exprList = 22
    RULE_trigFunc = 23
    RULE_logFunc = 24
    RULE_customFunc = 25
    RULE_macro = 26
    RULE_leftRight = 27
    RULE_leftDelim = 28
    RULE_rightDelim = 29
    RULE_greekLetter = 30

    ruleNames =  [ "document", "expr", "equation", "relation", "addExpr", 
                   "mulExpr", "highMulExpr", "unaryExpr", "powExpr", "baseExpr", 
                   "atom", "atomBase", "subscriptPart", "superscriptPart", 
                   "fraction", "derivative", "integral", "limit", "summation", 
                   "product", "sqrt", "function", "exprList", "trigFunc", 
                   "logFunc", "customFunc", "macro", "leftRight", "leftDelim", 
                   "rightDelim", "greekLetter" ]

    EOF = Token.EOF
    T__0=1
    FRAC=2
    SQRT=3
    SUM=4
    PROD=5
    INT=6
    LIM=7
    PARTIAL=8
    SIN=9
    COS=10
    TAN=11
    SEC=12
    CSC=13
    COT=14
    ARCSIN=15
    ARCCOS=16
    ARCTAN=17
    SINH=18
    COSH=19
    TANH=20
    LOG=21
    LN=22
    EXP=23
    ALPHA=24
    BETA=25
    GAMMA=26
    DELTA=27
    EPSILON=28
    THETA=29
    LAMBDA=30
    MU=31
    PI=32
    SIGMA=33
    PHI=34
    OMEGA=35
    MATHBF=36
    MATHCAL=37
    MATHBB=38
    MATHRM=39
    TO=40
    INFTY=41
    PLUS=42
    MINUS=43
    TIMES=44
    DIV=45
    EQUALS=46
    NEQ=47
    LT=48
    GT=49
    LE=50
    GE=51
    ODOT=52
    OTIMES=53
    OPLUS=54
    STAR=55
    LPAREN=56
    RPAREN=57
    LBRACE=58
    RBRACE=59
    LBRACKET=60
    RBRACKET=61
    UNDERSCORE=62
    CARET=63
    PIPE=64
    COMMA=65
    LEFT=66
    RIGHT=67
    LANGLE=68
    RANGLE=69
    NUMBER=70
    WORD=71
    VARIABLE=72
    WS=73

    def __init__(self, input:TokenStream, output:TextIO = sys.stdout):
        super().__init__(input, output)
        self.checkVersion("4.13.2")
        self._interp = ParserATNSimulator(self, self.atn, self.decisionsToDFA, self.sharedContextCache)
        self._predicates = None




    class DocumentContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def EOF(self):
            return self.getToken(LatexParser.EOF, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_document

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterDocument" ):
                listener.enterDocument(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitDocument" ):
                listener.exitDocument(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitDocument" ):
                return visitor.visitDocument(self)
            else:
                return visitor.visitChildren(self)




    def document(self):

        localctx = LatexParser.DocumentContext(self, self._ctx, self.state)
        self.enterRule(localctx, 0, self.RULE_document)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 62
            self.expr()
            self.state = 63
            self.match(LatexParser.EOF)
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class ExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def equation(self):
            return self.getTypedRuleContext(LatexParser.EquationContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_expr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterExpr" ):
                listener.enterExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitExpr" ):
                listener.exitExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitExpr" ):
                return visitor.visitExpr(self)
            else:
                return visitor.visitChildren(self)




    def expr(self):

        localctx = LatexParser.ExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 2, self.RULE_expr)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 65
            self.equation()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class EquationContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def relation(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.RelationContext)
            else:
                return self.getTypedRuleContext(LatexParser.RelationContext,i)


        def EQUALS(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.EQUALS)
            else:
                return self.getToken(LatexParser.EQUALS, i)

        def getRuleIndex(self):
            return LatexParser.RULE_equation

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterEquation" ):
                listener.enterEquation(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitEquation" ):
                listener.exitEquation(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitEquation" ):
                return visitor.visitEquation(self)
            else:
                return visitor.visitChildren(self)




    def equation(self):

        localctx = LatexParser.EquationContext(self, self._ctx, self.state)
        self.enterRule(localctx, 4, self.RULE_equation)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 67
            self.relation()
            self.state = 72
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,0,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 68
                    self.match(LatexParser.EQUALS)
                    self.state = 69
                    self.relation() 
                self.state = 74
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,0,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class RelationContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def addExpr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.AddExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.AddExprContext,i)


        def LT(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LT)
            else:
                return self.getToken(LatexParser.LT, i)

        def GT(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.GT)
            else:
                return self.getToken(LatexParser.GT, i)

        def LE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LE)
            else:
                return self.getToken(LatexParser.LE, i)

        def GE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.GE)
            else:
                return self.getToken(LatexParser.GE, i)

        def NEQ(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.NEQ)
            else:
                return self.getToken(LatexParser.NEQ, i)

        def getRuleIndex(self):
            return LatexParser.RULE_relation

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterRelation" ):
                listener.enterRelation(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitRelation" ):
                listener.exitRelation(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitRelation" ):
                return visitor.visitRelation(self)
            else:
                return visitor.visitChildren(self)




    def relation(self):

        localctx = LatexParser.RelationContext(self, self._ctx, self.state)
        self.enterRule(localctx, 6, self.RULE_relation)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 75
            self.addExpr()
            self.state = 80
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,1,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 76
                    _la = self._input.LA(1)
                    if not((((_la) & ~0x3f) == 0 and ((1 << _la) & 4362862139015168) != 0)):
                        self._errHandler.recoverInline(self)
                    else:
                        self._errHandler.reportMatch(self)
                        self.consume()
                    self.state = 77
                    self.addExpr() 
                self.state = 82
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,1,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class AddExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def mulExpr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.MulExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.MulExprContext,i)


        def PLUS(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.PLUS)
            else:
                return self.getToken(LatexParser.PLUS, i)

        def MINUS(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.MINUS)
            else:
                return self.getToken(LatexParser.MINUS, i)

        def getRuleIndex(self):
            return LatexParser.RULE_addExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterAddExpr" ):
                listener.enterAddExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitAddExpr" ):
                listener.exitAddExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitAddExpr" ):
                return visitor.visitAddExpr(self)
            else:
                return visitor.visitChildren(self)




    def addExpr(self):

        localctx = LatexParser.AddExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 8, self.RULE_addExpr)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 83
            self.mulExpr()
            self.state = 88
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,2,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 84
                    _la = self._input.LA(1)
                    if not(_la==42 or _la==43):
                        self._errHandler.recoverInline(self)
                    else:
                        self._errHandler.reportMatch(self)
                        self.consume()
                    self.state = 85
                    self.mulExpr() 
                self.state = 90
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,2,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class MulExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def highMulExpr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.HighMulExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.HighMulExprContext,i)


        def TIMES(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.TIMES)
            else:
                return self.getToken(LatexParser.TIMES, i)

        def STAR(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.STAR)
            else:
                return self.getToken(LatexParser.STAR, i)

        def getRuleIndex(self):
            return LatexParser.RULE_mulExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterMulExpr" ):
                listener.enterMulExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitMulExpr" ):
                listener.exitMulExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitMulExpr" ):
                return visitor.visitMulExpr(self)
            else:
                return visitor.visitChildren(self)




    def mulExpr(self):

        localctx = LatexParser.MulExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 10, self.RULE_mulExpr)
        self._la = 0 # Token type
        try:
            self.state = 105
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,5,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 91
                self.highMulExpr()
                self.state = 96
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,3,self._ctx)
                while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                    if _alt==1:
                        self.state = 92
                        _la = self._input.LA(1)
                        if not(_la==44 or _la==55):
                            self._errHandler.recoverInline(self)
                        else:
                            self._errHandler.reportMatch(self)
                            self.consume()
                        self.state = 93
                        self.highMulExpr() 
                    self.state = 98
                    self._errHandler.sync(self)
                    _alt = self._interp.adaptivePredict(self._input,3,self._ctx)

                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 99
                self.highMulExpr()
                self.state = 101 
                self._errHandler.sync(self)
                _alt = 1
                while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                    if _alt == 1:
                        self.state = 100
                        self.highMulExpr()

                    else:
                        raise NoViableAltException(self)
                    self.state = 103 
                    self._errHandler.sync(self)
                    _alt = self._interp.adaptivePredict(self._input,4,self._ctx)

                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class HighMulExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def unaryExpr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.UnaryExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.UnaryExprContext,i)


        def ODOT(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.ODOT)
            else:
                return self.getToken(LatexParser.ODOT, i)

        def OTIMES(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.OTIMES)
            else:
                return self.getToken(LatexParser.OTIMES, i)

        def OPLUS(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.OPLUS)
            else:
                return self.getToken(LatexParser.OPLUS, i)

        def getRuleIndex(self):
            return LatexParser.RULE_highMulExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterHighMulExpr" ):
                listener.enterHighMulExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitHighMulExpr" ):
                listener.exitHighMulExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitHighMulExpr" ):
                return visitor.visitHighMulExpr(self)
            else:
                return visitor.visitChildren(self)




    def highMulExpr(self):

        localctx = LatexParser.HighMulExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 12, self.RULE_highMulExpr)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 107
            self.unaryExpr()
            self.state = 112
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,6,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 108
                    _la = self._input.LA(1)
                    if not((((_la) & ~0x3f) == 0 and ((1 << _la) & 31525197391593472) != 0)):
                        self._errHandler.recoverInline(self)
                    else:
                        self._errHandler.reportMatch(self)
                        self.consume()
                    self.state = 109
                    self.unaryExpr() 
                self.state = 114
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,6,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class UnaryExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def MINUS(self):
            return self.getToken(LatexParser.MINUS, 0)

        def unaryExpr(self):
            return self.getTypedRuleContext(LatexParser.UnaryExprContext,0)


        def PLUS(self):
            return self.getToken(LatexParser.PLUS, 0)

        def powExpr(self):
            return self.getTypedRuleContext(LatexParser.PowExprContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_unaryExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterUnaryExpr" ):
                listener.enterUnaryExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitUnaryExpr" ):
                listener.exitUnaryExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitUnaryExpr" ):
                return visitor.visitUnaryExpr(self)
            else:
                return visitor.visitChildren(self)




    def unaryExpr(self):

        localctx = LatexParser.UnaryExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 14, self.RULE_unaryExpr)
        try:
            self.state = 120
            self._errHandler.sync(self)
            token = self._input.LA(1)
            if token in [43]:
                self.enterOuterAlt(localctx, 1)
                self.state = 115
                self.match(LatexParser.MINUS)
                self.state = 116
                self.unaryExpr()
                pass
            elif token in [42]:
                self.enterOuterAlt(localctx, 2)
                self.state = 117
                self.match(LatexParser.PLUS)
                self.state = 118
                self.unaryExpr()
                pass
            elif token in [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 56, 58, 60, 66, 70, 71, 72]:
                self.enterOuterAlt(localctx, 3)
                self.state = 119
                self.powExpr()
                pass
            else:
                raise NoViableAltException(self)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class PowExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def baseExpr(self):
            return self.getTypedRuleContext(LatexParser.BaseExprContext,0)


        def CARET(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.CARET)
            else:
                return self.getToken(LatexParser.CARET, i)

        def superscriptPart(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.SuperscriptPartContext)
            else:
                return self.getTypedRuleContext(LatexParser.SuperscriptPartContext,i)


        def getRuleIndex(self):
            return LatexParser.RULE_powExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterPowExpr" ):
                listener.enterPowExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitPowExpr" ):
                listener.exitPowExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitPowExpr" ):
                return visitor.visitPowExpr(self)
            else:
                return visitor.visitChildren(self)




    def powExpr(self):

        localctx = LatexParser.PowExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 16, self.RULE_powExpr)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 122
            self.baseExpr()
            self.state = 127
            self._errHandler.sync(self)
            _alt = self._interp.adaptivePredict(self._input,8,self._ctx)
            while _alt!=2 and _alt!=ATN.INVALID_ALT_NUMBER:
                if _alt==1:
                    self.state = 123
                    self.match(LatexParser.CARET)
                    self.state = 124
                    self.superscriptPart() 
                self.state = 129
                self._errHandler.sync(self)
                _alt = self._interp.adaptivePredict(self._input,8,self._ctx)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class BaseExprContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def atom(self):
            return self.getTypedRuleContext(LatexParser.AtomContext,0)


        def function(self):
            return self.getTypedRuleContext(LatexParser.FunctionContext,0)


        def fraction(self):
            return self.getTypedRuleContext(LatexParser.FractionContext,0)


        def derivative(self):
            return self.getTypedRuleContext(LatexParser.DerivativeContext,0)


        def integral(self):
            return self.getTypedRuleContext(LatexParser.IntegralContext,0)


        def limit(self):
            return self.getTypedRuleContext(LatexParser.LimitContext,0)


        def summation(self):
            return self.getTypedRuleContext(LatexParser.SummationContext,0)


        def product(self):
            return self.getTypedRuleContext(LatexParser.ProductContext,0)


        def sqrt(self):
            return self.getTypedRuleContext(LatexParser.SqrtContext,0)


        def macro(self):
            return self.getTypedRuleContext(LatexParser.MacroContext,0)


        def leftRight(self):
            return self.getTypedRuleContext(LatexParser.LeftRightContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_baseExpr

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterBaseExpr" ):
                listener.enterBaseExpr(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitBaseExpr" ):
                listener.exitBaseExpr(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitBaseExpr" ):
                return visitor.visitBaseExpr(self)
            else:
                return visitor.visitChildren(self)




    def baseExpr(self):

        localctx = LatexParser.BaseExprContext(self, self._ctx, self.state)
        self.enterRule(localctx, 18, self.RULE_baseExpr)
        try:
            self.state = 141
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,9,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 130
                self.atom()
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 131
                self.function()
                pass

            elif la_ == 3:
                self.enterOuterAlt(localctx, 3)
                self.state = 132
                self.fraction()
                pass

            elif la_ == 4:
                self.enterOuterAlt(localctx, 4)
                self.state = 133
                self.derivative()
                pass

            elif la_ == 5:
                self.enterOuterAlt(localctx, 5)
                self.state = 134
                self.integral()
                pass

            elif la_ == 6:
                self.enterOuterAlt(localctx, 6)
                self.state = 135
                self.limit()
                pass

            elif la_ == 7:
                self.enterOuterAlt(localctx, 7)
                self.state = 136
                self.summation()
                pass

            elif la_ == 8:
                self.enterOuterAlt(localctx, 8)
                self.state = 137
                self.product()
                pass

            elif la_ == 9:
                self.enterOuterAlt(localctx, 9)
                self.state = 138
                self.sqrt()
                pass

            elif la_ == 10:
                self.enterOuterAlt(localctx, 10)
                self.state = 139
                self.macro()
                pass

            elif la_ == 11:
                self.enterOuterAlt(localctx, 11)
                self.state = 140
                self.leftRight()
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class AtomContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def atomBase(self):
            return self.getTypedRuleContext(LatexParser.AtomBaseContext,0)


        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def subscriptPart(self):
            return self.getTypedRuleContext(LatexParser.SubscriptPartContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_atom

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterAtom" ):
                listener.enterAtom(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitAtom" ):
                listener.exitAtom(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitAtom" ):
                return visitor.visitAtom(self)
            else:
                return visitor.visitChildren(self)




    def atom(self):

        localctx = LatexParser.AtomContext(self, self._ctx, self.state)
        self.enterRule(localctx, 20, self.RULE_atom)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 143
            self.atomBase()
            self.state = 146
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            if _la==62:
                self.state = 144
                self.match(LatexParser.UNDERSCORE)
                self.state = 145
                self.subscriptPart()


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class AtomBaseContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def NUMBER(self):
            return self.getToken(LatexParser.NUMBER, 0)

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def greekLetter(self):
            return self.getTypedRuleContext(LatexParser.GreekLetterContext,0)


        def LPAREN(self):
            return self.getToken(LatexParser.LPAREN, 0)

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RPAREN(self):
            return self.getToken(LatexParser.RPAREN, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def LBRACKET(self):
            return self.getToken(LatexParser.LBRACKET, 0)

        def RBRACKET(self):
            return self.getToken(LatexParser.RBRACKET, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_atomBase

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterAtomBase" ):
                listener.enterAtomBase(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitAtomBase" ):
                listener.exitAtomBase(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitAtomBase" ):
                return visitor.visitAtomBase(self)
            else:
                return visitor.visitChildren(self)




    def atomBase(self):

        localctx = LatexParser.AtomBaseContext(self, self._ctx, self.state)
        self.enterRule(localctx, 22, self.RULE_atomBase)
        try:
            self.state = 163
            self._errHandler.sync(self)
            token = self._input.LA(1)
            if token in [70]:
                self.enterOuterAlt(localctx, 1)
                self.state = 148
                self.match(LatexParser.NUMBER)
                pass
            elif token in [72]:
                self.enterOuterAlt(localctx, 2)
                self.state = 149
                self.match(LatexParser.VARIABLE)
                pass
            elif token in [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]:
                self.enterOuterAlt(localctx, 3)
                self.state = 150
                self.greekLetter()
                pass
            elif token in [56]:
                self.enterOuterAlt(localctx, 4)
                self.state = 151
                self.match(LatexParser.LPAREN)
                self.state = 152
                self.expr()
                self.state = 153
                self.match(LatexParser.RPAREN)
                pass
            elif token in [58]:
                self.enterOuterAlt(localctx, 5)
                self.state = 155
                self.match(LatexParser.LBRACE)
                self.state = 156
                self.expr()
                self.state = 157
                self.match(LatexParser.RBRACE)
                pass
            elif token in [60]:
                self.enterOuterAlt(localctx, 6)
                self.state = 159
                self.match(LatexParser.LBRACKET)
                self.state = 160
                self.expr()
                self.state = 161
                self.match(LatexParser.RBRACKET)
                pass
            else:
                raise NoViableAltException(self)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class SubscriptPartContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def atomBase(self):
            return self.getTypedRuleContext(LatexParser.AtomBaseContext,0)


        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_subscriptPart

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterSubscriptPart" ):
                listener.enterSubscriptPart(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitSubscriptPart" ):
                listener.exitSubscriptPart(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitSubscriptPart" ):
                return visitor.visitSubscriptPart(self)
            else:
                return visitor.visitChildren(self)




    def subscriptPart(self):

        localctx = LatexParser.SubscriptPartContext(self, self._ctx, self.state)
        self.enterRule(localctx, 24, self.RULE_subscriptPart)
        try:
            self.state = 170
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,12,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 165
                self.atomBase()
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 166
                self.match(LatexParser.LBRACE)
                self.state = 167
                self.expr()
                self.state = 168
                self.match(LatexParser.RBRACE)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class SuperscriptPartContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def atomBase(self):
            return self.getTypedRuleContext(LatexParser.AtomBaseContext,0)


        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_superscriptPart

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterSuperscriptPart" ):
                listener.enterSuperscriptPart(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitSuperscriptPart" ):
                listener.exitSuperscriptPart(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitSuperscriptPart" ):
                return visitor.visitSuperscriptPart(self)
            else:
                return visitor.visitChildren(self)




    def superscriptPart(self):

        localctx = LatexParser.SuperscriptPartContext(self, self._ctx, self.state)
        self.enterRule(localctx, 26, self.RULE_superscriptPart)
        try:
            self.state = 177
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,13,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 172
                self.atomBase()
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 173
                self.match(LatexParser.LBRACE)
                self.state = 174
                self.expr()
                self.state = 175
                self.match(LatexParser.RBRACE)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class FractionContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def FRAC(self):
            return self.getToken(LatexParser.FRAC, 0)

        def LBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LBRACE)
            else:
                return self.getToken(LatexParser.LBRACE, i)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.RBRACE)
            else:
                return self.getToken(LatexParser.RBRACE, i)

        def getRuleIndex(self):
            return LatexParser.RULE_fraction

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterFraction" ):
                listener.enterFraction(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitFraction" ):
                listener.exitFraction(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitFraction" ):
                return visitor.visitFraction(self)
            else:
                return visitor.visitChildren(self)




    def fraction(self):

        localctx = LatexParser.FractionContext(self, self._ctx, self.state)
        self.enterRule(localctx, 28, self.RULE_fraction)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 179
            self.match(LatexParser.FRAC)
            self.state = 180
            self.match(LatexParser.LBRACE)
            self.state = 181
            self.expr()
            self.state = 182
            self.match(LatexParser.RBRACE)
            self.state = 183
            self.match(LatexParser.LBRACE)
            self.state = 184
            self.expr()
            self.state = 185
            self.match(LatexParser.RBRACE)
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class DerivativeContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def FRAC(self):
            return self.getToken(LatexParser.FRAC, 0)

        def LBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LBRACE)
            else:
                return self.getToken(LatexParser.LBRACE, i)

        def RBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.RBRACE)
            else:
                return self.getToken(LatexParser.RBRACE, i)

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def LPAREN(self):
            return self.getToken(LatexParser.LPAREN, 0)

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RPAREN(self):
            return self.getToken(LatexParser.RPAREN, 0)

        def CARET(self):
            return self.getToken(LatexParser.CARET, 0)

        def NUMBER(self):
            return self.getToken(LatexParser.NUMBER, 0)

        def PARTIAL(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.PARTIAL)
            else:
                return self.getToken(LatexParser.PARTIAL, i)

        def getRuleIndex(self):
            return LatexParser.RULE_derivative

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterDerivative" ):
                listener.enterDerivative(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitDerivative" ):
                listener.exitDerivative(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitDerivative" ):
                return visitor.visitDerivative(self)
            else:
                return visitor.visitChildren(self)




    def derivative(self):

        localctx = LatexParser.DerivativeContext(self, self._ctx, self.state)
        self.enterRule(localctx, 30, self.RULE_derivative)
        try:
            self.state = 225
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,14,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 187
                self.match(LatexParser.FRAC)
                self.state = 188
                self.match(LatexParser.LBRACE)
                self.state = 189
                self.match(LatexParser.T__0)
                self.state = 190
                self.match(LatexParser.RBRACE)
                self.state = 191
                self.match(LatexParser.LBRACE)
                self.state = 192
                self.match(LatexParser.T__0)
                self.state = 193
                self.match(LatexParser.VARIABLE)
                self.state = 194
                self.match(LatexParser.RBRACE)
                self.state = 195
                self.match(LatexParser.LPAREN)
                self.state = 196
                self.expr()
                self.state = 197
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 199
                self.match(LatexParser.FRAC)
                self.state = 200
                self.match(LatexParser.LBRACE)
                self.state = 201
                self.match(LatexParser.T__0)
                self.state = 202
                self.match(LatexParser.RBRACE)
                self.state = 203
                self.match(LatexParser.LBRACE)
                self.state = 204
                self.match(LatexParser.T__0)
                self.state = 205
                self.match(LatexParser.VARIABLE)
                self.state = 206
                self.match(LatexParser.CARET)
                self.state = 207
                self.match(LatexParser.NUMBER)
                self.state = 208
                self.match(LatexParser.RBRACE)
                self.state = 209
                self.match(LatexParser.LPAREN)
                self.state = 210
                self.expr()
                self.state = 211
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 3:
                self.enterOuterAlt(localctx, 3)
                self.state = 213
                self.match(LatexParser.FRAC)
                self.state = 214
                self.match(LatexParser.LBRACE)
                self.state = 215
                self.match(LatexParser.PARTIAL)
                self.state = 216
                self.match(LatexParser.RBRACE)
                self.state = 217
                self.match(LatexParser.LBRACE)
                self.state = 218
                self.match(LatexParser.PARTIAL)
                self.state = 219
                self.match(LatexParser.VARIABLE)
                self.state = 220
                self.match(LatexParser.RBRACE)
                self.state = 221
                self.match(LatexParser.LPAREN)
                self.state = 222
                self.expr()
                self.state = 223
                self.match(LatexParser.RPAREN)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class IntegralContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def INT(self):
            return self.getToken(LatexParser.INT, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def LBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LBRACE)
            else:
                return self.getToken(LatexParser.LBRACE, i)

        def RBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.RBRACE)
            else:
                return self.getToken(LatexParser.RBRACE, i)

        def CARET(self):
            return self.getToken(LatexParser.CARET, 0)

        def atomBase(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.AtomBaseContext)
            else:
                return self.getTypedRuleContext(LatexParser.AtomBaseContext,i)


        def getRuleIndex(self):
            return LatexParser.RULE_integral

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterIntegral" ):
                listener.enterIntegral(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitIntegral" ):
                listener.exitIntegral(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitIntegral" ):
                return visitor.visitIntegral(self)
            else:
                return visitor.visitChildren(self)




    def integral(self):

        localctx = LatexParser.IntegralContext(self, self._ctx, self.state)
        self.enterRule(localctx, 32, self.RULE_integral)
        try:
            self.state = 254
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,15,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 227
                self.match(LatexParser.INT)
                self.state = 228
                self.expr()
                self.state = 229
                self.match(LatexParser.T__0)
                self.state = 230
                self.match(LatexParser.VARIABLE)
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 232
                self.match(LatexParser.INT)
                self.state = 233
                self.match(LatexParser.UNDERSCORE)
                self.state = 234
                self.match(LatexParser.LBRACE)
                self.state = 235
                self.expr()
                self.state = 236
                self.match(LatexParser.RBRACE)
                self.state = 237
                self.match(LatexParser.CARET)
                self.state = 238
                self.match(LatexParser.LBRACE)
                self.state = 239
                self.expr()
                self.state = 240
                self.match(LatexParser.RBRACE)
                self.state = 241
                self.expr()
                self.state = 242
                self.match(LatexParser.T__0)
                self.state = 243
                self.match(LatexParser.VARIABLE)
                pass

            elif la_ == 3:
                self.enterOuterAlt(localctx, 3)
                self.state = 245
                self.match(LatexParser.INT)
                self.state = 246
                self.match(LatexParser.UNDERSCORE)
                self.state = 247
                self.atomBase()
                self.state = 248
                self.match(LatexParser.CARET)
                self.state = 249
                self.atomBase()
                self.state = 250
                self.expr()
                self.state = 251
                self.match(LatexParser.T__0)
                self.state = 252
                self.match(LatexParser.VARIABLE)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class LimitContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def LIM(self):
            return self.getToken(LatexParser.LIM, 0)

        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def TO(self):
            return self.getToken(LatexParser.TO, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_limit

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterLimit" ):
                listener.enterLimit(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitLimit" ):
                listener.exitLimit(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitLimit" ):
                return visitor.visitLimit(self)
            else:
                return visitor.visitChildren(self)




    def limit(self):

        localctx = LatexParser.LimitContext(self, self._ctx, self.state)
        self.enterRule(localctx, 34, self.RULE_limit)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 256
            self.match(LatexParser.LIM)
            self.state = 257
            self.match(LatexParser.UNDERSCORE)
            self.state = 258
            self.match(LatexParser.LBRACE)
            self.state = 259
            self.match(LatexParser.VARIABLE)
            self.state = 260
            self.match(LatexParser.TO)
            self.state = 261
            self.expr()
            self.state = 262
            self.match(LatexParser.RBRACE)
            self.state = 263
            self.expr()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class SummationContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def SUM(self):
            return self.getToken(LatexParser.SUM, 0)

        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def LBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LBRACE)
            else:
                return self.getToken(LatexParser.LBRACE, i)

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def EQUALS(self):
            return self.getToken(LatexParser.EQUALS, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.RBRACE)
            else:
                return self.getToken(LatexParser.RBRACE, i)

        def CARET(self):
            return self.getToken(LatexParser.CARET, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_summation

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterSummation" ):
                listener.enterSummation(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitSummation" ):
                listener.exitSummation(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitSummation" ):
                return visitor.visitSummation(self)
            else:
                return visitor.visitChildren(self)




    def summation(self):

        localctx = LatexParser.SummationContext(self, self._ctx, self.state)
        self.enterRule(localctx, 36, self.RULE_summation)
        try:
            self.state = 287
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,16,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 265
                self.match(LatexParser.SUM)
                self.state = 266
                self.match(LatexParser.UNDERSCORE)
                self.state = 267
                self.match(LatexParser.LBRACE)
                self.state = 268
                self.match(LatexParser.VARIABLE)
                self.state = 269
                self.match(LatexParser.EQUALS)
                self.state = 270
                self.expr()
                self.state = 271
                self.match(LatexParser.RBRACE)
                self.state = 272
                self.match(LatexParser.CARET)
                self.state = 273
                self.match(LatexParser.LBRACE)
                self.state = 274
                self.expr()
                self.state = 275
                self.match(LatexParser.RBRACE)
                self.state = 276
                self.expr()
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 278
                self.match(LatexParser.SUM)
                self.state = 279
                self.match(LatexParser.UNDERSCORE)
                self.state = 280
                self.match(LatexParser.LBRACE)
                self.state = 281
                self.match(LatexParser.VARIABLE)
                self.state = 282
                self.match(LatexParser.EQUALS)
                self.state = 283
                self.expr()
                self.state = 284
                self.match(LatexParser.RBRACE)
                self.state = 285
                self.expr()
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class ProductContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def PROD(self):
            return self.getToken(LatexParser.PROD, 0)

        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def LBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.LBRACE)
            else:
                return self.getToken(LatexParser.LBRACE, i)

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def EQUALS(self):
            return self.getToken(LatexParser.EQUALS, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RBRACE(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.RBRACE)
            else:
                return self.getToken(LatexParser.RBRACE, i)

        def CARET(self):
            return self.getToken(LatexParser.CARET, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_product

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterProduct" ):
                listener.enterProduct(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitProduct" ):
                listener.exitProduct(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitProduct" ):
                return visitor.visitProduct(self)
            else:
                return visitor.visitChildren(self)




    def product(self):

        localctx = LatexParser.ProductContext(self, self._ctx, self.state)
        self.enterRule(localctx, 38, self.RULE_product)
        try:
            self.state = 311
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,17,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 289
                self.match(LatexParser.PROD)
                self.state = 290
                self.match(LatexParser.UNDERSCORE)
                self.state = 291
                self.match(LatexParser.LBRACE)
                self.state = 292
                self.match(LatexParser.VARIABLE)
                self.state = 293
                self.match(LatexParser.EQUALS)
                self.state = 294
                self.expr()
                self.state = 295
                self.match(LatexParser.RBRACE)
                self.state = 296
                self.match(LatexParser.CARET)
                self.state = 297
                self.match(LatexParser.LBRACE)
                self.state = 298
                self.expr()
                self.state = 299
                self.match(LatexParser.RBRACE)
                self.state = 300
                self.expr()
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 302
                self.match(LatexParser.PROD)
                self.state = 303
                self.match(LatexParser.UNDERSCORE)
                self.state = 304
                self.match(LatexParser.LBRACE)
                self.state = 305
                self.match(LatexParser.VARIABLE)
                self.state = 306
                self.match(LatexParser.EQUALS)
                self.state = 307
                self.expr()
                self.state = 308
                self.match(LatexParser.RBRACE)
                self.state = 309
                self.expr()
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class SqrtContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def SQRT(self):
            return self.getToken(LatexParser.SQRT, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def LBRACKET(self):
            return self.getToken(LatexParser.LBRACKET, 0)

        def RBRACKET(self):
            return self.getToken(LatexParser.RBRACKET, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_sqrt

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterSqrt" ):
                listener.enterSqrt(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitSqrt" ):
                listener.exitSqrt(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitSqrt" ):
                return visitor.visitSqrt(self)
            else:
                return visitor.visitChildren(self)




    def sqrt(self):

        localctx = LatexParser.SqrtContext(self, self._ctx, self.state)
        self.enterRule(localctx, 40, self.RULE_sqrt)
        try:
            self.state = 326
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,18,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 313
                self.match(LatexParser.SQRT)
                self.state = 314
                self.match(LatexParser.LBRACE)
                self.state = 315
                self.expr()
                self.state = 316
                self.match(LatexParser.RBRACE)
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 318
                self.match(LatexParser.SQRT)
                self.state = 319
                self.match(LatexParser.LBRACKET)
                self.state = 320
                self.expr()
                self.state = 321
                self.match(LatexParser.RBRACKET)
                self.state = 322
                self.match(LatexParser.LBRACE)
                self.state = 323
                self.expr()
                self.state = 324
                self.match(LatexParser.RBRACE)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class FunctionContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def trigFunc(self):
            return self.getTypedRuleContext(LatexParser.TrigFuncContext,0)


        def LPAREN(self):
            return self.getToken(LatexParser.LPAREN, 0)

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def RPAREN(self):
            return self.getToken(LatexParser.RPAREN, 0)

        def CARET(self):
            return self.getToken(LatexParser.CARET, 0)

        def NUMBER(self):
            return self.getToken(LatexParser.NUMBER, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def logFunc(self):
            return self.getTypedRuleContext(LatexParser.LogFuncContext,0)


        def UNDERSCORE(self):
            return self.getToken(LatexParser.UNDERSCORE, 0)

        def customFunc(self):
            return self.getTypedRuleContext(LatexParser.CustomFuncContext,0)


        def exprList(self):
            return self.getTypedRuleContext(LatexParser.ExprListContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_function

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterFunction" ):
                listener.enterFunction(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitFunction" ):
                listener.exitFunction(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitFunction" ):
                return visitor.visitFunction(self)
            else:
                return visitor.visitChildren(self)




    def function(self):

        localctx = LatexParser.FunctionContext(self, self._ctx, self.state)
        self.enterRule(localctx, 42, self.RULE_function)
        try:
            self.state = 371
            self._errHandler.sync(self)
            la_ = self._interp.adaptivePredict(self._input,19,self._ctx)
            if la_ == 1:
                self.enterOuterAlt(localctx, 1)
                self.state = 328
                self.trigFunc()
                self.state = 329
                self.match(LatexParser.LPAREN)
                self.state = 330
                self.expr()
                self.state = 331
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 2:
                self.enterOuterAlt(localctx, 2)
                self.state = 333
                self.trigFunc()
                self.state = 334
                self.match(LatexParser.CARET)
                self.state = 335
                self.match(LatexParser.NUMBER)
                self.state = 336
                self.match(LatexParser.LPAREN)
                self.state = 337
                self.expr()
                self.state = 338
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 3:
                self.enterOuterAlt(localctx, 3)
                self.state = 340
                self.trigFunc()
                self.state = 341
                self.match(LatexParser.CARET)
                self.state = 342
                self.match(LatexParser.LBRACE)
                self.state = 343
                self.match(LatexParser.NUMBER)
                self.state = 344
                self.match(LatexParser.RBRACE)
                self.state = 345
                self.match(LatexParser.LPAREN)
                self.state = 346
                self.expr()
                self.state = 347
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 4:
                self.enterOuterAlt(localctx, 4)
                self.state = 349
                self.trigFunc()
                self.state = 350
                self.expr()
                pass

            elif la_ == 5:
                self.enterOuterAlt(localctx, 5)
                self.state = 352
                self.logFunc()
                self.state = 353
                self.match(LatexParser.LPAREN)
                self.state = 354
                self.expr()
                self.state = 355
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 6:
                self.enterOuterAlt(localctx, 6)
                self.state = 357
                self.logFunc()
                self.state = 358
                self.match(LatexParser.UNDERSCORE)
                self.state = 359
                self.match(LatexParser.LBRACE)
                self.state = 360
                self.expr()
                self.state = 361
                self.match(LatexParser.RBRACE)
                self.state = 362
                self.match(LatexParser.LPAREN)
                self.state = 363
                self.expr()
                self.state = 364
                self.match(LatexParser.RPAREN)
                pass

            elif la_ == 7:
                self.enterOuterAlt(localctx, 7)
                self.state = 366
                self.customFunc()
                self.state = 367
                self.match(LatexParser.LPAREN)
                self.state = 368
                self.exprList()
                self.state = 369
                self.match(LatexParser.RPAREN)
                pass


        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class ExprListContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def expr(self, i:int=None):
            if i is None:
                return self.getTypedRuleContexts(LatexParser.ExprContext)
            else:
                return self.getTypedRuleContext(LatexParser.ExprContext,i)


        def COMMA(self, i:int=None):
            if i is None:
                return self.getTokens(LatexParser.COMMA)
            else:
                return self.getToken(LatexParser.COMMA, i)

        def getRuleIndex(self):
            return LatexParser.RULE_exprList

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterExprList" ):
                listener.enterExprList(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitExprList" ):
                listener.exitExprList(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitExprList" ):
                return visitor.visitExprList(self)
            else:
                return visitor.visitChildren(self)




    def exprList(self):

        localctx = LatexParser.ExprListContext(self, self._ctx, self.state)
        self.enterRule(localctx, 44, self.RULE_exprList)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 373
            self.expr()
            self.state = 378
            self._errHandler.sync(self)
            _la = self._input.LA(1)
            while _la==65:
                self.state = 374
                self.match(LatexParser.COMMA)
                self.state = 375
                self.expr()
                self.state = 380
                self._errHandler.sync(self)
                _la = self._input.LA(1)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class TrigFuncContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def SIN(self):
            return self.getToken(LatexParser.SIN, 0)

        def COS(self):
            return self.getToken(LatexParser.COS, 0)

        def TAN(self):
            return self.getToken(LatexParser.TAN, 0)

        def SEC(self):
            return self.getToken(LatexParser.SEC, 0)

        def CSC(self):
            return self.getToken(LatexParser.CSC, 0)

        def COT(self):
            return self.getToken(LatexParser.COT, 0)

        def ARCSIN(self):
            return self.getToken(LatexParser.ARCSIN, 0)

        def ARCCOS(self):
            return self.getToken(LatexParser.ARCCOS, 0)

        def ARCTAN(self):
            return self.getToken(LatexParser.ARCTAN, 0)

        def SINH(self):
            return self.getToken(LatexParser.SINH, 0)

        def COSH(self):
            return self.getToken(LatexParser.COSH, 0)

        def TANH(self):
            return self.getToken(LatexParser.TANH, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_trigFunc

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterTrigFunc" ):
                listener.enterTrigFunc(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitTrigFunc" ):
                listener.exitTrigFunc(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitTrigFunc" ):
                return visitor.visitTrigFunc(self)
            else:
                return visitor.visitChildren(self)




    def trigFunc(self):

        localctx = LatexParser.TrigFuncContext(self, self._ctx, self.state)
        self.enterRule(localctx, 46, self.RULE_trigFunc)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 381
            _la = self._input.LA(1)
            if not((((_la) & ~0x3f) == 0 and ((1 << _la) & 2096640) != 0)):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class LogFuncContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def LOG(self):
            return self.getToken(LatexParser.LOG, 0)

        def LN(self):
            return self.getToken(LatexParser.LN, 0)

        def EXP(self):
            return self.getToken(LatexParser.EXP, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_logFunc

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterLogFunc" ):
                listener.enterLogFunc(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitLogFunc" ):
                listener.exitLogFunc(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitLogFunc" ):
                return visitor.visitLogFunc(self)
            else:
                return visitor.visitChildren(self)




    def logFunc(self):

        localctx = LatexParser.LogFuncContext(self, self._ctx, self.state)
        self.enterRule(localctx, 48, self.RULE_logFunc)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 383
            _la = self._input.LA(1)
            if not((((_la) & ~0x3f) == 0 and ((1 << _la) & 14680064) != 0)):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class CustomFuncContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def VARIABLE(self):
            return self.getToken(LatexParser.VARIABLE, 0)

        def WORD(self):
            return self.getToken(LatexParser.WORD, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_customFunc

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterCustomFunc" ):
                listener.enterCustomFunc(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitCustomFunc" ):
                listener.exitCustomFunc(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitCustomFunc" ):
                return visitor.visitCustomFunc(self)
            else:
                return visitor.visitChildren(self)




    def customFunc(self):

        localctx = LatexParser.CustomFuncContext(self, self._ctx, self.state)
        self.enterRule(localctx, 50, self.RULE_customFunc)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 385
            _la = self._input.LA(1)
            if not(_la==71 or _la==72):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class MacroContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def MATHBF(self):
            return self.getToken(LatexParser.MATHBF, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def MATHCAL(self):
            return self.getToken(LatexParser.MATHCAL, 0)

        def MATHBB(self):
            return self.getToken(LatexParser.MATHBB, 0)

        def MATHRM(self):
            return self.getToken(LatexParser.MATHRM, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_macro

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterMacro" ):
                listener.enterMacro(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitMacro" ):
                listener.exitMacro(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitMacro" ):
                return visitor.visitMacro(self)
            else:
                return visitor.visitChildren(self)




    def macro(self):

        localctx = LatexParser.MacroContext(self, self._ctx, self.state)
        self.enterRule(localctx, 52, self.RULE_macro)
        try:
            self.state = 407
            self._errHandler.sync(self)
            token = self._input.LA(1)
            if token in [36]:
                self.enterOuterAlt(localctx, 1)
                self.state = 387
                self.match(LatexParser.MATHBF)
                self.state = 388
                self.match(LatexParser.LBRACE)
                self.state = 389
                self.expr()
                self.state = 390
                self.match(LatexParser.RBRACE)
                pass
            elif token in [37]:
                self.enterOuterAlt(localctx, 2)
                self.state = 392
                self.match(LatexParser.MATHCAL)
                self.state = 393
                self.match(LatexParser.LBRACE)
                self.state = 394
                self.expr()
                self.state = 395
                self.match(LatexParser.RBRACE)
                pass
            elif token in [38]:
                self.enterOuterAlt(localctx, 3)
                self.state = 397
                self.match(LatexParser.MATHBB)
                self.state = 398
                self.match(LatexParser.LBRACE)
                self.state = 399
                self.expr()
                self.state = 400
                self.match(LatexParser.RBRACE)
                pass
            elif token in [39]:
                self.enterOuterAlt(localctx, 4)
                self.state = 402
                self.match(LatexParser.MATHRM)
                self.state = 403
                self.match(LatexParser.LBRACE)
                self.state = 404
                self.expr()
                self.state = 405
                self.match(LatexParser.RBRACE)
                pass
            else:
                raise NoViableAltException(self)

        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class LeftRightContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def LEFT(self):
            return self.getToken(LatexParser.LEFT, 0)

        def leftDelim(self):
            return self.getTypedRuleContext(LatexParser.LeftDelimContext,0)


        def expr(self):
            return self.getTypedRuleContext(LatexParser.ExprContext,0)


        def RIGHT(self):
            return self.getToken(LatexParser.RIGHT, 0)

        def rightDelim(self):
            return self.getTypedRuleContext(LatexParser.RightDelimContext,0)


        def getRuleIndex(self):
            return LatexParser.RULE_leftRight

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterLeftRight" ):
                listener.enterLeftRight(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitLeftRight" ):
                listener.exitLeftRight(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitLeftRight" ):
                return visitor.visitLeftRight(self)
            else:
                return visitor.visitChildren(self)




    def leftRight(self):

        localctx = LatexParser.LeftRightContext(self, self._ctx, self.state)
        self.enterRule(localctx, 54, self.RULE_leftRight)
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 409
            self.match(LatexParser.LEFT)
            self.state = 410
            self.leftDelim()
            self.state = 411
            self.expr()
            self.state = 412
            self.match(LatexParser.RIGHT)
            self.state = 413
            self.rightDelim()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class LeftDelimContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def LPAREN(self):
            return self.getToken(LatexParser.LPAREN, 0)

        def LBRACKET(self):
            return self.getToken(LatexParser.LBRACKET, 0)

        def LBRACE(self):
            return self.getToken(LatexParser.LBRACE, 0)

        def PIPE(self):
            return self.getToken(LatexParser.PIPE, 0)

        def LANGLE(self):
            return self.getToken(LatexParser.LANGLE, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_leftDelim

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterLeftDelim" ):
                listener.enterLeftDelim(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitLeftDelim" ):
                listener.exitLeftDelim(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitLeftDelim" ):
                return visitor.visitLeftDelim(self)
            else:
                return visitor.visitChildren(self)




    def leftDelim(self):

        localctx = LatexParser.LeftDelimContext(self, self._ctx, self.state)
        self.enterRule(localctx, 56, self.RULE_leftDelim)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 415
            _la = self._input.LA(1)
            if not(((((_la - 56)) & ~0x3f) == 0 and ((1 << (_la - 56)) & 4373) != 0)):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class RightDelimContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def RPAREN(self):
            return self.getToken(LatexParser.RPAREN, 0)

        def RBRACKET(self):
            return self.getToken(LatexParser.RBRACKET, 0)

        def RBRACE(self):
            return self.getToken(LatexParser.RBRACE, 0)

        def PIPE(self):
            return self.getToken(LatexParser.PIPE, 0)

        def RANGLE(self):
            return self.getToken(LatexParser.RANGLE, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_rightDelim

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterRightDelim" ):
                listener.enterRightDelim(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitRightDelim" ):
                listener.exitRightDelim(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitRightDelim" ):
                return visitor.visitRightDelim(self)
            else:
                return visitor.visitChildren(self)




    def rightDelim(self):

        localctx = LatexParser.RightDelimContext(self, self._ctx, self.state)
        self.enterRule(localctx, 58, self.RULE_rightDelim)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 417
            _la = self._input.LA(1)
            if not(((((_la - 57)) & ~0x3f) == 0 and ((1 << (_la - 57)) & 4245) != 0)):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx


    class GreekLetterContext(ParserRuleContext):
        __slots__ = 'parser'

        def __init__(self, parser, parent:ParserRuleContext=None, invokingState:int=-1):
            super().__init__(parent, invokingState)
            self.parser = parser

        def ALPHA(self):
            return self.getToken(LatexParser.ALPHA, 0)

        def BETA(self):
            return self.getToken(LatexParser.BETA, 0)

        def GAMMA(self):
            return self.getToken(LatexParser.GAMMA, 0)

        def DELTA(self):
            return self.getToken(LatexParser.DELTA, 0)

        def EPSILON(self):
            return self.getToken(LatexParser.EPSILON, 0)

        def THETA(self):
            return self.getToken(LatexParser.THETA, 0)

        def LAMBDA(self):
            return self.getToken(LatexParser.LAMBDA, 0)

        def MU(self):
            return self.getToken(LatexParser.MU, 0)

        def PI(self):
            return self.getToken(LatexParser.PI, 0)

        def SIGMA(self):
            return self.getToken(LatexParser.SIGMA, 0)

        def PHI(self):
            return self.getToken(LatexParser.PHI, 0)

        def OMEGA(self):
            return self.getToken(LatexParser.OMEGA, 0)

        def getRuleIndex(self):
            return LatexParser.RULE_greekLetter

        def enterRule(self, listener:ParseTreeListener):
            if hasattr( listener, "enterGreekLetter" ):
                listener.enterGreekLetter(self)

        def exitRule(self, listener:ParseTreeListener):
            if hasattr( listener, "exitGreekLetter" ):
                listener.exitGreekLetter(self)

        def accept(self, visitor:ParseTreeVisitor):
            if hasattr( visitor, "visitGreekLetter" ):
                return visitor.visitGreekLetter(self)
            else:
                return visitor.visitChildren(self)




    def greekLetter(self):

        localctx = LatexParser.GreekLetterContext(self, self._ctx, self.state)
        self.enterRule(localctx, 60, self.RULE_greekLetter)
        self._la = 0 # Token type
        try:
            self.enterOuterAlt(localctx, 1)
            self.state = 419
            _la = self._input.LA(1)
            if not((((_la) & ~0x3f) == 0 and ((1 << _la) & 68702699520) != 0)):
                self._errHandler.recoverInline(self)
            else:
                self._errHandler.reportMatch(self)
                self.consume()
        except RecognitionException as re:
            localctx.exception = re
            self._errHandler.reportError(self, re)
            self._errHandler.recover(self, re)
        finally:
            self.exitRule()
        return localctx





