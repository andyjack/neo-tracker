const Promise = require('bluebird');
const express = require('express');

const router = express.Router();
const { sqlite } = require('../lib/db');
const getPrices = require('../lib/getPrices');

router.post(
  '/current',
  async (req, res, next) => {
    try {
      await sqlite().all(
        `SELECT stock_id,symbol,service.name AS service_name
          FROM stock
          JOIN stock_service USING (stock_id)
          JOIN service USING (service_id)
          WHERE fetch_updates = ?`,
        1,
      )
      // TODO what if no rows, reject
        .then((rows) => {
          const serviceRows = {};
          rows.forEach((r) => {
            serviceRows[r.service_name] = serviceRows[r.service_name] || [];
            serviceRows[r.service_name].push(r);
          });
          const priceTodo = [];
          Object.keys(serviceRows).forEach(k => priceTodo.push(getPrices[k](serviceRows[k])));
          return Promise.all(priceTodo);
        })
        .then((servicePrices) => {
          const priceRows = [];
          servicePrices.forEach((sp) => {
            sp.forEach((e) => {
              priceRows.push(e);
            });
          });
          return priceRows;
        })
      // TODO what if all errors, reject, log?
        .then((prices) => {
          sqlite().prepare('REPLACE INTO current_price (stock_id,price,time) VALUES (?,?,datetime(?))')
            .then(sth => Promise.each(prices, (p) => {
              if (!p.err && p.price) {
                return sth.run(p.stock_id, p.price, 'now');
              }
              if (p.err) {
                // eslint-disable-next-line no-console
                console.log(`got ${p.err} fetching current price for ${p.symbol}`);
              }
              if (!p.price) {
                // eslint-disable-next-line no-console
                console.log(`did not get a price for ${p.symbol} [${p.price}]`);
              }
              return Promise.resolve();
            }));
        })
        .then(() => res.sendStatus(204));
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/daily',
  async (req, res, next) => {
    try {
      await sqlite().run(
        'INSERT OR IGNORE INTO daily_price (stock_id,price,date) ' +
        'SELECT stock_id,price,date(?) FROM current_price ' +
        '  WHERE date(time) = date(?)',
        'now',
        'now',
      )
        .then(() => res.sendStatus(204));
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
