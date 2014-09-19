var expect = require("chai").expect;
var SprocketsHeaderParser = require("../lib/sprockets_header_parser");

describe("sprockets-header-parser", function() {
  it("matches require", function () {
    directives = SprocketsHeaderParser("//= require src/blah.js");
    expect(directives.directives.length).to.equal(1);
    expect(directives.directives[0].type).to.equal("require");
    expect(directives.directives[0].file).to.equal("src/blah.js");
  });

  it("matches require_tree", function () {
    directives = SprocketsHeaderParser("//= require_tree src");
    expect(directives.directives.length).to.equal(1);
    expect(directives.directives[0].type).to.equal("require_tree")
    expect(directives.directives[0].file).to.equal("src")
  });

  it("matches require_directory", function () {
    directives = SprocketsHeaderParser("//= require_directory src")
    expect(directives.directives.length).to.equal(1);
    expect(directives.directives[0].type).to.equal("require_directory")
    expect(directives.directives[0].file).to.equal("src")
  });

  it("doesn’t match \"var x = require(blah)\"", function () {
    directives = SprocketsHeaderParser("var x = require(\"fakemod\")")
    expect(directives.directives.length).to.equal(0);
  });

  it("matches relative requires", function () {
    directives = SprocketsHeaderParser("//= require ../src/blah.js")
    expect(directives.directives.length).to.equal(1);
    expect(directives.directives[0].type).to.equal("require")
    expect(directives.directives[0].file).to.equal("../src/blah.js")
  });

  it("matches `require_self` directive", function () {
    directives = SprocketsHeaderParser("//= require_self ../src/blah.js")
    expect(directives.directives.length).to.equal(1);
    expect(directives.directives[0].type).to.equal("require_self")
    expect(directives.directives[0].file).to.equal("../src/blah.js")
  });
});