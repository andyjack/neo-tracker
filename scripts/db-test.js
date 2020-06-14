#!/usr/bin/env node

const db = require('../lib/db');

(async function () {
  await db
    .startup()
    // eslint-disable-next-line no-console
    .catch((err) => console.error(err.stack));

  db.sqlite()
    .all(
      'SELECT date,price FROM daily_price JOIN stock USING (stock_id) ' +
        ' WHERE symbol = ? AND date > date(?,?) AND strftime(?,date) = ?' +
        ' ORDER BY date DESC',
      'TSX:CBO',
      'now',
      '-1 year',
      '%w',
      '1' // only want Mondays
    )
    .then((rows) => console.dir(rows));
})();
