import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const state = {
  db: null,
};

const startup = () => {
  if (state.db) {
    return Promise.resolve();
  }
  return open({ filename: './database.sqlite', driver: sqlite3.Database }).then(
    (db) => {
      state.db = db;
      return db.run('PRAGMA foreign_key = ON');
    }
  );
};

const sqlite = () => state.db;

export { startup, sqlite };
