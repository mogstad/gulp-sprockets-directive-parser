var DIRECTIVE_REGEX = /^[\/\s#]*?=\s*?(require_self|require_tree|require_directory|require|stub|self_require)\s+(.*$)/mg;
// Stolen from the excelent sprockets-chain module
var HEADER_PATTERN = new RegExp(
  '^(?:\\s*' +
    '(' +
      '(?:\/[*](?:\\s*|.+?)*?[*]\/)' + '|' +
      '(?:\/\/.*\n?)+' + '|' +
      '(?:#.*\n?)+' +
    ')*' +
  ')*', 'm');

function SprocketsHeaderParser(fileContents) {
  HEADER_PATTERN.lastIndex = 0;

  var directives = [];
  var header = (HEADER_PATTERN.exec(fileContents) || []).shift() || '';
  header.split(/\r?\n/).forEach(function(line) {
    DIRECTIVE_REGEX.lastIndex = 0;
    var directive;
    while (directive = DIRECTIVE_REGEX.exec(line)) {
      directives.push({
        type: directive[1],
        file: directive[2]
      });
    }
  });
  return {
    directives: directives,
    header: header
  };
};

module.exports = SprocketsHeaderParser;
