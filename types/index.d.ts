/// <reference types="pouchdb-core" />
declare type PouchOptions = PouchDB.Core.Options;
declare type MigrateCallback = (error: Error, result?: any) => void;
declare type MigrationFunction = (PouchDoc: any) => boolean;
declare const migrate: (migration: MigrationFunction, options?: PouchOptions, callback?: MigrateCallback) => Promise<any>;
export { migrate };
//# sourceMappingURL=index.d.ts.map