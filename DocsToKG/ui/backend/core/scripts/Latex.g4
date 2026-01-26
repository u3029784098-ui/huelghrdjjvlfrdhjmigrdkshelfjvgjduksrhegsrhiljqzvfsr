// Latex.g4 - Combined Grammar (Lexer + Parser in one file)
grammar Latex;

// ==================== PARSER RULES ====================

// Entry point
document    : expr EOF ;

// Expression hierarchy (following operator precedence)
expr        : equation ;

equation    : relation (EQUALS relation)* ;

relation    : addExpr ((LT | GT | LE | GE | NEQ) addExpr)* ;

addExpr     : mulExpr ((PLUS | MINUS) mulExpr)* ;

mulExpr     : highMulExpr ((TIMES | STAR) highMulExpr)*
            | highMulExpr highMulExpr+  // implicit multiplication
            ;

highMulExpr : unaryExpr ((ODOT | OTIMES | OPLUS) unaryExpr)* ;

unaryExpr   : MINUS unaryExpr
            | PLUS unaryExpr
            | powExpr
            ;

powExpr     : baseExpr (CARET superscriptPart)* ;

baseExpr    : atom
            | function
            | fraction
            | derivative
            | integral
            | limit
            | summation
            | product
            | sqrt
            | macro
            | leftRight
            ;

// Atoms with optional subscript/superscript
atom        : atomBase (UNDERSCORE subscriptPart)? ;

atomBase    : NUMBER
            | VARIABLE
            | greekLetter
            | LPAREN expr RPAREN
            | LBRACE expr RBRACE
            | LBRACKET expr RBRACKET
            ;

subscriptPart : atomBase
              | LBRACE expr RBRACE
              ;

superscriptPart : atomBase
                | LBRACE expr RBRACE
                ;

// Fractions
fraction    : FRAC LBRACE expr RBRACE LBRACE expr RBRACE ;

// Derivatives
derivative  : FRAC LBRACE 'd' RBRACE LBRACE 'd' VARIABLE RBRACE LPAREN expr RPAREN
            | FRAC LBRACE 'd' RBRACE LBRACE 'd' VARIABLE CARET NUMBER RBRACE LPAREN expr RPAREN
            | FRAC LBRACE PARTIAL RBRACE LBRACE PARTIAL VARIABLE RBRACE LPAREN expr RPAREN
            ;

// Integrals
integral    : INT expr 'd' VARIABLE
            | INT UNDERSCORE LBRACE expr RBRACE CARET LBRACE expr RBRACE expr 'd' VARIABLE
            | INT UNDERSCORE atomBase CARET atomBase expr 'd' VARIABLE
            ;

// Limits
limit       : LIM UNDERSCORE LBRACE VARIABLE TO expr RBRACE expr ;

// Summations
summation   : SUM UNDERSCORE LBRACE VARIABLE EQUALS expr RBRACE CARET LBRACE expr RBRACE expr
            | SUM UNDERSCORE LBRACE VARIABLE EQUALS expr RBRACE expr
            ;

// Products
product     : PROD UNDERSCORE LBRACE VARIABLE EQUALS expr RBRACE CARET LBRACE expr RBRACE expr
            | PROD UNDERSCORE LBRACE VARIABLE EQUALS expr RBRACE expr
            ;

// Square root
sqrt        : SQRT LBRACE expr RBRACE
            | SQRT LBRACKET expr RBRACKET LBRACE expr RBRACE
            ;

// Functions
function    : trigFunc LPAREN expr RPAREN
            | trigFunc CARET NUMBER LPAREN expr RPAREN
            | trigFunc CARET LBRACE NUMBER RBRACE LPAREN expr RPAREN
            | trigFunc expr
            | logFunc LPAREN expr RPAREN
            | logFunc UNDERSCORE LBRACE expr RBRACE LPAREN expr RPAREN
            | customFunc LPAREN exprList RPAREN
            ;

exprList    : expr (COMMA expr)* ;

trigFunc    : SIN | COS | TAN | SEC | CSC | COT
            | ARCSIN | ARCCOS | ARCTAN
            | SINH | COSH | TANH
            ;

