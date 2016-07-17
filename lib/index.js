'use strict';
var fs = require('fs');
var path = require('path');
var _s = require('underscore.string');
var rimraf = require('rimraf');
var Download = require('download');
var xdgBasedir = require('xdg-basedir');

/**
 * Remotely fetch a package from github (or an archive), store this into a _cache
 * folder, and provide a "remote" object as a facade API to ourself (part of
 * generator API, copy, template, directory). It's possible to remove local cache,
 * and force a new remote fetch of the package.
 *
 * ### Examples:
 *
 *     remote('yeoman', 'yeoman-remote', function(err, extractPath) {
 *       fs.readFileSync(path.join(extractPath, 'README.txt'), 'utf8');
 *     });
 *
 *     remote('yeoman', 'yeoman-remote', 'master', function(err, extractPath) {
 *       fs.readFileSync(path.join(extractPath, 'README.txt'), 'utf8');
 *     });
 *
 *     remote('http://foo.com/bar.zip', function(err, extractPath) {
 *       fs.readFileSync(path.join(extractPath, 'README.txt'), 'utf8');
 *     });
 *
 * When fetching from Github
 * @param {String} username
 * @param {String} repo
 * @param {String} branch
 * @param {Function} cb
 * @param {Boolean} refresh
 *
 * @also
 * When fetching an archive
 * @param {String} url
 * @param {Function} cb
 * @param {Boolean} refresh
 */

var remote = module.exports = function () {
  var username;
  var repo;
  var branch;
  var cb;
  var refresh;
  var url;
  var cache;

  if (arguments.length <= 3 && typeof arguments[2] !== 'function') {
    url = arguments[0];
    cb = arguments[1];
    refresh = arguments[2];
    cache = path.join(remote.cacheRoot(), _s.slugify(url));
  } else {
    username = arguments[0];
    repo = arguments[1];
    branch = arguments[2];
    cb = arguments[3];
    refresh = arguments[4];

    if (!cb) {
      cb = branch;
      branch = 'master';
    }

    cache = path.join(remote.cacheRoot(), username, repo, branch);
    url = 'https://github.com/' + [username, repo, 'archive', branch].join('/') + '.tar.gz';
  }

  var done = function (err) {
    if (err) {
      cb(err);
      return;
    }

    cb(null, cache);
  };

  fs.stat(cache, function (err) {
    // already cached
    if (err) {
      remote.extract(url, cache, {strip: 1}, done);
      return;
    }

    // no refresh, so we can use this cache
    if (!refresh) {
      done();
      return;
    }

    // otherwise, we need to remove it, to fetch it again
    rimraf(cache, function (err) {
      if (err) {
        cb(err);
        return;
      }

      remote.extract(url, cache, {strip: 1}, done);
    });
  });

  return this;
};

/**
 * Stores and return the cache root for this class. The cache root is used to
 * `git clone` repositories from github by `.remote()` for example.
 */

remote.cacheRoot = function cacheRoot() {
  return path.join(xdgBasedir.cache, 'node-yeoman-remote-cache');
};

/**
 * Download a file to a given destination.
 *
 * @param {String} url
 * @param {String} destination
 * @param {Function} cb
 */

remote.fetch = function _fetch(url, destination, cb) {
  var download = new Download()
    .get(url)
    .dest(destination);

  download.run(function (err) {
    if (err) {
      cb(err);
      return;
    }

    cb();
  });
};

/**
 * Fetch an archive and extract it to a given destination.
 *
 * @param {String} archive
 * @param {String} destination
 * @param {Object} opts
 * @param {Function} cb
 */

remote.extract = function _extract(archive, destination, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {extract: true};
  }

  opts = Object.assign({extract: true}, opts);

  var download = new Download(opts)
    .get(archive)
    .dest(destination);

  download.run(function (err) {
    if (err) {
      cb(err);
      return;
    }

    cb();
  });
};
