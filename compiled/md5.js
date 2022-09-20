'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PouchMd5 = void 0;
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
var crypto_1 = require("crypto");
var spark_md5_1 = __importDefault(require("spark-md5"));
var setImmediateShim = global.setImmediate || global.setTimeout;
var MD5_CHUNK_SIZE = 32768;
/* istanbul ignore next */
function sliceShim(arrayBuffer, begin, end) {
    if (typeof arrayBuffer.slice === 'function') {
        if (!begin) {
            return arrayBuffer.slice();
        }
        else if (!end) {
            return arrayBuffer.slice(begin);
        }
        else {
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
    var len = arrayBuffer.byteLength;
    //If either `begin` or `end` is negative, it refers to an
    //index from the end of the array, as opposed to from the beginning.
    //The range specified by the `begin` and `end` values is clamped to the
    //valid index range for the current array.
    begin = begin < 0 ? Math.max(begin + len, 0) : Math.min(len, begin);
    end = end < 0 ? Math.max(end + len, 0) : Math.min(len, end);
    //If the computed length of the new ArrayBuffer would be negative, it
    //is clamped to zero.
    if (end - begin <= 0) {
        return new ArrayBuffer(0);
    }
    var result = new ArrayBuffer(end - begin);
    var resultBytes = new Uint8Array(result);
    var sourceBytes = new Uint8Array(arrayBuffer, begin, end - begin);
    resultBytes.set(sourceBytes);
    return result;
}
// convert a 64-bit int to a binary string
/* istanbul ignore next */
function intToString(int) {
    var bytes = [
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
    var res = '';
    for (var i = 0; i < raw.length; i++) {
        res += intToString(raw[i]);
    }
    return global.btoa(res);
}
/* istanbul ignore next */
var PouchMd5 = function (data, callback) {
    if (!process.browser) {
        // const base64 = crypto.createHash('md5').update(data).digest('base64');
        var base64 = crypto_1.createHash('md5').update(data).digest('base64');
        callback(null, base64);
        return;
    }
    var inputIsString = typeof data === 'string';
    var len = inputIsString ? data.length : data.byteLength;
    var chunkSize = Math.min(MD5_CHUNK_SIZE, len);
    var chunks = Math.ceil(len / chunkSize);
    var currentChunk = 0;
    var buffer = inputIsString ? new spark_md5_1.default() : new spark_md5_1.default.ArrayBuffer();
    function append(buffer, data, start, end) {
        if (inputIsString) {
            buffer.appendBinary(data.substring(start, end));
        }
        else {
            buffer.append(sliceShim(data, start, end));
        }
    }
    function loadNextChunk() {
        var start = currentChunk * chunkSize;
        var end = start + chunkSize;
        if ((start + chunkSize) >= data.size) {
            end = data.size;
        }
        currentChunk++;
        if (currentChunk < chunks) {
            append(buffer, data, start, end);
            setImmediateShim(loadNextChunk, 0);
        }
        else {
            append(buffer, data, start, end);
            var raw = buffer.end(true);
            var base64 = rawToBase64(raw);
            callback(null, base64);
            buffer.destroy();
        }
    }
    loadNextChunk();
};
exports.PouchMd5 = PouchMd5;
//# sourceMappingURL=md5.js.map