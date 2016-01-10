/* global describe, it, before, beforeEach */
'use strict';
var os = require('os');
var path = require('path');
var fs = require('fs');
var assert = require('yeoman-assert');
var nock = require('nock');
var tmp = path.join(os.tmpdir(), 'yeoman-remote');
var remote = require('..');

describe('remote()', function () {
  beforeEach(function () {
    nock('https://github.com')
      .get('/yeoman/generator/archive/master.tar.gz')
      .replyWithFile(200, path.join(__dirname, 'fixtures/testRemoteFile.tar.gz'));
  });

  it('remotely fetch a package on github', function (done) {
    remote('yeoman', 'generator', done);
  });

  it('cache the result internally into a `_cache` folder', function (done) {
    remote('yeoman', 'generator', function () {
      fs.stat(path.join(remote.cacheRoot(), 'yeoman/generator/master'), done);
    });
  });

  it('invoke `cb` with a cachePath', function (done) {
    remote('yeoman', 'generator', function (err, cachePath) {
      if (err) {
        done(err);
        return;
      }

      assert.equal(
        path.join(remote.cacheRoot(), 'yeoman/generator/master'),
        cachePath
      );
      done();
    });
  });
});

describe('remote.extract()', function () {
  it('download and untar via the NPM download package', function (done) {
    var scope = nock('http://example.com')
      .get('/f.tar.gz')
      .replyWithFile(200, path.join(__dirname, 'fixtures/testFile.tar.gz'));

    remote.extract('http://example.com/f.tar.gz', tmp, function (err) {
      if (err) {
        done(err);
        return;
      }

      assert.noFile(path.join(tmp, 'f.tar.gz'));
      assert(scope.isDone());
      done();
    });
  });
});

describe('remote.fetch()', function () {
  it('allow the fetching of a single file', function (done) {
    var scope = nock('http://example.com')
      .get('/f.txt')
      .replyWithFile(200, path.join(__dirname, 'fixtures/help.txt'));

    remote.fetch('http://example.com/f.txt', tmp, function (err) {
      if (err) {
        done(err);
        return;
      }

      assert(scope.isDone());
      fs.stat(path.join(tmp, 'f.txt'), done);
    });
  });
});
