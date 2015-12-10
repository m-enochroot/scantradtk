/*eslint-disable no-console */


describe('scantradtk', function () {

  /*
  var specification = {
    extension: 'jpg',
    pageURL: 'http://lel-scan.co/mangas/${title}/${chapter}/${page}.${extension}?v=f',
    chapterRule: 'none',
    pageRule: 'fixed2'
  };

  var mangaTitle = 'shingeki-no-kyojin';

  var volumes = {
    T17: {
      begin: 68,
      end: 70
    },
    T18: {
      begin: 71,
      end: 74
    }
  };
*/

  var scantradtk;

  before(function () {

    scantradtk = require('../lib');

  });

  it('should create specified volume cbz file', function () {

    console.log('create CBZ');
    return scantradtk.createCbz('lel-scan.co', 'gantz', 382);

    /*
    var urlList = scantradtk.createPagesList(specification, mangaTitle, volumes);
    scantradtk.createCbz('T17', urlList.T17);
    */

  });

});
