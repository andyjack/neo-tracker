const express = require('express');

const router = express.Router();
const { promisify } = require('util');
const stringify = promisify(require('csv-stringify'));

const { sqlite } = require('../lib/db');

router.get('/:symbol', async (req, res, next) => {
  try {
    const priceRow = await sqlite().get(
      `
      WITH
      latest_date AS (
        SELECT MAX(date) AS date,stock_id FROM daily_price GROUP BY stock_id
      )
      SELECT price
      FROM daily_price dp
      JOIN latest_date ld USING (stock_id,date)
      JOIN stock USING (stock_id) WHERE symbol = ?
      `,
      req.params.symbol
    );
    if (typeof priceRow === 'undefined') {
      res.sendStatus(404);
      return;
    }
    const query =
      'SELECT avg(price) AS avg FROM' +
      ' (SELECT price FROM daily_price JOIN stock USING (stock_id)' +
      ' WHERE symbol = ? AND date >= date(?,?) )';
    const [maxmin, day50ma, day200ma] = await Promise.all([
      sqlite().get(
        'SELECT MAX(price) AS max, MIN(price) AS min' +
          ' FROM daily_price JOIN stock USING (stock_id)' +
          ' WHERE symbol = ? AND date > date(?,?)',
        req.params.symbol,
        'now',
        '-1 year'
      ),
      sqlite().get(query, req.params.symbol, 'now', '-50 days'),
      sqlite().get(query, req.params.symbol, 'now', '-200 days'),
    ]);
    const parsed50day = Number.parseFloat(day50ma.avg).toFixed(2);
    const parsed200day = Number.parseFloat(day200ma.avg).toFixed(2);
    res.type('csv');
    await stringify([
      [maxmin.min, maxmin.max, parsed50day, parsed200day, priceRow.price],
    ]).then((output) => res.send(output));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
