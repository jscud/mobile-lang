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

MobileLang.Parser = function(code) {
  this.code = code;
  this.index = 0;
};

MobileLang.Parser.prototype.buildTree() {
  
};