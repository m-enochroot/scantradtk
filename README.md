# scantradtk [![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/m-enochroot/scantradtk.svg?branch=master)](https://travis-ci.org/m-enochroot/scantradtk) [![Coverage Status](https://coveralls.io/repos/m-enochroot/scantradtk/badge.svg?branch=master&service=github)](https://coveralls.io/github/m-enochroot/scantradtk?branch=master) [![Dependency Status](https://david-dm.org/m-enochroot/scantradtk.svg)](https://david-dm.org/m-enochroot/scantradtk)
> Tools to manage scantrad

## Installation

```sh
$ npm install --save scantradtk
```

## Usage

To download a chapter use the following 

```js
var scantradtk = require('scantradtk');

// Create cbz archive for chapter 66 of the manga Shingeki no Kyojin from the web site lel-scan.co
scantradtk.createCbz('lel-scan.co', 'shingeki-no-kyojin', 66);
```
## License

MIT © [Enoch Root]()


[npm-image]: https://badge.fury.io/js/scantradtk.svg
[npm-url]: https://npmjs.org/package/scantradtk
[travis-image]: https://travis-ci.org//scantradtk.svg?branch=master
[travis-url]: https://travis-ci.org//scantradtk
[daviddm-image]: https://david-dm.org//scantradtk.svg?theme=shields.io
[daviddm-url]: https://david-dm.org//scantradtk
