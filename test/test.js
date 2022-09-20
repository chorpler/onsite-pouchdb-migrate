var test = require('tape');
var PouchDB = require('pouchdb-core');
var LevelPouch = require('pouchdb-adapter-leveldb');
var memdown = require('memdown');
var PouchMigrate = require('../lib');

// PouchDB.plugin(require('../lib/index.js'));
PouchDB.plugin(LevelPouch).plugin(PouchMigrate);

test('basic migration', function(t) {
  var db = new PouchDB('test', { db: memdown });
  var docs = [
    { _id: 'mydoc' },
    { _id: 'otherdoc' }
  ];
  var migration = function(doc) {
    if ('foo' in doc) return;

    doc.foo = 'bar';
    return [doc];
  };

  db.bulkDocs(docs).then(function() {
    return db.migrate(migration, { limit: docs.length });
  }).then(function() {
    return db.allDocs({ include_docs: true });
  }).then(function(result) {
    result.rows.forEach(function(row) {
      t.equal(row.doc.foo, 'bar', row.id + ' has foo');
    });
  }).then(t.end);
});
