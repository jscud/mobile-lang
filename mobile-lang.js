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
  STRING_ESCAPE: 2,
  IDENTIFIER: 3,
  NUMBER_START: 4,
  NUMBER_INTEGER_PART: 5,
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

MobileLang.NodeTypes = {
  STRING_LITERAL: 0,
  IDENTIFIER: 1,
  INT_LITERAL: 2,
  FLOAT_LITERAL: 3,
  OPEN_PAREN: 4,
  CLOSE_PAREN: 5,
  DOT: 6,
  COMMA: 7,
  ILLEGAL: 8
};

MobileLang.Parser.prototype.nextToken = function() {
  // Skip over whitespace.
  while (/\s/.test(this.current())) {
    this.step();
  }
  var current = this.current();
  var c = null;
  if (current == '"') {
    return this.parseString();
  } else if (/\d/.test(current)) {
    return this.parseNumber();
  } else if (/[a-zA-Z]/.test(current)) {
    return this.parseIdentifier();
  } else {
    return this.parseSingleCharacter();
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

MobileLang.StringLiteral = function() {
  this.contents = '';
  this.type = MobileLang.NodeTypes.STRING_LITERAL;
};

MobileLang.Parser.prototype.parseIdentifier = function() {
  var identifier = new MobileLang.Identifier();
  var current = this.current();
  if (current != null && /[a-zA-Z]/.test(current)) {
    identifier.name += current;
	this.step();
	current = this.current();
  
    while (current != null && /[0-9a-zA-Z]/.test(current)) {
      identifier.name += current;
	  this.step();
	  current = this.current();
    }
  }
  return identifier;
};

MobileLang.Identifier = function() {
  this.name = '';
  this.type = MobileLang.NodeTypes.IDENTIFIER;
};

MobileLang.Parser.prototype.parseNumber = function() {
  var num = new MobileLang.NumberLiteral();
  var current = this.current();
  var keepGoing = true;
  this.state = MobileLang.ParserState.NUMBER_START;
  while (keepGoing && current != null) {
    if (this.state == MobileLang.ParserState.NUMBER_START && current == '-') {
      num.isNegative = true;
      num.type = MobileLang.NodeTypes.INT_LITERAL;
      this.state = MobileLang.ParserState.NUMBER_INTEGER_PART;
	  this.step();
    } else if (/\d/.test(current) && this.state == MobileLang.ParserState.NUMBER_START) {
      num.isNegative = false;
      num.type = MobileLang.NodeTypes.INT_LITERAL;
      num.integerPart += current;
      this.state = MobileLang.ParserState.NUMBER_INTEGER_PART;
	  this.step();
    } else if (/\d/.test(current) && this.state == MobileLang.ParserState.NUMBER_INTEGER_PART) {
      num.integerPart += current;
	  this.step();
    } else {
      keepGoing = false;
    }
    current = this.current();
  }
  return num;
};

MobileLang.NumberLiteral = function() {
  this.isNegative = null;
  this.integerPart = '';
  this.fractionalPart = '';
  this.type = null;
};

MobileLang.Parser.prototype.parseSingleCharacter = function() {
  var c = new MobileLang.SingleCharacter();
  c.character = this.current();
  switch (c.character) {
    case '(':
	  c.type = MobileLang.NodeTypes.OPEN_PAREN;
	  break;
	case ')':
	  c.type = MobileLang.NodeTypes.CLOSE_PAREN;
	  break;
	case '.':
	  c.type = MobileLang.NodeTypes.DOT;
	  break;
	case ',':
	  c.type = MobileLang.NodeTypes.COMMA;
	  break;
	default:
	  c.type = MobileLang.NodeTypes.ILLEGAL;
  }
  this.step();
  return c;
};

MobileLang.SingleCharacter = function() {
  this.character = '';
  this.type = null;
};