const Promise = require('bluebird');
const sqlite = require('sqlite');

const state = {
  db: null,
};

exports.startup = () => {
  if (state.db) { return Promise.resolve(); }
  return sqlite.open('./database.sqlite', { Promise })
  // .then( () => sqlite.migrate({ force: 'last' }) )
    .then(() => sqlite.run('PRAGMA foreign_key = ON'))
    .then(() => { state.db = sqlite; });
};

exports.sqlite = () => state.db;
