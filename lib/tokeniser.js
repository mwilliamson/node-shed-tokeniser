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
        var start = input.copy();
        var createTokenSource = function() {
            var result = start.rangeTo(input);
            start = input.copy();
            return result;
        };
        
        var indents = [];
        
        while (!input.isAtEnd()) {
            var loopStart = input.copy();
            if (input.peek() === '"') {
                result.push(tokens.string(readString(input), createTokenSource()));
            } else if (input.peek() === "\n") {
                if (isBlankLine(input)) {
                    result.push(tokens.whitespace(readBlankLine(input), createTokenSource()));
                } else {
                    result.push(tokens.newLine(input.next(), createTokenSource()));
                    var lastIndent = indents[indents.length - 1] || 0;
                    var currentIndent = 0;
                    while (!input.isAtEnd() && input.peek() === " " && currentIndent < lastIndent) {
                        input.next();
                        currentIndent += 1;
                    }
                    if (currentIndent > 0) {
                        result.push(tokens.whitespace(repeatString(" ", currentIndent), createTokenSource()));
                    }
                    
                    if (currentIndent < lastIndent) {
                        var escapedIndents = indents.filter(function(indent) {
                            return indent > currentIndent;
                        }).forEach(function() {
                            result.push(tokens.dedent(createTokenSource()));
                        });
                    } else {
                        var indent = readIndent(input);
                        if (indent.length > 0) {
                            indents.push(lastIndent + indent.length);
                            result.push(tokens.indent(indent, createTokenSource()));
                        }
                    }
                }
            } else if (isWhitespace(input)) {
                result.push(tokens.whitespace(readWhitespace(input), createTokenSource()));
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
            if (input.position() === loopStart.position()) {
                throw new Error("Not making progress");
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

var readString = function(input) {
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

var isBlankLine = function(input) {
    input = input.copy();
    if (input.next() !== "\n") {
        return false;
    }
    var line = input.takeWhile(function(input) {
        return input !== "\n";
    });
    return /^\s*$/.test(line);
};

var readBlankLine = function(input) {
    return input.next() + input.takeWhile(function(input) {
        return input !== "\n";
    });
};

var readIndent = function(input) {
    return input.takeWhile(function(input) {
        return input.peek() === " ";
    });
};

var readWhitespace = function(input) {
    return input.takeWhile(function(input) {
        return isWhitespace(input) && input.peek() !== "\n";
    });
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

var indentation = function(value) {
    return "\n" + new Array(value + 1).join(" ");
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

var repeatString = function(string, times) {
    return new Array(times + 1).join(string);
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
