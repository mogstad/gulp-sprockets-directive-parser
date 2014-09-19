# gulp-sprockets-directive-parser

gulp-sprockets-directive-parser is a Gulp plugin that parses sprockets directive and expands _assets bundles_ into a stream of files.

## Install

```
$ npm install --save-dev gulp-sprockets-directive-parser
```

## Usage

```javascript
var gulp = require("gulp");
var concat = require("gulp-concat");
var directiveParser	= require("gulp-sprockets-directive-parser");
var coffee = require("gulp-coffee");

gulp.task("scripts", function() {
  gulp.src("src/js/app.coffee")
    .pipe(directiveParser())
    .pipe(coffee())
    .pipe(concat("web.js"))
    .pipe(gulp.dest("dist/js"))
});
```

## Thanks

gulp-sprockets-directive-parser is a fork of the node module [gulp-include](https://github.com/wiledal/gulp-include/)
