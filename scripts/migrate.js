const Promise = require('bluebird');
const db = require('./lib/db');

Promise.resolve()
  .then( () => db.startup() )
  .then( () => db.sqlite().migrate() )
  .catch( err => console.log(err) );
