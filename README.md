# yeoman-remote [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> Fetch packages and archives from remote resources with cache support

This package is a simplified export of the `yeoman-generator` `remote`, `fetch` and `extract` functions. Currently, the preferred way is to use `npm` to fetch github resources at install time. We're providing this package to ease transition to newer versions of `yeoman-generator`.

**_Note: This package is not finalized yet. You should be aware that some things might not work properly._**

## Installation

```sh
$ npm install --save yeoman-remote
```

## Usage

```js
var remote = require('yeoman-remote');
var path = require('path');

module.exports = yeoman.Base.extend({
  writing: function () {
    var done = this.async();

    remote('yeoman', 'generator', function (cachePath) {
      this.fs.copy(
        path.join(cachePath, 'lib/index.js'),
        this.destinationPath('lib/index.js')
      );
      done();
    }.bind(this));
  }
})
```

## License

MIT © [The Yeoman Team](http://yeoman.io)


[npm-image]: https://badge.fury.io/js/yeoman-remote.svg
[npm-url]: https://npmjs.org/package/yeoman-remote
[travis-image]: https://travis-ci.org/yeoman/yeoman-remote.svg?branch=master
[travis-url]: https://travis-ci.org/yeoman/yeoman-remote
[daviddm-image]: https://david-dm.org/yeoman/yeoman-remote.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/yeoman/yeoman-remote
[coveralls-image]: https://coveralls.io/repos/yeoman/yeoman-remote/badge.svg
[coveralls-url]: https://coveralls.io/r/yeoman/yeoman-remote
