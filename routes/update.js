const Promise = require('bluebird');
const express = require('express');
const router  = express.Router();
const sqlite = require('../lib/db').sqlite;

const By = require('selenium-webdriver').By;
const Key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver');

const baseUri = 'https://aequitasneoexchange.com/en/security-detail'

router.post('/current',
  async (req, res, next) => {
    try {
      sqlite().all(
        'SELECT stock_id,symbol FROM stock WHERE fetch_updates = ?',
        1
      )
      // TODO what if no rows, reject
      .then( rows => getPrices(rows) )
      // TODO what if all errors, reject, log?
      .then( prices => {
        sqlite().prepare('REPLACE INTO current_price (stock_id,price,time) VALUES (?,?,datetime(?))')
          .then(
            sth => Promise.each(prices, p => {
              if (!p.err && p.price) {
                return sth.run(p.stock_id,p.price,'now');
              }
              else {
                if (p.err) {
                  console.log(`got ${p.err} fetching current price for ${p.symbol}`);
                }
                if (!p.price) {
                  console.log(`did not get a price for ${p.symbol} [${p.price}]`)
                }
                return Promise.resolve();
              }
            })
          )
      })
      .then( () => res.sendStatus(204) );
    }
    catch (err) {
      next(err);
    }
  }
);

router.post('/daily',
  async (req, res, next) => {
    try {
      sqlite().run(
        'INSERT OR IGNORE INTO daily_price (stock_id,price,date) ' +
        'SELECT stock_id,price,date(?) FROM current_price ' +
        '  WHERE date(time) = date(?)',
        'now',
        'now'
      )
      .then( () => res.sendStatus(204) );
    }
    catch (err) {
      next(err);
    }
  }
);

function getPrices(rows) {
  if ( rows.length === 0 ) {
    return Promise.resolve([]);
  }
  const lookup = {};
  const driver = new webdriver.Builder().forBrowser('phantomjs').build();

  // There are two prices for the stock, one is LIT and the other is NEO.
  // Not sure what one I want, so using the default shown on the page, LIT.
  // https://aequitasneoexchange.com/en/trading/trading-solutions/lit-book/
  // https://aequitasneoexchange.com/en/trading/trading-solutions/neo-book/

  return Promise.each(rows,
    row => driver.get(baseUri + `?q=${row.symbol}`)
      .then(
        () => driver.findElement(By.css('td.quote-summary-lastSalePrice'))
      )
      .then(
        el => el.getText()
      )
      .then(
        text => { const r = row; r.price = text; return r }
      )
      .catch(
          err => { const r = row; r.err = err; return r }
      )
  );
}

module.exports = router;
