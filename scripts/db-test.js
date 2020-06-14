#!/usr/bin/env node

const db = require('../lib/db');

(async function () {
  db.startup()
    // eslint-disable-next-line no-console
    .catch((err) => console.error(err.stack));
})();
