var MobileLang = {};

MobileLang.interpret = function(code) {
  var parseTree = MobileLang.parse(code);
  MobileLang.execute(parseTree);
};

MobileLang.parse = function(code) {
  return (new MobileLang.Parser(code)).buildTree();
};

MobileLang.execute = function(parseTree) {

};

MobileLang.ParserState = {
  START: 0,
  STRING_LITERAL: 1,
  STRING_ESCAPE: 2
};

MobileLang.Parser = function(code) {
  this.code = code;
  this.index = 0;
  this.state = MobileLang.ParserState.START;
};

MobileLang.Parser.prototype.current = function() {
  if (this.index < this.code.length) {
    return this.code[this.index];
  }
  return null;
};

MobileLang.Parser.prototype.step = function() {
  this.index++;
};

MobileLang.Parser.prototype.parseProgram = function() {
  var current = this.current();
  while (current != null) {
    if (this.state == MobileLang.ParserState.START &&
        current == '"') {
      this.state = MobileLang.ParserState.STRING_LITERAL;
    } else if (this.state == MobileLang.ParserState.STRING_LITERAL &&
               current == '"') {
      
    }
    this.step();
    current = this.current();
  }
};

MobileLang.Parser.prototype.parseString = function() {
  var str = new MobileLang.StringLiteral();
  var current = this.current();
  // Must start with a double quote.
  if (current != '"') {
    return null;
  }
  var keepParsing = true;
  var isEscaped = false;
  while(keepParsing && current != null) {
    this.step();
    current = this.current();
    // Use / for escaping since it's easier than \ to get to on a mobile
    // keyboard.
    if (!isEscaped && current == '/') {
      isEscaped = true;
    } else if (!isEscaped && current == '"') {
      // Move past the closing double quote.
      this.step();
      return str;
    } else if (isEscaped && current == '"') {
      str.contents += current;
      isEscaped = false;
    } else if (isEscaped && current == '/') {
      str.contents += current;
      isEscaped = false;
    } else if (isEscaped && current == 'n') {
      str.contents += '\n';
      isEscaped = false;
    } else if (isEscaped && current == 't') {
      str.contents += '\t';
      isEscaped = false;
    } else if (current != null) {
      str.contents += current;
      isEscaped = false;
    }
  }
  return str;
};

MobileLang.NodeTypes = {
  STRING_LITERAL: 0
};

MobileLang.StringLiteral = function() {
  this.contents = '';
  this.type = MobileLang.NodeTypes.STRING_LITERAL;
};