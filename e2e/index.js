/*eslint-disable no-console */


describe('scantradtk', function () {

  var scantradtk;

  this.timeout(360000);

  before(function () {

    scantradtk = require('../lib');

  });

  it('should create specified volume cbz file', function (done) {

    var chapter301 = {
      title: 'shingeki-no-kyojin',
      chapter: 76,
      page: {
        min: 0,
        max: 80
      }
    };

    var scheme = scantradtk.schemes['lel-scan.co'];

    scantradtk.createResourceList(scheme, chapter301, true).then(function (resources) {
      return scantradtk.createTargetArchive(resources, 'cbz', { filename: 'AOT-C076' });
    }).then(function() {
      done();
    }).catch(function (error) {
      console.error(error);
      done();
    });

  });

});
