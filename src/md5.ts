'use strict';
/* istanbul ignore next */
// var crypto = require('crypto');
/* istanbul ignore next */
// var Md5 = require('spark-md5');
/* istanbul ignore next */
// var setImmediateShim = global.setImmediate || global.setTimeout;
/* istanbul ignore next */
// var MD5_CHUNK_SIZE = 32768;

// import * as crypto from 'crypto-browserify';
// import * as crypto from 'crypto';
// import * as Md5 from 'spark-md5';
// import { createHash } from 'crypto-browserify';
import { createHash } from 'crypto';
import Md5 from 'spark-md5';

const setImmediateShim = global.setImmediate || global.setTimeout;
const MD5_CHUNK_SIZE = 32768;

/* istanbul ignore next */
function sliceShim(arrayBuffer, begin, end) {
  if(typeof arrayBuffer.slice === 'function') {
    if(!begin) {
      return arrayBuffer.slice();
    } else if(!end) {
      return arrayBuffer.slice(begin);
    } else {
      return arrayBuffer.slice(begin, end);
    }
  }
  //
  // shim for IE courtesy of http://stackoverflow.com/a/21440217
  //

  //If `begin`/`end` is unspecified, Chrome assumes 0, so we do the same
  //Chrome also converts the values to integers via flooring
  begin = Math.floor(begin || 0);
  end = Math.floor(end || 0);

  const len = arrayBuffer.byteLength;

  //If either `begin` or `end` is negative, it refers to an
  //index from the end of the array, as opposed to from the beginning.
  //The range specified by the `begin` and `end` values is clamped to the
  //valid index range for the current array.
  begin = begin < 0 ? Math.max(begin + len, 0) : Math.min(len, begin);
  end = end < 0 ? Math.max(end + len, 0) : Math.min(len, end);

  //If the computed length of the new ArrayBuffer would be negative, it
  //is clamped to zero.
  if(end - begin <= 0) {
    return new ArrayBuffer(0);
  }

  const result = new ArrayBuffer(end - begin);
  const resultBytes = new Uint8Array(result);
  const sourceBytes = new Uint8Array(arrayBuffer, begin, end - begin);

  resultBytes.set(sourceBytes);

  return result;
}

// convert a 64-bit int to a binary string
/* istanbul ignore next */
function intToString(int) {
  const bytes = [
    (int & 0xff),
    ((int >>> 8) & 0xff),
    ((int >>> 16) & 0xff),
    ((int >>> 24) & 0xff)
  ];
  return bytes.map(function (byte) {
    return String.fromCharCode(byte);
  }).join('');
}

// convert an array of 64-bit ints into
// a base64-encoded string
/* istanbul ignore next */
function rawToBase64(raw) {
  let res = '';
  for(let i = 0; i < raw.length; i++) {
    res += intToString(raw[i]);
  }
  return global.btoa(res);
}

/* istanbul ignore next */
const PouchMd5 = function(data, callback) {
  if(!(process && (process as any).browser)) {
    // const base64 = crypto.createHash('md5').update(data).digest('base64');
    const base64 = createHash('md5').update(data).digest('base64');
    callback(null, base64);
    return;
  }
  const inputIsString = typeof data === 'string';
  const len = inputIsString ? data.length : data.byteLength;
  const chunkSize = Math.min(MD5_CHUNK_SIZE, len);
  const chunks = Math.ceil(len / chunkSize);
  let currentChunk = 0;
  const buffer = inputIsString ? new Md5() : new Md5.ArrayBuffer();

  function append(buffer1:Md5|Md5.ArrayBuffer, data:string, start:number, end:number) {
    if(inputIsString) {
      (buffer1 as Md5).appendBinary(data.substring(start, end));
    } else {
      (buffer1 as Md5.ArrayBuffer).append(sliceShim(data, start, end));
    }
  }

  function loadNextChunk() {
    const start = currentChunk * chunkSize;
    let end = start + chunkSize;
    if((start + chunkSize) >= data.size) {
      end = data.size;
    }
    currentChunk++;
    if(currentChunk < chunks) {
      append(buffer, data, start, end);
      setImmediateShim(loadNextChunk, 0);
    } else {
      append(buffer, data, start, end);
      const raw = buffer.end(true);
      const base64 = rawToBase64(raw);
      callback(null, base64);
      buffer.destroy();
    }
  }
  loadNextChunk();
};

export { PouchMd5 };