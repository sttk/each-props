'use strict';

var expect = require('chai').expect;
var objectAssign = require('object-assign');

var eachProps = require('..');

function logger(value, keyChain, nodeInfo) {
  var log = objectAssign({}, nodeInfo);
  delete log.parent;
  delete log.sort;
  delete log.return;
  log.keyChain = keyChain;
  this.push(log);

  if (nodeInfo.return) {
    return nodeInfo.return(keyChain);
  }
}

/* eslint max-statements: "off", branch-style: "off" */

describe('Processing test', function() {

  it('Should succeed when an input object is single depth', function(done) {
    var logs = [];

    var obj = { a: 1, b: 2, c: 3 };
    eachProps(obj, logger.bind(logs));

    expect(logs).to.deep.equal([
      { keyChain: 'a', index: 0, count: 3, depth: 1 },
      { keyChain: 'b', index: 1, count: 3, depth: 1 },
      { keyChain: 'c', index: 2, count: 3, depth: 1 },
    ]);
    done();
  });

  it('Should succeed when an input object is multiple depth', function(done) {
    var logs = [];

    var obj = { a: 1, b: { c: 'C', d: 'D', e: { f: 'F', g: 'G' } } };
    eachProps(obj, logger.bind(logs));

    expect(logs).to.deep.equal([
      { keyChain: 'a', index: 0, count: 2, depth: 1 },
      { keyChain: 'b', index: 1, count: 2, depth: 1 },
      { keyChain: 'b.c', index: 0, count: 3, depth: 2 },
      { keyChain: 'b.d', index: 1, count: 3, depth: 2 },
      { keyChain: 'b.e', index: 2, count: 3, depth: 2 },
      { keyChain: 'b.e.f', index: 0, count: 2, depth: 3 },
      { keyChain: 'b.e.g', index: 1, count: 2, depth: 3 },
    ]);
    done();
  });

  it('Should sort properties when a sort function is specified',
  function(done) {
    var logs = [];

    var obj = { q: 1, w: 2, e: 3, r: 4, t: 5, y: 6 };
    var opts = {
      sort: function(arr) {
        return arr.sort();
      },
    };
    eachProps(obj, logger.bind(logs), opts);

    expect(logs).to.deep.equal([
      { keyChain: 'e', index: 0, count: 6, depth: 1 },
      { keyChain: 'q', index: 1, count: 6, depth: 1 },
      { keyChain: 'r', index: 2, count: 6, depth: 1 },
      { keyChain: 't', index: 3, count: 6, depth: 1 },
      { keyChain: 'w', index: 4, count: 6, depth: 1 },
      { keyChain: 'y', index: 5, count: 6, depth: 1 },
    ]);
    done();
  });

  it('Should sort properties when an input object is multiple depth and' +
     '\n\ta sort function is specified', function(done) {
    var logs = [];

    var obj = { z: 1, x: { c: 'C', v: 'D', b: { n: 'F', m: 'G' } } };
    var opts = {
      sort: function(arr) {
        return arr.sort();
      },
    };
    eachProps(obj, logger.bind(logs), opts);

    expect(logs).to.deep.equal([
      { keyChain: 'x', index: 0, count: 2, depth: 1 },
      { keyChain: 'x.b', index: 0, count: 3, depth: 2 },
      { keyChain: 'x.b.m', index: 0, count: 2, depth: 3 },
      { keyChain: 'x.b.n', index: 1, count: 2, depth: 3 },
      { keyChain: 'x.c', index: 1, count: 3, depth: 2 },
      { keyChain: 'x.v', index: 2, count: 3, depth: 2 },
      { keyChain: 'z', index: 1, count: 2, depth: 1 },
    ]);
    done();
  });

  it('Should Stop digging when the return value is true', function(done) {
    var logs = [];

    var obj = { z: 1, x: { c: 'C', v: 'D', b: { n: 'F', m: 'G' }, a: 'H' } };
    var opts = {
      sort: function(arr) {
        return arr.sort();
      },
      return: function(keyChain) {
        return (keyChain === 'x.b');
      },
    };
    eachProps(obj, logger.bind(logs), opts);

    expect(logs).to.deep.equal([
      { keyChain: 'x', index: 0, count: 2, depth: 1 },
      { keyChain: 'x.a', index: 0, count: 4, depth: 2 },
      { keyChain: 'x.b', index: 1, count: 4, depth: 2 },
      { keyChain: 'x.c', index: 2, count: 4, depth: 2 },
      { keyChain: 'x.v', index: 3, count: 4, depth: 2 },
      { keyChain: 'z', index: 1, count: 2, depth: 1 },
    ]);
    done();
  });

  it('Should pass properties in opts to all nodes', function(done) {
    var logs = [];

    var obj = { z: 1, x: { c: 'C', v: 'D', b: { n: 'F', m: 'G' } } };
    var opts = {
      sort: function(arr) {
        return arr.sort();
      },
      m: 'ABC',
      n: 9,
    };
    eachProps(obj, logger.bind(logs), opts);

    expect(logs).to.deep.equal([
      { keyChain: 'x', index: 0, count: 2, depth: 1, m: 'ABC', n: 9 },
      { keyChain: 'x.b', index: 0, count: 3, depth: 2, m: 'ABC', n: 9 },
      { keyChain: 'x.b.m', index: 0, count: 2, depth: 3, m: 'ABC', n: 9 },
      { keyChain: 'x.b.n', index: 1, count: 2, depth: 3, m: 'ABC', n: 9 },
      { keyChain: 'x.c', index: 1, count: 3, depth: 2, m: 'ABC', n: 9 },
      { keyChain: 'x.v', index: 2, count: 3, depth: 2, m: 'ABC', n: 9 },
      { keyChain: 'z', index: 1, count: 2, depth: 1, m: 'ABC', n: 9 },
    ]);
    done();
  });

});
