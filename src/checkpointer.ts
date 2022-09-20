import { PouchMd5 as MD5 } from './md5';
// var Promise = require('pouchdb/extras/promise')

const md5Promise = function(data):Promise<any> {
  return new Promise((resolve, reject) => {
    MD5(data, (error, result) => {
      if(error) {
        return reject(error);
      } else {
        resolve(result);
      }

    });
  });
};

const checkpointer = function(db, migration) {
  const doc:any = {
    last_seq: 0,
  };

  return md5Promise(migration.toString())
    .then(function(md5sum) {
      doc._id = '_local/' + md5sum;
    })
    .then(function() {
      return {
        get: function() {
          return db.get(doc._id)
            .then(function(response) {
              doc._rev = response._rev;
              doc.last_seq = response.last_seq;
            })
            .catch(function(error) {
              if (error.status !== 404) return Promise.reject();
            })
            .then(function() {
              return doc.last_seq;
            });
        },
        set: function(seq) {
          doc.last_seq = seq;

          return db.put(doc)
            .then(function(response) {
              doc._rev = response.rev;
            });
        }
      };
    });
};

export { checkpointer };