logFunc     : LOG | LN | EXP ;

customFunc  : VARIABLE
            | WORD
            ;

// LaTeX macros
macro       : MATHBF LBRACE expr RBRACE
            | MATHCAL LBRACE expr RBRACE
            | MATHBB LBRACE expr RBRACE
            | MATHRM LBRACE expr RBRACE
            ;

// Left-Right delimiters
leftRight   : LEFT leftDelim expr RIGHT rightDelim ;

leftDelim   : LPAREN | LBRACKET | LBRACE | PIPE | LANGLE ;
rightDelim  : RPAREN | RBRACKET | RBRACE | PIPE | RANGLE ;

// Greek letters
greekLetter : ALPHA | BETA | GAMMA | DELTA | EPSILON | THETA
            | LAMBDA | MU | PI | SIGMA | PHI | OMEGA
            ;

// ==================== LEXER RULES ====================

// Keywords and Commands
FRAC        : '\\frac' ;
SQRT        : '\\sqrt' ;
SUM         : '\\sum' ;
PROD        : '\\prod' ;
INT         : '\\int' ;
LIM         : '\\lim' ;
PARTIAL     : '\\partial' ;

// Trigonometric functions
SIN         : '\\sin' ;
COS         : '\\cos' ;
TAN         : '\\tan' ;
SEC         : '\\sec' ;
CSC         : '\\csc' ;
COT         : '\\cot' ;

// Inverse trig
ARCSIN      : '\\arcsin' ;
ARCCOS      : '\\arccos' ;
ARCTAN      : '\\arctan' ;

// Hyperbolic
SINH        : '\\sinh' ;
COSH        : '\\cosh' ;
TANH        : '\\tanh' ;

// Logarithms and exponentials
LOG         : '\\log' ;
LN          : '\\ln' ;
EXP         : '\\exp' ;

// Greek letters
ALPHA       : '\\alpha' ;
BETA        : '\\beta' ;
GAMMA       : '\\gamma' ;
DELTA       : '\\delta' ;
EPSILON     : '\\epsilon' ;
THETA       : '\\theta' ;
LAMBDA      : '\\lambda' ;
MU          : '\\mu' ;
PI          : '\\pi' ;
SIGMA       : '\\sigma' ;
PHI         : '\\phi' ;
OMEGA       : '\\omega' ;

// LaTeX macros
MATHBF      : '\\mathbf' ;
MATHCAL     : '\\mathcal' ;
MATHBB      : '\\mathbb' ;
MATHRM      : '\\mathrm' ;

// Limits
TO          : '\\to' ;
INFTY       : '\\infty' ;

// Operators
PLUS        : '+' ;
MINUS       : '-' ;
TIMES       : '\\times';
DIV         : '\\div' | '/' ;
EQUALS      : '=' ;
NEQ         : '\\neq' ;
LT          : '<' ;
GT          : '>' ;
LE          : '\\le' | '\\leq' ;
GE          : '\\ge' | '\\geq' ;
ODOT        : '\\odot';
OTIMES      : '\\otimes';
OPLUS       : '\\oplus';
STAR        :   '*';
CDOT        : '\\cdot';


// Delimiters
LPAREN      : '(' ;
RPAREN      : ')' ;
LBRACE      : '{' ;
RBRACE      : '}' ;
LBRACKET    : '[' ;
RBRACKET    : ']' ;
UNDERSCORE  : '_' ;
CARET       : '^' ;
PIPE        : '|' ;

// Special symbols
COMMA       : ',' ;

// Left/Right
LEFT        : '\\left' ;
RIGHT       : '\\right' ;

// Brackets
LANGLE      : '\\langle' ;
RANGLE      : '\\rangle' ;

// Numbers
NUMBER      : [0-9]+ ('.' [0-9]+)? ;

// Words (must come before VARIABLE to match longer sequences)
WORD        : [a-zA-Z][a-zA-Z]+ ;

// Variables (single letter)
VARIABLE    : [a-zA-Z] ;

// Whitespace
WS          : [ \t\r\n]+ -> skip ;