const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const state = {
  db: null,
};

exports.startup = () => {
  if (state.db) {
    return Promise.resolve();
  }
  return sqlite
    .open({ filename: './database.sqlite', driver: sqlite3.Database })
    .then((db) => {
      state.db = db;
      return db.run('PRAGMA foreign_key = ON');
    });
};

exports.sqlite = () => state.db;
