/*eslint-disable no-console */
var fs = require('fs');
var archiver = require('archiver');
var request = require('request');
var tpl = require('underscore-tpl');


/**
 * Module
 * 1. Creation d'une liste de volume, incluant des pages
 *    { vol01: [ { url: pageName } , ... ] }
 * 2. Outil de construction à partir de la liste des pages
 *
 * La construction de la liste est réalisée à partir d'une specification json:
 *  input : site + manga + { vol01: { begin: firstChapter, end:finalChapter }, vol02: { ... } }
 *  site => algorithme de construction de l'URL des pages
 *  { lel-scan.co: {
 *    extension: 'jpg',
 *    pageURL: `http://lel-scan.co/mangas/${title}/${chapter}/${page}.${extension}?v=f`,
 *    chapterRule: 'none',
 *    pageRule: 'fixed2'
 *  }
 *  Chaque site à une fonction de construction différente:
 *  f(chapter, page) => url
 *  Le nom de fichier est toujours le même : Vnn-Cnnn-Pnn
 *  L'extension dépend des règles du site : jpg ou png
 */

export default {

  schemes: {
    'lel-scan.co': {
      patterns: {
        url: 'http://lel-scan.co/mangas/${title}/${chapter}/${page}.jpg?v=f',
        target: 'C${chapter}-${page}.jpg'
      },
      counters: {
        primary: 'chapter',
        secondary: 'page'
      },
      parameters: {
        title: {
          description: 'manga title',
          type: 'string'
        },
        chapter: {
          description: 'manga Chapter',
          type: 'primary',
          filter: {
            url: 'none',
            target: 'fixed3'
          }
        },
        page: {
          description: 'Page of the current working chapter',
          type: 'secondary',
          filter: {
            url: 'fixed2',
            target: 'fixed3'
          }
        }
      }
    }
  },

  _applyFilter: function (value, rule) {

    var result = value;
    if (rule === 'fixed2') {
      result = '000' + result;
      result = result.slice(-2);
    } else if (rule === 'fixed3') {
      result = '000' + result;
      result = result.slice(-3);
    }

    return result;
  },

  _getCounterRange: function (counter, data) {
    var range = [];
    if (data[counter] !== undefined) {
      var dataRange = data[counter];
      if (typeof dataRange === 'number') {
        range.push(dataRange);
      } else {
        for (var i = dataRange.min; i <= dataRange.max; i++) {
          range.push(i);
        }
      }
    } else {
      console.error(counter + ' counter parameter not defined in data');
    }
    return range;
  },

  _getResourceFor: function (pattern, scheme, data, indexes) {

    // # Get values to be inserted
    var values = { };
    Object.keys(scheme.parameters).forEach(function (parameterName) {
      var parameter = scheme.parameters[parameterName];
      // ## Get brut value
      var value;
      switch (parameter.type) {
      case 'string':
        value = data[parameterName];
        break;
      case 'primary':
        value = indexes[0];
        break;
      case 'secondary':
        value = indexes[1];
        break;
      default:
        value = '-undef-';
        break;
      }

      // ## Apply the filter if exists
      if (parameter.filter !== undefined) {
        if (parameter.filter[pattern] !== undefined) {
          value = this._applyFilter(value, parameter.filter[pattern]);
        }
      }

      // ## Bind value to parameter
      values[parameterName] = value;

    }, this);

    // # Get the pattern string
    var resourcePattern = scheme.patterns[pattern];
    // # Apply pattern to values

    return tpl(resourcePattern, values);
  },

  checkUrlAvailibility: function (target, url) {
    return new Promise(function (resolve) {
      request.head(url)
       .on('response', function (response) {
         if (response.statusCode === 200) {
           resolve({name: target, url: url});
         } else {
           resolve({name: target, url: undefined, cause: response.statusCode});
         }
       })
       .on('error', function (err) {
         resolve({name: target, url: undefined, cause: err});
       });
    });
  },

  createResourceList: function (scheme, data, checkAvailibility) {

    var resourcePromises = [];

    // # We look for counter range
    var primaryRange = this._getCounterRange(scheme.counters.primary, data);
    var secondaryRange = this._getCounterRange(scheme.counters.secondary, data);

    primaryRange.forEach(function (primaryIndex) {
      secondaryRange.forEach(function (secondaryIndex) {
        var targetUrl = this._getResourceFor('url', scheme, data, [primaryIndex, secondaryIndex]);
        var target = this._getResourceFor('target', scheme, data, [primaryIndex, secondaryIndex]);
        var urlPromise;
        if (checkAvailibility) {
          urlPromise = this.checkUrlAvailibility(target, targetUrl);

        } else {
          var result = {};
          result[target] = targetUrl;
          urlPromise = Promise.resolve({name: target, url: targetUrl});
        }
        resourcePromises.push(urlPromise);
      }, this);
    }, this);

    return Promise.all(resourcePromises);
  },

  _createCBZArchive: function (resources, parameters) {
    var filename = parameters.filename;

    var output = fs.createWriteStream('./' + filename + '.cbz');
    var archive = archiver('zip');

    archive.pipe(output);

    resources.forEach(resource => {

      if (resource.url !== undefined) {
        archive.append(request.get(resource.url), { name: resource.name });
      }
    });

    archive.finalize();

    return {
      promise: new Promise(function (resolve, reject){
        output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
          resolve();
        });
        archive.on('error', function (err) {
          console.error('Zip error on volume: ./' + filename + '.cbz - ' + err);
          reject(err);
        });

      }),
      archive: archive
    };

  },

  createTargetArchive: function (resources, target, parameters) {
    var result;
    if (target === 'cbz') {
      result = this._createCBZArchive(resources, parameters).promise;
    } else {
      result = Promise.reject('bad target: ' + target);
    }
    return result;
  }

};
