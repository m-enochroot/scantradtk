# scantradtk [![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/m-enochroot/scantradtk.svg?branch=master)](https://travis-ci.org/m-enochroot/scantradtk) [![Coverage Status](https://coveralls.io/repos/m-enochroot/scantradtk/badge.svg?branch=master&service=github)](https://coveralls.io/github/m-enochroot/scantradtk?branch=master) [![Dependency Status](https://david-dm.org/m-enochroot/scantradtk.svg)](https://david-dm.org/m-enochroot/scantradtk)
> Tools to download some resources from the web using a well known pattern
> For exemple, if you need to download a list of jpeg file that share the same url and are identified with an index:

```js
[http://mywebsite/requestPhoto/01.jpg, http://mywebsite/requestPhoto/02.jpg] 
```

The module use two majors concept
- scheme: used to define the url of resource url construction
- target: used to define the final destination of this archive
  
Scheme is a json object that define some information parameters (optional or mandatory):
- url: a string representing the resource url, it uses placeholder to refer variable data
- extension: file extension, for example jpg for jpeg image file
- parameters: a collection of parameters used on placeholder, formating rules can be defined here
- counters: an arborescence of parameter that behave has iterators to generate the list of resource's url

## Installation

```sh
$ npm install --save scantradtk
```

## Usage

To download a chapter use the following 

```js
var scantradtk = require('scantradtk');

// Add a scheme to download image from lel-scn.co
var lelScheme = {
  extension: 'jpg',
  pattern: {
    url: 'http://lel-scan.co/mangas/${title}/${chapter}/${page}.${extension}?v=f',
    target: 'C${chapter}-${page}.${extension}'
  },
  parameters : {
    title : {
      description: 'manga title'
    }
  },
  counters: [
     {
       'chapter': {
         url: 'none',
         target: 'fixed3'
       }
     },
     {
       'page' : {
         url: 'fixed2',
         target: 'fixed3'
       }
     }
  ]
};
                
scantradtk.registerScheme('lel-scan.co', lelScheme);

// Add a target 
var lelTarget = {
    type: 'zip',
    extension: 'cbz'
  };
  
scantradtk.registerTarget('cbz', lelTarget);

// Donwload data using a specific scheme and target 
var data = {
    title: 'gantz',
    counters: [
      { type: 'value',
        value: 301
      },
      { type: 'interval',
        min:0,
        max:80
      }
    ]
  };
scantradtk.downloadResources('lel-scan.co', 'cbz', data);

```
## License

MIT © [Enoch Root]()


[npm-image]: https://badge.fury.io/js/scantradtk.svg
[npm-url]: https://npmjs.org/package/scantradtk
[travis-image]: https://travis-ci.org//scantradtk.svg?branch=master
[travis-url]: https://travis-ci.org//scantradtk
[daviddm-image]: https://david-dm.org//scantradtk.svg?theme=shields.io
[daviddm-url]: https://david-dm.org//scantradtk
