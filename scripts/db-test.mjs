#!/usr/bin/env node

import { startup, sqlite } from '../lib/db.mjs';

async function f() {
  await startup().catch((err) => console.error(err.stack));

  sqlite()
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
}
f();
