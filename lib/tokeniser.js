var _ = require("underscore");
var tokens = require("./tokens");
var StringIterator = require("./StringIterator");

var Tokeniser = exports.Tokeniser = function(options) {
    var keywords = options.keywords;
    var symbols = options.symbols;
    
    var matchingSymbol = function(input) {
        return _.find(symbols, function(symbol) {
            return input.peekString(symbol.length) === symbol;
        });
    };
    
    var isSymbol = function(input) {
        return !!matchingSymbol(input);
    };
    
    var tokenise = function(source) {
        var input = new StringIterator(source);
        var result = [];
        var start;
        var createTokenSource = function() {
            return start.rangeTo(input);
        };
        
        while (!input.isAtEnd()) {
            start = input.copy();
            if (input.peek() === '"') {
                result.push(tokens.string(readStringToken(input), createTokenSource()));
            } else if (isWhitespace(input)) {
                result.push(tokens.whitespace(input.takeWhile(isWhitespace), createTokenSource()));
            } else if (input.peekString(2) === "//") {
                result.push(tokens.comment(readCommentToken(input), createTokenSource()));
            } else if (isSymbol(input)) {
                var symbol = matchingSymbol(input);
                for (var i = 0; i < symbol.length; i += 1) {
                    input.next();
                }
                result.push(tokens.symbol(symbol, createTokenSource()));
            } else if (isStartOfNumber(input)) {
                var value = input.takeWhile(isDigit);
                result.push(tokens.number(value, createTokenSource()));
            } else {
                var value = input.takeWhile(and(not(isWhitespace), not(isSymbol)));
                var token = keywords.indexOf(value) === -1
                    ? tokens.identifier(value, createTokenSource())
                    : tokens.keyword(value, createTokenSource());
                result.push(token);
            }
        }

        result.push(tokens.end(input.rangeTo(input)));
        var errors = [];
        return {
            tokens: result,
            errors: errors
        };
    };
    return {
        tokenise: tokenise
    };
};

var readStringToken = function(input) {
    input.next();
    var stringValue = [];
    var value;
    while (input.peek() !== '"') {
        value = input.next();
        if (value === "\\") {
            if (input.peek() === "u") {
                input.next();
                value = String.fromCharCode(parseInt(input.peekString(4), 16));
                for (var i = 0; i < 4; i += 1) {
                    input.next();
                }
            } else {
                value = escapeCharacters[input.next()];
            }
        }
        stringValue.push(value);
    }
    input.next();
    return stringValue.join("");
};

var readCommentToken = function(input) {
    return input.takeWhile(function(input) {
        return input.peek() !== "\n";
    });
};

var isWhitespace = function(input) {
    return /^\s$/.test(input.peek());
};

var isStartOfNumber = function(input) {
    return isDigit(input);
};

var isDigit = function(input) {
    return /^[0-9]$/.test(input.peek());
};

var not = function(condition) {
    return function(value) {
        return !condition(value);
    };
};

var and = function() {
    var conditions = Array.prototype.slice.call(arguments, 0);
    return function(value) {
        return conditions.every(function(condition) {
            return condition(value);
        });
    };
};

var escapeCharacters = {
    '"': '"',
    'b': '\b',
    't': '\t',
    'n': '\n',
    'f': '\f',
    'r': '\r',
    '\'': '\'',
    '\\': '\\'
};
