var Token = require("lop").Token;

module.exports = {
    end: function(source) {
        return new Token("end", null, source);
    },
    keyword: function(value, source) {
        return new Token("keyword", value, source);
    },
    whitespace: function(value, source) {
        return new Token("whitespace", value, source);
    },
    identifier: function(value, source) {
        return new Token("identifier", value, source);
    },
    symbol: function(value, source) {
        return new Token("symbol", value, source);
    },
    string: function(value, source) {
        return new Token("string", value, source);
    },
    number: function(value, source) {
        return new Token("number", value, source);
    }
};
