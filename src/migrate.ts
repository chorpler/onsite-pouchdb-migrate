// var Promise = require('pouchdb/extras/promise')
// var extend = require('pouchdb-extend')
// var async = require('async')
import PouchDB from 'pouchdb-core';
import async from 'async';

const extend = Object.assign;

const migrate = async function(db:PouchDB.Database, checkpointer, migration, options) {
  return checkpointer.get().then(function(since) {
    return new Promise(function(resolve, reject) {
      let docs:PouchDB.Core.Document<any> = [];
      const queue = async.queue(function(result, next) {
        const change = result.change;
        if(!result) {
          return checkpointer.set(change.seq).then(next.bind({}, null)).catch(next);
        }

        // db.bulkDocs({ docs: result }).then(function (response) {
        db.bulkDocs(result).then(function(response) {
          return checkpointer.set(change.seq);
        }).then(next.bind({}, null)).catch(next);
      }, 1);

      const feed = db.changes(extend({}, options, {
        include_docs: true,
        since: since,
      }));

      feed.on('change', function(change) {
        const result = migration(change.doc);

        if(!options.live) {
          docs = result ? docs.concat(result) : docs;
          return;
        }
        queue.push(result);
      });

      feed.on('complete', function(info) {
        if (options.live) {
          return resolve(info);
        }

        // db.bulkDocs({ docs: docs }).then(function (response) {
        db.bulkDocs(docs).then(function(response) {
          return checkpointer.set(info.last_seq);
        }).then(function () {
          return db.info();
        }).then(function (dbinfo) {
          if (dbinfo.update_seq > info.last_seq) {
            return migrate(db, checkpointer, migration, options);
          }
          return info;
        }).then(resolve);
      });

      feed.on('error', reject);
    });
  });
};

export { migrate };
