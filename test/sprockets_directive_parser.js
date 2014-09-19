var expect = require("chai").expect;

var fs = require("fs");
var gutil = require("gulp-util");
var include = require("../index");

var SprocketsDirectiveParser = require("../lib/sprockets_directive_parser");

describe("gulp-sprockets-directive-parser", function () {
  // Rethink this, not really testing anything useful
  describe("expanding", function () {
    var file = null;
    var results = [];
    var fixture = function(name) {
      return new gutil.File({
        base: "test/fixtures/",
        path: "test/fixtures/"+ name,
        contents: fs.readFileSync("test/fixtures/"+ name)
      });
    };

    beforeEach(function() {
      results = [];
      var parser = new SprocketsDirectiveParser();
      parser.expandFile(file);
      results = parser.files;
    });
    describe("trimming", function() {
      context("trim_header", function() {
        before(function() { file = fixture("trim_header/trim_header.js"); });
        it("strips header", function() {
          expect(results[1].contents.toString("utf8")).to.equal("D’angelo Barksdale\n");
        });
      });
      context("require_self", function() {
        before(function() { file = fixture("trim_header_require_self/trim_header_require_self.js"); });
        it("strips header", function() {
          expect(results[0].contents.toString("utf8")).to.equal("D’angelo Barksdale\n");
        });
      });
    });
    describe("expanding", function() {
      describe("= require", function() {
        context("simple_require", function() {
          before(function() { file = fixture("simple_require.js"); });
          it("expands require files", function() {
            expect(results.length).to.equal(3)
            expect(results[0].path).to.equal("test/fixtures/simple_require/a.js")
            expect(results[1].path).to.equal("test/fixtures/simple_require/b.js")
            expect(results[2].path).to.equal("test/fixtures/simple_require.js")
          });
          it("sets same `basePath` as passed in file", function() {
            expect(results.length).to.equal(3)
            expect(results[0].base).to.equal("test/fixtures/")
            expect(results[1].base).to.equal("test/fixtures/")
            expect(results[1].base).to.equal("test/fixtures/")
          });
        });

        context("prevent_duplications", function() {
          before(function() { file = fixture("prevent_duplications.js"); });
          it("prevents same file from being added more then once", function() {
            expect(results.length).to.equal(2);
            expect(results[0].path).to.equal("test/fixtures/prevent_duplications/a.js")
            expect(results[1].path).to.equal("test/fixtures/prevent_duplications.js")
          });
        });
        context("requires_simple_require", function() {
          before(function() { file = fixture("requires_simple_require.js"); });
          it("requires a file with its own requires", function() {
            expect(results.length).to.equal(4)
            expect(results[0].path).to.equal("test/fixtures/simple_require/a.js")
            expect(results[1].path).to.equal("test/fixtures/simple_require/b.js")
            expect(results[2].path).to.equal("test/fixtures/simple_require.js")
            expect(results[3].path).to.equal("test/fixtures/requires_simple_require.js")
          });
        });
      });

      describe("= require_tree", function() {
        context("require_tree", function() {
          before(function() { file = fixture("require_tree.js"); });
          it("requires file correctly", function() {
            expect(results.length).to.equal(3)
            expect(results[0].path).to.equal("test/fixtures/require_tree/a.js")
            expect(results[1].path).to.equal("test/fixtures/require_tree/b.js")
            expect(results[2].path).to.equal("test/fixtures/require_tree.js")
          });
        });

        context("require_tree_nested", function() {
          before(function() { file = fixture("require_tree_nested.js"); });
          it("requires file correctly", function() {
            expect(results.length).to.equal(4);
            expect(results[0].path).to.equal("test/fixtures/require_tree_nested/a.js")
            expect(results[1].path).to.equal("test/fixtures/require_tree_nested/b/c.js")
            expect(results[2].path).to.equal("test/fixtures/require_tree_nested/d.js")
            expect(results[3].path).to.equal("test/fixtures/require_tree_nested.js")
          });
        });

        context("require_tree_require", function() {
          before(function() { file = fixture("require_tree_require.js"); });
          it("requires tree", function() {
            expect(results.length).to.equal(3)
            expect(results[0].path).to.equal("test/fixtures/require_tree_require/b.js")
            expect(results[1].path).to.equal("test/fixtures/require_tree_require/a.js")
            expect(results[2].path).to.equal("test/fixtures/require_tree_require.js")
          });

          it("inherits base path", function() {
            expect(results.length).to.equal(3)
            expect(results[0].base).to.equal("test/fixtures/")
            expect(results[1].base).to.equal("test/fixtures/")
            expect(results[2].base).to.equal("test/fixtures/")
          });
        });
      });

      describe("= require_directory", function() {
        context("require_directory", function() {
          before(function() { file = fixture("require_directory.js"); });
          it("requires file correctly", function() {
            expect(results.length).to.equal(3)
            expect(results[0].path).to.equal("test/fixtures/require_directory/a.js")
            expect(results[1].path).to.equal("test/fixtures/require_directory/b.js")
            expect(results[2].path).to.equal("test/fixtures/require_directory.js")
          });
        });
      });

      describe("= require_self", function() {
        it("inserts itself correctly", function() {
          before(function() { file = fixture("require_self.js"); });
          it("insers itself in the middle", function() {
            expect(results.length).to.equal(3);
            expect(results[0].path).to.equal("test/fixtures/require_self/a.js");
            expect(results[1].path).to.equal("test/fixtures/require_self.js");
            expect(results[2].path).to.equal("test/fixtures/require_self/a.js");
          });
        });
      });

      describe("= stub", function() {
        context("stub_file", function() {
          before(function() { file = fixture("stub_file.js"); });
          it("stubs file", function() {
            expect(results.length).to.equal(2);
            expect(results[0].path).to.equal("test/fixtures/stub_file/a.js");
            expect(results[1].path).to.equal("test/fixtures/stub_file.js");
          });
        });
        context("stub_file_post_mortem", function() {
          before(function() { file = fixture("stub_file.js"); });
          it("stubs already included file", function() {
            expect(results.length).to.equal(2);
            expect(results[0].path).to.equal("test/fixtures/stub_file/a.js");
            expect(results[1].path).to.equal("test/fixtures/stub_file.js");
          });
        });
      });
    });
  });
});
