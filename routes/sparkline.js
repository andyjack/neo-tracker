const express = require('express');
const moment = require('moment');

const router = express.Router();
const { promisify } = require('util');
const stringify = promisify(require('csv-stringify'));
const { sqlite } = require('../lib/db');

function outputRows(res, rows) {
  const output = [];
  rows.forEach(r => {
    output.push([r.date, r.price]);
  });
  res.type('csv');
  return stringify(output).then(str => res.send(str));
}

function secondsTo605pm(now) {
  const sixPm = now
    .clone()
    .startOf('day')
    .add(18, 'hours')
    .add(5, 'minutes');
  if (sixPm.isBefore(now)) {
    sixPm.add(1, 'day');
  }
  return sixPm.diff(now, 'seconds');
}

// Always add a Cache-Control header with a max-age that ends at the next
// upcoming 6:05pm.  This is because the prices in current_price are copied to
// daily_price at 6:00pm;  The extra 5 minutes is so copy has enough time to
// finish before the max-age resets back to the maximum.
router.use((req, res, next) => {
  res.set({
    'Cache-Control': `max-age=${secondsTo605pm(moment())}`,
  });
  next();
});

router.get('/month/:symbol', async (req, res, next) => {
  try {
    const rows = await sqlite().all(
      'SELECT date,price FROM daily_price JOIN stock USING (stock_id)' +
        ' WHERE symbol = ? AND date > date(?,?) ORDER BY date DESC',
      req.params.symbol,
      'now',
      '-30 days'
    );
    if (rows.length === 0) {
      res.sendStatus(404);
      return;
    }
    outputRows(res, rows);
  } catch (err) {
    next(err);
  }
});

router.get('/year/:symbol', async (req, res, next) => {
  try {
    const rows = await sqlite().all(
      'SELECT date,price FROM daily_price JOIN stock USING (stock_id) ' +
        ' WHERE symbol = ? AND date > date(?,?) AND strftime(?,date) = ?' +
        ' ORDER BY date DESC',
      req.params.symbol,
      'now',
      '-1 year',
      '%w',
      '1' // only want Mondays
    );
    if (rows.length === 0) {
      res.sendStatus(404);
      return;
    }
    outputRows(res, rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
