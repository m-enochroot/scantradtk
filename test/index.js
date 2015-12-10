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


  it('should create apply the formating rule', function () {

    var result = scantradtk.applyFormatingRules(5, 'fixed3');

    assert.equal(typeof result, 'string', 'Result has to be a string');
    assert.equal(result, '005');

    assert.equal(scantradtk.applyFormatingRules(123, 'fixed3'), '123');
    assert.equal(scantradtk.applyFormatingRules(1234, 'fixed3'), '234');
    assert.equal(scantradtk.applyFormatingRules(6, 'fixed3'), '006');
    assert.equal(scantradtk.applyFormatingRules(12, 'fixed3'), '012');


    assert.equal(scantradtk.applyFormatingRules(123, 'fixed2'), '23');
    assert.equal(scantradtk.applyFormatingRules(1234, 'fixed2'), '34');
    assert.equal(scantradtk.applyFormatingRules(6, 'fixed2'), '06');
    assert.equal(scantradtk.applyFormatingRules(12, 'fixed2'), '12');


    assert.equal(scantradtk.applyFormatingRules(123, 'none'), '123');
    assert.equal(scantradtk.applyFormatingRules(1234, 'none'), '1234');
    assert.equal(scantradtk.applyFormatingRules(6, 'none'), '6');
    assert.equal(scantradtk.applyFormatingRules(12, 'none'), '12');

  });


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
