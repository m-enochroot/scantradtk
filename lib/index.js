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

var lApplyFormatingRules = function (value, rule) {

  var result = value;

  if (rule === 'fixed2') {
    result = '000' + result;
    result = result.slice(-2);
  } else if (rule === 'fixed3') {
    result = '000' + result;
    result = result.slice(-3);
  }

  return result;
};


var lGetPageUrl = function (spec, title, chapter, page) {

  // # Manage rules on chapter
  var chapterCode = lApplyFormatingRules(chapter, spec.chapterRule);

  // # Manage rules on page
  var pageCode = lApplyFormatingRules(page, spec.pageRule);

  var values = {
    extension: spec.extension,
    title: title,
    chapter: chapterCode,
    page: pageCode
  };

  var pageUrl = tpl(spec.pageURL, values);

  return pageUrl;
};


export default {

  configuration: {
    PAGE_BEGIN: PAGE_BEGIN,
    PAGE_END: PAGE_END
  },

  applyFormatingRules: function (value, rule) {
    return lApplyFormatingRules(value, rule);
  },


  getPageUrl: function (spec, title, chapter, page) {
    return lGetPageUrl(spec, title, chapter, page);
  },

  createPagesList: function (specification, title, volumes) {
    var result = {};

    // # For each Volumes
    Object.keys(volumes).forEach(volume => {
      let chapters = volumes[volume];
      // ## Append page list
      var pageList = {};

      // ## For each chapter of the volume
      for (var chapter = chapters.begin; chapter <= chapters.end; chapter++) {

        // ### For each page
        for (var page = PAGE_BEGIN; page < PAGE_END; page++) {

          // #### compute the url of the image
          var pageUrl = lGetPageUrl(specification, title, chapter, page);

          // #### Compute the name of the image local file
          var chapterString = lApplyFormatingRules(chapter, 'fixed3');
          var pageString = lApplyFormatingRules(page, 'fixed3');
          var fileName = volume + '-C' + chapterString + '-P' + pageString + '.' + specification.extension;
          pageList[pageUrl] = fileName;
        }
      }

      result[volume] = pageList;

    });

    return result;
  },


  createCbz: function (volume, pageList) {

    var output = fs.createWriteStream('./' + volume + '.cbz');
    var archive = archiver('zip');
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', function (err) {
      console.log('Zip error on volume: ./' + volume + '.cbz - ' + err);
    });

    archive.pipe(output);

    Object.keys(pageList).forEach(page => {
      archive.append(request(page), {name: pageList[page]});
    });

    archive.finalize();

    return archive;
  }

};
