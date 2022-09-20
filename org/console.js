var PouchDB = require('pouchdb-core'), LevelPouch = require('pouchdb-adapter-leveldb'), MigratePouch = require('../lib/index.js');
PouchDB.plugin(LevelPouch).plugin(MigratePouch);
var res1, err1, t1 = (res) => { console.log("Success:\n", res); res1 = res; }, c1 = (err) => { console.log("Error"); console.error(err); err1 = err; };
var db1 = new PouchDB('testdb');
