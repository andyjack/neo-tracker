import express from 'express';
import { stringify } from 'csv-stringify/sync';
import { sqlite } from '../lib/db.mjs';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    await sqlite()
      .all(
        `
        WITH
        avg50day AS (
          SELECT PRINTF('%.2f',AVG(price)) AS avg50day,stock_id FROM daily_price WHERE date >= date('now','-50 day') GROUP BY stock_id
        ),
        avg200day AS (
          SELECT PRINTF('%.2f',AVG(price)) AS avg200day,stock_id FROM daily_price WHERE date >= date('now','-200 day') GROUP BY stock_id
        ),
        maxmin AS (
          SELECT MAX(price) AS max,MIN(price) AS min,stock_id FROM daily_price where date > date('now','-1 year') GROUP BY stock_id
        ),
        latest_date AS (
          SELECT MAX(date) AS updated,stock_id FROM daily_price GROUP BY stock_id
        ),
        latest AS (
          SELECT price, updated, dp.stock_id FROM daily_price dp JOIN latest_date ld ON dp.stock_id = ld.stock_id AND dp.date = ld.updated
        )
        SELECT symbol,max,min,avg50day,avg200day,price,updated
        FROM stock
        JOIN latest USING (stock_id)
        JOIN maxmin USING (stock_id)
        JOIN avg200day USING (stock_id)
        JOIN avg50day USING (stock_id);
        `
      )
      .then((rows) =>
        stringify(rows, {
          header: false,
          columns: [
            'symbol',
            'min',
            'max',
            'avg50day',
            'avg200day',
            'price',
            'updated',
          ],
          quoted: true,
        })
      )
      .then((output) => {
        res.type('csv');
        return res.send(output);
      });
  } catch (err) {
    next(err);
  }
});

export default router;
