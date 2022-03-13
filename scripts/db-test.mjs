#!/usr/bin/env node

import { startup, sqlite } from '../lib/db.mjs';

async function f() {
  await startup()
    // eslint-disable-next-line no-console
    .catch((err) => console.error(err.stack));

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
    // eslint-disable-next-line no-console
    .then((rows) => console.dir(rows));
}
f();
