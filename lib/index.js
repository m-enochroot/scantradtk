/*eslint-disable no-console */
var fs = require('fs');
var archiver = require('archiver');
var request = require('request');
var tpl = require('underscore-tpl');

var PAGE_BEGIN = 0;
var PAGE_END = 100;


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

  configuration: {
    PAGE_BEGIN: PAGE_BEGIN,
    PAGE_END: PAGE_END
  },

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
            url: 'none',
            target: 'fixed3'
          }
        }
      }
    }
  },
/*
  createCbz: function (site, manga, target) {

    var promises = [];

    if (typeof target === 'number') {

      console.log('chapter');

      let spec = this.specifications[site];
      console.log(spec);
      if (spec !== undefined) {
        // # We create the archive for a chapter
        let chapter = target;
        let cbz = manga + '-C' + lApplyFormatingRules(`{chapter}`, 'fixed3');
        let pageList = lCreatePagesList(spec, manga, { T01: { begin: chapter, end: chapter}});
        let promise = this.createVolumeCbz(cbz, pageList);
        promises.add(promise);
      }

    } else {

      console.log('volumes');


      let pageList = lCreatePagesList({}, manga, target);
      Object.keys(pageList, volume => {
        let cbz = manga + '-' + volume;
        let promise = this.createVolumeCbz(cbz, pageList[volume]);
        promises.add(promise);
      });

    }

    console.log(promises);
    return Promise.all(promises);

  },


  createVolumeCbz: function (volume, pageList) {

    var output = fs.createWriteStream('./' + volume + '.cbz');
    var archive = archiver('zip');
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });


    archive.pipe(output);

    Object.keys(pageList).forEach(page => {
      archive.append(request(page), {name: pageList[page]});
    });

    archive.finalize();

    return {
      promise: new Promise(function (resolve, reject){
        archive.on('end', function () {
          resolve();
        });
        archive.on('error', function (err) {
          console.log('Zip error on volume: ./' + volume + '.cbz - ' + err);
          reject(err);
        });

      }),
      archive: archive
    };

  },
*/

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
    var resource = tpl(resourcePattern, values);

    return resource;
  },

  createResourceList: function(scheme, data) {

    var resourceList = { };

    // # We look for counter range
    var primaryRange = this._getCounterRange(scheme.counters.primary, data);
    var secondaryRange = this._getCounterRange(scheme.counters.secondary, data);

    primaryRange.forEach(function (primaryIndex) {
      secondaryRange.forEach(function (secondaryIndex) {
        var url = this._getResourceFor('url', scheme, data, [primaryIndex, secondaryIndex]);
        var target = this._getResourceFor('target', scheme, data, [primaryIndex, secondaryIndex]);
        resourceList[target] = url;
      }, this);
    }, this);

    return resourceList;
  },

  _createCBZArchive(resources, parameters) {
    var filename = parameters.filename;

    var output = fs.createWriteStream('./' + filename + '.cbz');
    var archive = archiver('zip');
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });


    archive.pipe(output);

    Object.keys(resources).forEach(resource => {
      archive.append(request(resources[resource]), { name: resource });
    });

    archive.finalize();

    return {
      promise: new Promise(function (resolve, reject){
        archive.on('end', function () {
          resolve();
        });
        archive.on('error', function (err) {
          console.log('Zip error on volume: ./' + filename + '.cbz - ' + err);
          reject(err);
        });

      }),
      archive: archive
    };

  },

  createTargetArchive: function (resources, target, parameters) {
    var result;
    if (target === 'cbz') {
      result = this._createCBZArchive(resources, parameters);
    }
    return result;
  }

};
