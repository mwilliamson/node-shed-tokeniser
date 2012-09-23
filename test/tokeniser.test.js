var Tokeniser = require("../lib/tokeniser").Tokeniser;
var tokens = require("../lib/tokens");
var StringSource = require("lop").StringSource;

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>", "+", "{", "}", "[", "]"];

var stringSourceRange = function(string, startIndex, endIndex) {
    return new StringSource(string).range(startIndex, endIndex);
};

exports.emptyStringIsTokenisedToEndToken =
    stringIsTokenisedTo("", [tokens.end(stringSourceRange("", 0, 0))]);
    
exports.keywordIsTokenised =
    stringIsTokenisedTo("true", [
        tokens.keyword("true", stringSourceRange("true", 0, 4)),
        tokens.end(stringSourceRange("true", 4, 4))
    ]);
    
exports.secondKeywordIsTokenised =
    stringIsTokenisedTo("false", [
        tokens.keyword("false", stringSourceRange("false", 0, 5)),
        tokens.end(stringSourceRange("false", 5, 5))
    ]);
    
exports.identifierIsTokenised =
    stringIsTokenisedTo("blah", [
        tokens.identifier("blah", stringSourceRange("blah", 0, 4)),
        tokens.end(stringSourceRange("blah", 4, 4))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\n\r ", [
        tokens.whitespace("  \t\n\r ", stringSourceRange("  \t\n\r ", 0, 6)),
        tokens.end(stringSourceRange("  \t\n\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\n\r blah true", [
        tokens.whitespace("  \t\n\r ", stringSourceRange("  \t\n\r blah true", 0, 6)),
        tokens.identifier("blah", stringSourceRange("  \t\n\r blah true", 6, 10)),
        tokens.whitespace(" ", stringSourceRange("  \t\n\r blah true", 10, 11)),
        tokens.keyword("true", stringSourceRange("  \t\n\r blah true", 11, 15)),
        tokens.end(stringSourceRange("  \t\n\r blah true", 15, 15))
    ]);

exports.newLineNotFollowedByWhitespaceIsSignificant =
    stringIsTokenisedTo("x\ny", [
        tokens.identifier("x", stringSourceRange("x\ny", 0, 1)),
        tokens.significantNewLine("\n", stringSourceRange("x\ny", 1, 2)),
        tokens.identifier("y", stringSourceRange("x\ny", 2, 3)),
        tokens.end(stringSourceRange("x\ny", 3, 3))
    ]);

exports.newLineAtEndOfInputIsSignificant =
    stringIsTokenisedTo("\n", [
        tokens.significantNewLine("\n", stringSourceRange("\n", 0, 1)),
        tokens.end(stringSourceRange("\n", 1, 1))
    ]);

exports.newLineFollowedByWhitespaceIsNotSignificant =
    stringIsTokenisedTo("x\n y", [
        tokens.identifier("x", stringSourceRange("x\n y", 0, 1)),
        tokens.whitespace("\n ", stringSourceRange("x\n y", 1, 3)),
        tokens.identifier("y", stringSourceRange("x\n y", 3, 4)),
        tokens.end(stringSourceRange("x\n y", 4, 4))
    ]);

exports.whitespaceFollowedByNewLineNotFollowedByWhitespaceIsSignificant =
    stringIsTokenisedTo("x \ny", [
        tokens.identifier("x", stringSourceRange("x \ny", 0, 1)),
        tokens.whitespace(" ", stringSourceRange("x \ny", 1, 2)),
        tokens.significantNewLine("\n", stringSourceRange("x \ny", 2, 3)),
        tokens.identifier("y", stringSourceRange("x \ny", 3, 4)),
        tokens.end(stringSourceRange("x \ny", 4, 4))
    ]);

exports.newLineAtOpeningIndentationOfCurlyBlockIsSignificant =
    stringIsTokenisedTo("{  x\n  y}", [
        tokens.symbol("{", stringSourceRange("{  x\n  y}", 0, 1)),
        tokens.whitespace("  ", stringSourceRange("{  x\n  y}", 1, 3)),
        tokens.identifier("x", stringSourceRange("{  x\n  y}", 3, 4)),
        tokens.significantNewLine("\n", stringSourceRange("{  x\n  y}", 4, 5)),
        tokens.whitespace("  ", stringSourceRange("{  x\n  y}", 5, 7)),
        tokens.identifier("y", stringSourceRange("{  x\n  y}", 7, 8)),
        tokens.symbol("}", stringSourceRange("{  x\n  y}", 8, 9)),
        tokens.end(stringSourceRange("{  x\n  y}", 9, 9))
    ]);

exports.newLineAtOpeningIndentationOfCurlyBlockIsSignificant =
    stringIsTokenisedTo("{  x\n  y}", [
        tokens.symbol("{", stringSourceRange("{  x\n  y}", 0, 1)),
        tokens.whitespace("  ", stringSourceRange("{  x\n  y}", 1, 3)),
        tokens.identifier("x", stringSourceRange("{  x\n  y}", 3, 4)),
        tokens.significantNewLine("\n", stringSourceRange("{  x\n  y}", 4, 5)),
        tokens.whitespace("  ", stringSourceRange("{  x\n  y}", 5, 7)),
        tokens.identifier("y", stringSourceRange("{  x\n  y}", 7, 8)),
        tokens.symbol("}", stringSourceRange("{  x\n  y}", 8, 9)),
        tokens.end(stringSourceRange("{  x\n  y}", 9, 9))
    ]);

exports.canTokeniseCurlyBlockWithoutNewLine =
    stringIsTokenisedTo("{}", [
        tokens.symbol("{", stringSourceRange("{}", 0, 1)),
        tokens.symbol("}", stringSourceRange("{}", 1, 2)),
        tokens.end(stringSourceRange("{}", 2, 2))
    ]);

exports.newLinesInsideParensAreNotSignificant =
    stringIsTokenisedTo("(\n)", [
        tokens.symbol("(", stringSourceRange("(\n)", 0, 1)),
        tokens.whitespace("\n", stringSourceRange("(\n)", 1, 2)),
        tokens.symbol(")", stringSourceRange("(\n)", 2, 3)),
        tokens.end(stringSourceRange("(\n)", 3, 3))
    ]);

exports.newLinesInsideSquareBracketsAreNotSignificant =
    stringIsTokenisedTo("[\n]", [
        tokens.symbol("[", stringSourceRange("[\n]", 0, 1)),
        tokens.whitespace("\n", stringSourceRange("[\n]", 1, 2)),
        tokens.symbol("]", stringSourceRange("[\n]", 2, 3)),
        tokens.end(stringSourceRange("[\n]", 3, 3))
    ]);
    
exports.symbolIsTokenised =
    stringIsTokenisedTo("(", [
        tokens.symbol("(", stringSourceRange("(", 0, 1)),
        tokens.end(stringSourceRange("(", 1, 1))
    ]);
    
exports.adjacentSymbolsAreTokenisedAsSeparateSymbols =
    stringIsTokenisedTo("()", [
        tokens.symbol("(", stringSourceRange("()", 0, 1)),
        tokens.symbol(")", stringSourceRange("()", 1, 2)),
        tokens.end(stringSourceRange("()", 2, 2))
    ]);
    
exports.symbolsCanBeMultipleCharacters =
    stringIsTokenisedTo("=>", [
        tokens.symbol("=>", stringSourceRange("=>", 0, 2)),
        tokens.end(stringSourceRange("=>", 2, 2))
    ]);
    
exports.whitespaceIsNotRequiredBetweenIdentifierAndSymbol =
    stringIsTokenisedTo("blah()", [
        tokens.identifier("blah", stringSourceRange("blah()", 0, 4)),
        tokens.symbol("(", stringSourceRange("blah()", 4, 5)),
        tokens.symbol(")", stringSourceRange("blah()", 5, 6)),
        tokens.end(stringSourceRange("blah()", 6, 6))
    ]);
    
exports.canParseSimpleString =
    stringIsTokenisedTo('"Blah"', [
        tokens.string("Blah", stringSourceRange('"Blah"', 0, 6)),
        tokens.end(stringSourceRange('"Blah"', 6, 6))
    ]);
    
exports.canParseStringWithEscapedCharacters =
    stringIsTokenisedTo("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", [
        tokens.string("\"\b\t\n\f\r'\\", stringSourceRange("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 0, 18)),
        tokens.end(stringSourceRange("\"\\\"\\b\\t\\n\\f\\r\\'\\\\\"", 18, 18))
    ]);
    
exports.canReadUnicodeCharacters = 
    stringIsTokenisedTo("\"\\u000a\"", [
        tokens.string("\n", stringSourceRange("\"\\u000a\"", 0, 8)),
        tokens.end(stringSourceRange("\"\\u000a\"", 8, 8))
    ]);

exports.canParseZero =
    stringIsTokenisedTo("0", [
        tokens.number("0", stringSourceRange("0", 0, 1)),
        tokens.end(stringSourceRange("0", 1, 1))
    ]);

exports.canParsePositiveIntegers =
    stringIsTokenisedTo("42", [
        tokens.number("42", stringSourceRange("42", 0, 2)),
        tokens.end(stringSourceRange("42", 2, 2))
    ]);

exports.singleLineCommentsStartWithDoubleSlash =
    stringIsTokenisedTo("42 // Blah", [
        tokens.number("42", stringSourceRange("42 // Blah", 0, 2)),
        tokens.whitespace(" ", stringSourceRange("42 // Blah", 2, 3)),
        tokens.comment("// Blah", stringSourceRange("42 // Blah", 3, 10)),
        tokens.end(stringSourceRange("42 // Blah", 10, 10))
    ]);

exports.singleLineCommentsEndAtNewLine =
    stringIsTokenisedTo("42 // Blah\n +", [
        tokens.number("42", stringSourceRange("42 // Blah\n +", 0, 2)),
        tokens.whitespace(" ", stringSourceRange("42 // Blah\n +", 2, 3)),
        tokens.comment("// Blah", stringSourceRange("42 // Blah\n +", 3, 10)),
        tokens.whitespace("\n ", stringSourceRange("42 // Blah\n +", 10, 12)),
        tokens.symbol("+", stringSourceRange("42 // Blah\n +", 12, 13)),
        tokens.end(stringSourceRange("42 // Blah\n +", 13, 13))
    ]);

function stringIsTokenisedTo(string, expected) {
    var source = new StringSource(string);
    var tokeniser = new Tokeniser({keywords: keywords, symbols: symbols});
    
    return function(test) {
        test.deepEqual(expected, tokeniser.tokenise(source).tokens);
        test.done();
    };
};

