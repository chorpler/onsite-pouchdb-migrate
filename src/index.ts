// var Promise = require('pouchdb/extras/promise')
// var checkpointer = require('./checkpointer')
// var migrate = require('./migrate')
import { checkpointer } from './checkpointer';
import { migrate as migrateFn } from './migrate';
import PouchDB from 'pouchdb-core';

type PouchDoc = PouchDB.Core.Document<any>;
type PouchOptions = PouchDB.Core.Options;
type MigrateCallback = (error:Error, result?:any) => void;


type MigrationFunction = (PouchDoc) => boolean;

const migrate = async function(migration:MigrationFunction, options?:PouchOptions, callback?:MigrateCallback) {
  const db = this;

  if (!migration) {
    throw(new Error('no migration given'));
  }
  if (typeof migration !== 'function') {
    throw(new Error('migration must be a function'));
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof options === 'undefined') {
    options = {};
  }

  const promise = checkpointer(db, migration)
    .then(function(cp) {
      return migrateFn(db, cp, migration, options);
    });

  if (typeof callback === 'function') {
    return promise
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(error) {
        callback(error);
        return Promise.reject(error);
      });
  }

  return promise;
};

if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports);
}

export { migrate };