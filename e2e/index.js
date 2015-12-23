/*eslint-disable no-console */


describe('scantradtk', function () {

  var scantradtk;

  before(function () {

    scantradtk = require('../lib');

  });

  it('should create specified volume cbz file', function () {

    console.log('create CBZ');
    var chapter301 = {
      title: 'shingeki-no-kyojin',
      chapter: 76,
      page: {
        min: 0,
        max: 80
      }
    };

    var scheme = scantradtk.schemes['lel-scan.co'];

    var resources = scantradtk.createResourceList(scheme, chapter301);

    console.log(resources);

    return scantradtk.createTargetArchive(resources, 'cbz', { filename: 'AOT-C076' });

  });

});
