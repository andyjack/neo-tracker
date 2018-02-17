const Promise = require('bluebird');
const express = require('express');

const router = express.Router();
const { sqlite } = require('../lib/db');
const stringify = Promise.promisify(require('csv-stringify'));

function outputRows(res, rows) {
  const output = [];
  rows.forEach((r) => { output.push([r.date, r.price]); });
  res.type('csv');
  return stringify(output).then(str => res.send(str));
}

router.get(
  '/month/:symbol',
  async (req, res, next) => {
    try {
      const rows = await sqlite().all(
        'SELECT date,price FROM daily_price JOIN stock USING (stock_id)' +
        ' WHERE symbol = ? AND date > date(?,?) ORDER BY date DESC',
        req.params.symbol, 'now', '-30 days',
      );
      if (rows.length === 0) { res.sendStatus(404); return; }
      outputRows(res, rows);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/year/:symbol',
  async (req, res, next) => {
    try {
      const rows = await sqlite().all(
        'SELECT date,price FROM daily_price JOIN stock USING (stock_id) ' +
        ' WHERE symbol = ? AND date > date(?,?) AND strftime(?,date) = ?' +
        ' ORDER BY date DESC',
        req.params.symbol,
        'now', '-1 year',
        '%w', '1', // only want Mondays
      );
      if (rows.length === 0) { res.sendStatus(404); return; }
      outputRows(res, rows);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
