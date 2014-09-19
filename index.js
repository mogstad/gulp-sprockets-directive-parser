var through = require("through2");
var SprocketsDirectiveParser = require("./lib/sprockets_directive_parser");
var gutil = require('gulp-util');

module.exports = function(options) {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null);
    }
    if (file.isStream()) {
      throw new gutil.PluginError("gulp-include", "stream not supported");
    }
    if (file.isBuffer()) {
      var directiveParser = new SprocketsDirectiveParser(options);
      directiveParser.expandFile(file);
      for (var index = 0; index < directiveParser.files.length; index++) {
        this.push(directiveParser.files[index]);
      }
    }
    setImmediate(callback);
  });
};
