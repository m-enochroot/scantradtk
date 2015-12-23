import chai from 'chai';

import sinon from 'sinon';
import mockery from 'mockery';

import fs from 'fs';

chai.should();

var assert = chai.assert;
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var scantradtk;

/*
describe('scantradtk', function () {

  var requestStub;

  before(function () {

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: false
    });


    requestStub = sinon.stub().returns(fs.createReadStream('README.md'));

    // replace the module `request` with a stub object
    mockery.registerMock('request', requestStub);


    scantradtk = require('../lib');

  });

  after(function (){
    mockery.disable();
  });

  var specification1 = {
    extension: 'jpg',
    pageURL: 'http://site.net/mangas/${title}/${chapter}/${page}.${extension}?v=f',
    chapterRule: 'none',
    pageRule: 'fixed2'
  };

  var volumes1 = {
    T01: {
      begin: 4,
      end: 8
    },
    T02: {
      begin: 9,
      end: 9
    }
  };

*/

/*
  it('should create correctly the targets page url', function () {

    var pageUrl = scantradtk.getPageUrl(specification1, 'mangaTitle', 3, 4);

    assert.equal(typeof pageUrl, 'string', 'Page URL has to be a string');
    assert.equal(pageUrl, 'http://site.net/mangas/mangaTitle/3/04.jpg?v=f');

  });


  it('should create correctly the list of page', function () {

    var urlList = scantradtk.createPagesList(specification1, 'mangaTitle', volumes1);

    assert.equal(typeof urlList, 'object', 'Volume list has to be an array');
    assert.equal(Object.keys(urlList).length, 2, 'Volume list has to have two entry for both requested volumes');
    assert.notEqual(urlList.T01, undefined, 'Volume list has to have one entry for T01 volume');

    var volumeList = urlList.T01;
    assert.equal(typeof volumeList, 'object', 'Pages list has to be an array');
    let nbPages = scantradtk.configuration.PAGE_END - scantradtk.configuration.PAGE_BEGIN;
    assert.equal(Object.keys(volumeList).length, (8 - 4 + 1) * nbPages, 'All pages url have to be generated');
    assert.notEqual(volumeList['http://site.net/mangas/mangaTitle/5/02.jpg?v=f'], undefined, 'page URL for chapter 5, page 2 has to be created correctly');
    assert.equal(volumeList['http://site.net/mangas/mangaTitle/5/02.jpg?v=f'], 'T01-C005-P002.jpg', 'Page 2 for chapter 5 has to have a correct entryname');

  });

  it('should create the cbz archive', function () {

    var result1 = scantradtk.createVolumeCbz('T01', { });

    var result2 = scantradtk.createVolumeCbz('T01', { 'http://toto.fr/mangas/T01.jpg': 'README.md'});

    return Promise.all([result1.promise, result2.promise]);
  });

});

describe('scantradtk zip error', function () {

  before(function () {

    scantradtk = require('../lib');

  });

  it('should manage zip error', function () {

    var result = scantradtk.createVolumeCbz('T02', {'http://toto.fr/mangas/T01.jpg': 'README.md'});

    result.archive.emit('error', 'fake error');

    return expect(result.promise).to.be.rejectedWith('fake error');

  });
});

*/

describe('create resource list', function () {

  before(function () {

    scantradtk = require('../lib');

  });

  it('should create apply the formating rule', function () {

    var result = scantradtk._applyFilter(5, 'fixed3');

    assert.equal(typeof result, 'string', 'Result has to be a string');
    assert.equal(result, '005');

    assert.equal(scantradtk._applyFilter(123, 'fixed3'), '123');
    assert.equal(scantradtk._applyFilter(1234, 'fixed3'), '234');
    assert.equal(scantradtk._applyFilter(6, 'fixed3'), '006');
    assert.equal(scantradtk._applyFilter(12, 'fixed3'), '012');


    assert.equal(scantradtk._applyFilter(123, 'fixed2'), '23');
    assert.equal(scantradtk._applyFilter(1234, 'fixed2'), '34');
    assert.equal(scantradtk._applyFilter(6, 'fixed2'), '06');
    assert.equal(scantradtk._applyFilter(12, 'fixed2'), '12');


    assert.equal(scantradtk._applyFilter(123, 'none'), '123');
    assert.equal(scantradtk._applyFilter(1234, 'none'), '1234');
    assert.equal(scantradtk._applyFilter(6, 'none'), '6');
    assert.equal(scantradtk._applyFilter(12, 'none'), '12');

  });

  var scheme1 = {
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
  };


  var schemeError1 = {
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
        type: 'toto'
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
  };

  var data1 = {
    title: 'gantz',
    chapter: 301,
    page: {
      min: 0,
      max: 80
    }
  };


  var data2 = {
    title: 'gantz',
    chapter: {
      min: 21,
      max: 125
    },
    page: 5
  };

  var dataError1 = {
    title: 'gantz',
    page: 5
  };

  it('should create the resource list using scheme definition', function () {

    var result = scantradtk.createResourceList(scheme1, data1);
    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length(81);
    expect(result).to.have.any.keys('C301-000.jpg', 'C301-051.jpg');
    expect(result).to.have.property('C301-000.jpg', 'http://lel-scan.co/mangas/gantz/301/00.jpg?v=f');

    result = scantradtk.createResourceList(scheme1, data2);
    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length(105);
    expect(result).to.have.any.keys('C021-005.jpg', 'C125-005.jpg', 'C098-005.jpg');
    expect(result).to.have.property('C098-005.jpg', 'http://lel-scan.co/mangas/gantz/98/05.jpg?v=f');
  });

  it('should report an error of counter are not defined in data', function () {
    var result = scantradtk.createResourceList(scheme1, dataError1);
    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length(0);

  });

  it('should evaluate to undefined of type of parameter is unknown', function () {

    var result = scantradtk.createResourceList(schemeError1, data1);
    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length(81);
    expect(result).to.have.any.keys('C301-000.jpg', 'C301-051.jpg');
    expect(result).to.have.property('C301-000.jpg', 'http://lel-scan.co/mangas/-undef-/301/00.jpg?v=f');

  });

});

describe('create resource list', function () {

  var requestStub;

  before(function () {

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: false
    });


    requestStub = sinon.stub().returns(fs.createReadStream('README.md'));

    // replace the module `request` with a stub object
    mockery.registerMock('request', requestStub);


    scantradtk = require('../lib');

  });

  after(function (){
    mockery.disable();
  });

  it('should create the cbz archive', function () {

    var result1 = scantradtk.createTargetArchive({ }, 'cbz', { filename: 'T01' });
    var result2 = scantradtk.createTargetArchive({ 'README.md': 'http://toto.fr/mangas/T01.jpg' }, 'cbz', { filename: 'T02' });

    return Promise.all([result1.promise, result2.promise]);
  });

});


describe('createTargetArchive ', function () {

  before(function () {

    scantradtk = require('../lib');

  });

  it('should manage zip error', function () {

    var result = scantradtk.createTargetArchive({ 'README.md': 'http://toto.fr/mangas/T01.jpg' }, 'cbz', { filename: 'T02' });

    result.archive.emit('error', 'fake error');

    return expect(result.promise).to.be.rejectedWith('fake error');

  });

});

