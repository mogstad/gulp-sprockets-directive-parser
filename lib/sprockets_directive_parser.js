var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var glob = require('glob');
var SprocketsHeaderParser = require("./sprockets_header_parser");

function SprocketsDirectiveParser(options) {
  this.files = [];
  this._stubs = [];
  this._requiredFiles = {};

  this._options = options || {};
};

SprocketsDirectiveParser.prototype.addFile = function(file) {
  if (this.canProccessFileAtPath(file.path)) {
    this.files.push(file);
    this._requiredFiles[file.path] = file;
  }
};

SprocketsDirectiveParser.prototype.stubFiles = function(files) {
  for (var index = 0; index < files.length; index++) {
    var file = files[index];
    this.stubFile(file);
  }
};

SprocketsDirectiveParser.prototype.stubFile = function(filePath) {
  var file = this._requiredFiles[filePath];
  if (file) {
    var index = this.files.indexOf(file);
    if (~index) {
      this.files.splice(index, 1);
    }
  }
  this._stubs[filePath] = true;
};

SprocketsDirectiveParser.prototype.canProccessFileAtPath = function(path) {
  return !this._requiredFiles[path] && !this._stubs[path];
};

SprocketsDirectiveParser.prototype.expandFiles = function(files, targetFile) {
  for (var index = 0; index < files.length; index++) {
    var fileName = files[index];
    if (this.canProccessFileAtPath(fileName)) {
      var file = new gutil.File({
        base: targetFile.base,
        path: fileName,
        contents: fs.readFileSync(fileName)
      });
      this.expandFile(file);
    }
  }
};

SprocketsDirectiveParser.prototype.expandFile = function(targetFile) {
  var headers = SprocketsHeaderParser(targetFile.contents.toString("utf8"));
  var directives = headers.directives;
  if (headers.header.length) {
    var tempFile = targetFile.clone();
    var newContent = targetFile.contents.toString();
    newContent = newContent.substring(headers.header.length);
    tempFile.contents = new Buffer(newContent);
    targetFile = tempFile;
  }

  for (var index = 0; index < directives.length; index++) {
    var directive = directives[index];
    if (directive.type === "require_self") {
      this.addFile(targetFile);
    } else if (directive.type === "stub") {
      var files = this._internalGlob(directive.file, targetFile.path);
      this.stubFiles(files);
    } else {
      var files = this._filesForMatch(directive, targetFile.path);
      this.expandFiles(files, targetFile);
    }
  }

  this.addFile(targetFile);
};

//
// Private
//

SprocketsDirectiveParser.prototype._internalGlob = function(thisGlob, filePath) {
  var folderPath = path.dirname(filePath);
  var fullPath = path.join(folderPath, thisGlob.replace(/['"]/g, ''));

  var files = glob.sync(fullPath, {
    mark: true
  });

  return files.filter(function(fileName) {
    var slashSplit = fileName.split(/[\\\/]/);
    var thisExtension = fileName.split('.').pop();

    // Ignore directories
    if (slashSplit.pop() === '') {
      return false;
    }

    return true;
  });
};

SprocketsDirectiveParser.prototype._filesForMatch = function(directive, filePath) {
  var directiveType = directive.type;
  var relativeFilePath = directive.file;

  if (directiveType === 'require') {
    var basename = path.basename(relativeFilePath);
    if (basename.indexOf(".") === -1) {
      relativeFilePath = relativeFilePath.concat(".*");
    }
  }

  if (directiveType.indexOf('_tree') !== -1) {
    relativeFilePath = relativeFilePath.concat('/**/*');
    directiveType = directiveType.replace('_tree', '');
  }

  if (directiveType.indexOf('_directory') !== -1) {
    relativeFilePath = relativeFilePath.concat('/*');
    directiveType = directiveType.replace('_directory', '');
  }

  if (directiveType === 'require') {
    return this._internalGlob(relativeFilePath, filePath);
  }

  return [];
};

module.exports = SprocketsDirectiveParser;
