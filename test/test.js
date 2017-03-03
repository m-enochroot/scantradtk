import chai from 'chai';

import sinon from 'sinon';
import mockery from 'mockery';

import fs from 'fs';

import nock from 'nock';

chai.should();

var assert = chai.assert;
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var scantradtk;

var shouldFetchResources = true;

var shouldNotFetchResources = !shouldFetchResources;

var schemes = require('../data/test/schemes.json');
var data = require('../data/test/data.json');


describe('create resource list', function () {

  this.timeout(20000);

  before(function () {

    scantradtk = require('../dist');

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

  it('should create the resource list using scheme definition', function () {

    var test1 = scantradtk.createResourceList(schemes.scheme1, data.data1, shouldNotFetchResources)
      .then(function (result) {
        expect(result).to.be.an('Array');
        expect(result).to.have.length(81);
        expect(result[0]).to.have.property('name', 'C301-000.jpg');
        expect(result[0]).to.have.property('url', 'http://toto.co/mangas/gantz/301/00.jpg');
        expect(result[51]).to.have.property('name', 'C301-051.jpg');
        expect(result[51]).to.have.property('url', 'http://toto.co/mangas/gantz/301/51.jpg');
      }).catch(function (error) {
        throw error;
      });

    var test2 = scantradtk.createResourceList(schemes.scheme1, data.data2, shouldNotFetchResources)
      .then(function (result) {
        expect(result).to.be.an('Array');
        expect(result).to.have.length(105);
        expect(result[0]).to.have.property('name', 'C021-005.jpg');
        expect(result[0]).to.have.property('url', 'http://toto.co/mangas/gantz/21/05.jpg');
        expect(result[72]).to.have.property('name', 'C093-005.jpg');
        expect(result[72]).to.have.property('url', 'http://toto.co/mangas/gantz/93/05.jpg');
      });

    return Promise.all([test1, test2]);

  });

  it('should report an error of counter are not defined in data', function () {
    return scantradtk.createResourceList(schemes.scheme1, data.dataError1, shouldNotFetchResources)
      .then(function (result) {
        expect(result).to.be.an('Array');
        expect(result).to.have.length(0);
      });

  });

  it('should evaluate to undefined of type of parameter is unknown', function () {

    return scantradtk.createResourceList(schemes.schemeError1, data.data1, shouldNotFetchResources)
      .then(function (result) {
        expect(result).to.be.an('Array');
        expect(result).to.have.length(81);
        expect(result[0]).to.have.property('name', 'C301-000.jpg');
        expect(result[0]).to.have.property('url', 'http://lel-scan.co/mangas/-undef-/301/00.jpg?v=f');
      });

  });

});

describe('module', function () {

  before(function (done) {

    nock('http://toto.co')
      .head(/\/mangas\/gantz\/301\/[0-9]{2}\.jpg/)
      .times(20)
      .reply(200);

    nock('http://toto.co')
      .head(/\/mangas\/gantz\/301\/[0-9]{2}\.jpg/)
      .times(61)
      .reply(404);

    scantradtk = require('../dist');
    done();
  });

  it('should create the resource list depending on resource availability', function () {


    return scantradtk.createResourceList(schemes.scheme1, data.data1, shouldFetchResources)
      .then(function (result) {

        expect(result).to.be.an('Array');
        expect(result).to.have.length(81);
        expect(result[0]).to.have.property('name', 'C301-000.jpg');
        expect(result[0]).to.have.property('url', 'http://toto.co/mangas/gantz/301/00.jpg');
        expect(result[51]).to.have.property('url', undefined);

      });

  });

});


describe('module', function () {

  before(function (done) {

    nock('http://toto.co')
      .head(/\/mangas\/gantz\/301\/[0-9]{2}\.jpg/)
      .times(20)
      .reply(200);

    nock('http://toto.co')
      .head(/\/mangas\/gantz\/301\/[0-9]{2}\.jpg/)
      .replyWithError('unable to contact server');

    nock('http://toto.co')
      .head(/\/mangas\/gantz\/301\/[0-9]{2}\.jpg/)
      .times(60)
      .reply(404);

    scantradtk = require('../dist');
    done();
  });

  it('should create the resource list depending on resource availability in case of unavailability', function () {


    return scantradtk.createResourceList(schemes.scheme1, data.data1, shouldFetchResources)
      .then(function (/* result */) {
        // Make any test

      });
  });

});


describe('module', function () {


  before(function () {

    scantradtk = require('../dist');

  });


  it('shall manage scheme registration', function () {

    scantradtk.registerScheme('scheme1', schemes.scheme1);

  });


  it('shall manage scheme unregistration', function () {

    scantradtk.registerScheme('scheme1', schemes.scheme1);

    scantradtk.unregisterScheme('scheme1');

  });


});


describe('module', function () {

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


    scantradtk = require('../dist');

  });

  after(function (){
    mockery.disable();
  });

  var resources = [
    { name: 'README.md', url: 'http://toto.fr/mangas/T01.jpg' },
    { name: 'README2.md', url: undefined }
  ];

  it('should create the cbz archive', function () {

    var result1 = scantradtk.createTargetArchive([], 'cbz', { filename: 'T01' });
    var result2 = scantradtk.createTargetArchive(resources, 'cbz', { filename: 'T02' });

    return Promise.all([result1.promise, result2.promise]);
  });


  it('should manage bad target selection', function () {

    var result = scantradtk.createTargetArchive(resources, 'fake', { filename: 'T02' });

    return expect(result).to.be.rejectedWith('bad target: fake');

  });

  it('should manage zip error', function () {

    var result = scantradtk._createCBZArchive(resources, 'cbz', { filename: 'T02' });

    result.archive.emit('error', 'fake error');

    return expect(result.promise).to.be.rejectedWith('fake error');

  });

});
