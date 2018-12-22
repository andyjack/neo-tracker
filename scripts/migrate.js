const db = require('../lib/db');

db.startup()
  .then(() => db.sqlite().migrate())
  // eslint-disable-next-line no-console
  .catch(err => console.log(err));
