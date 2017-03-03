/*eslint-disable no-console */


describe('scantradtk', function () {

  var scantradtk;

  this.timeout(2000000);

  before(function () {

    scantradtk = require('../lib');

  });

  it('should create specified volume cbz file', function () {

    var volume = {
      title: 'shingeki no kyojin - before the fall',
      chapter: {
        min: 0,
        max: 0
      },
      page: {
        min: 0,
        max: 80
      }
    };

    var scheme = scantradtk.schemes['www.scanenligne.com'];


    return scantradtk.createResourceList(scheme, volume, true).then(function (resources) {
      return scantradtk.createTargetArchive(resources, 'cbz', { filename: 'BtF-T01' });
    });

  });

});
