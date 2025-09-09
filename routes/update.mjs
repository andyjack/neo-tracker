import express from 'express';
import moment from 'moment';
import { sqlite } from '../lib/db.mjs';
import getPrices from '../lib/getPrices.mjs';

const router = express.Router();

router.post('/current', async (req, res, next) => {
  try {
    await sqlite()
      .all(
        `SELECT stock_id,symbol,service.name AS service_name
          FROM stock
          JOIN stock_service USING (stock_id)
          JOIN service USING (service_id)
          WHERE fetch_updates = ?`,
        1
      )
      // TODO what if no rows, reject
      .then((rows) => {
        // finish talking to the client immediately.
        res.sendStatus(204).end();

        const serviceRows = {};
        rows.forEach((r) => {
          serviceRows[r.service_name] = serviceRows[r.service_name] || [];
          serviceRows[r.service_name].push(r);
        });
        const priceTodo = [];
        Object.keys(serviceRows).forEach((k) =>
          priceTodo.push(getPrices[k](serviceRows[k]))
        );
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
      .then((prices) =>
        sqlite()
          .prepare(
            'REPLACE INTO daily_price (stock_id,price,date) VALUES (?,?,?)'
          )
          .then((sth) =>
            prices.reduce(async (acc, p) => {
              await acc;
              if (!p.err && p.price) {
                return sth.run(p.stock_id, p.price, p.date);
              }
              const logtime = moment().format('YYYY-MM-DD HH:mm:ss');
              if (p.err) {
                console.log(
                  `${logtime} got ${p.err} fetching current price for ${p.symbol}`
                );
              }
              if (!p.price) {
                console.log(
                  `${logtime} did not get a price for ${p.symbol} [${p.price}]`
                );
              }
              return Promise.resolve();
            }, Promise.resolve())
          )
      );
  } catch (err) {
    next(err);
  }
});

export default router;
