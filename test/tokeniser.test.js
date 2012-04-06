var Tokeniser = require("../lib/tokeniser").Tokeniser;
var tokens = require("../lib/tokens");
var StringSource = require("lop").StringSource;

var keywords = ["true", "false"];
var symbols = ["(", ")", "=>", "+"];

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
    
exports.newLineIsTokenised =
    stringIsTokenisedTo("\n", [
        tokens.newLine("\n", stringSourceRange("\n", 0, 1)),
        tokens.end(stringSourceRange("\n", 1, 1))
    ]);
    
exports.whitespaceIsTokenised =
    stringIsTokenisedTo("  \t\t\r ", [
        tokens.whitespace("  \t\t\r ", stringSourceRange("  \t\t\r ", 0, 6)),
        tokens.end(stringSourceRange("  \t\t\r ", 6, 6))
    ]);
    
exports.runsOfDifferentTokensAreTokenised =
    stringIsTokenisedTo("  \t\t\r blah true", [
        tokens.whitespace("  \t\t\r ", stringSourceRange("  \t\t\r blah true", 0, 6)),
        tokens.identifier("blah", stringSourceRange("  \t\t\r blah true", 6, 10)),
        tokens.whitespace(" ", stringSourceRange("  \t\t\r blah true", 10, 11)),
        tokens.keyword("true", stringSourceRange("  \t\t\r blah true", 11, 15)),
        tokens.end(stringSourceRange("  \t\t\r blah true", 15, 15))
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
    stringIsTokenisedTo("42 // Blah\n+", [
        tokens.number("42", stringSourceRange("42 // Blah\n+", 0, 2)),
        tokens.whitespace(" ", stringSourceRange("42 // Blah\n+", 2, 3)),
        tokens.comment("// Blah", stringSourceRange("42 // Blah\n+", 3, 10)),
        tokens.newLine("\n", stringSourceRange("42 // Blah\n+", 10, 11)),
        tokens.symbol("+", stringSourceRange("42 // Blah\n+", 11, 12)),
        tokens.end(stringSourceRange("42 // Blah\n+", 12, 12))
    ]);

exports.spacesAfterNewLineIsTokenisedAsIndent = (function() {
    var source = function(start, end) {
        return stringSourceRange("(\n  1", start, end);
    };
    return stringIsTokenisedTo("(\n  1", [
        tokens.symbol("(", source(0, 1)),
        tokens.newLine("\n", source(1, 2)),
        tokens.indent("  ", source(2, 4)),
        tokens.number("1", source(4, 5)),
        tokens.end(source(5, 5))
    ]);
})();

exports.increasingIndentationIsTokenisedAsIndents = (function() {
    var source = function(start, end) {
        return stringSourceRange("(\n  1\n   2\n       3", start, end);
    };
    return stringIsTokenisedTo("(\n  1\n   2\n       3", [
        tokens.symbol("(", source(0, 1)),
        tokens.newLine("\n", source(1, 2)),
        tokens.indent("  ", source(2, 4)),
        tokens.number("1", source(4, 5)),
        tokens.newLine("\n", source(5, 6)),
        tokens.whitespace("  ", source(6, 8)),
        tokens.indent(" ", source(8, 9)),
        tokens.number("2", source(9, 10)),
        tokens.newLine("\n", source(10, 11)),
        tokens.whitespace("   ", source(11, 14)),
        tokens.indent("    ", source(14, 18)),
        tokens.number("3", source(18, 19)),
        tokens.end(source(19, 19))
    ]);
})();

exports.consistentIndentationProducesNoIndentTokens = (function() {
    var source = function(start, end) {
        return stringSourceRange("(\n  1\n  2\n  3", start, end);
    };
    return stringIsTokenisedTo("(\n  1\n  2\n  3", [
        tokens.symbol("(", source(0, 1)),
        tokens.newLine("\n", source(1, 2)),
        tokens.indent("  ", source(2, 4)),
        tokens.number("1", source(4, 5)),
        tokens.newLine("\n", source(5, 6)),
        tokens.whitespace("  ", source(6, 8)),
        tokens.number("2", source(8, 9)),
        tokens.newLine("\n", source(9, 10)),
        tokens.whitespace("  ", source(10, 12)),
        tokens.number("3", source(12, 13)),
        tokens.end(source(13, 13))
    ]);
})();

exports.returningToPreviousIndentationProducesSingleDedent = (function() {
    var source = function(start, end) {
        return stringSourceRange("(\n  1\n)", start, end);
    };
    return stringIsTokenisedTo("(\n  1\n)", [
        tokens.symbol("(", source(0, 1)),
        tokens.newLine("\n", source(1, 2)),
        tokens.indent("  ", source(2, 4)),
        tokens.number("1", source(4, 5)),
        tokens.newLine("\n", source(5, 6)),
        tokens.dedent(source(6, 6)),
        tokens.symbol(")", source(6, 7)),
        tokens.end(source(7, 7))
    ]);
})();

exports.leavingMultipleLevelsOfIndentationCreatesMultipleDedents = (function() {
    var source = function(start, end) {
        return stringSourceRange("(\n  1\n   2\n3", start, end);
    };
    return stringIsTokenisedTo("(\n  1\n   2\n3", [
        tokens.symbol("(", source(0, 1)),
        tokens.newLine("\n", source(1, 2)),
        tokens.indent("  ", source(2, 4)),
        tokens.number("1", source(4, 5)),
        tokens.newLine("\n", source(5, 6)),
        tokens.whitespace("  ", source(6, 8)),
        tokens.indent(" ", source(8, 9)),
        tokens.number("2", source(9, 10)),
        tokens.newLine("\n", source(10, 11)),
        tokens.dedent(source(11, 11)),
        tokens.dedent(source(11, 11)),
        tokens.number("3", source(11, 12)),
        tokens.end(source(12, 12))
    ]);
})();

function stringIsTokenisedTo(string, expected) {
    var source = new StringSource(string);
    var tokeniser = new Tokeniser({keywords: keywords, symbols: symbols});
    
    return function(test) {
        test.deepEqual(expected, tokeniser.tokenise(source).tokens);
        test.done();
    };
};

