const Promise = require('bluebird');
const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const webdriver = require('selenium-webdriver');

const alphavantageKey = fs.readFileSync('alpha_vantage_key.txt','utf8').trim();

function aequitas(rows) {
  if ( rows.length === 0 ) { return Promise.resolve([]); }
  const baseUri = 'https://www.aequitasneo.com/en/single-security';
  const driver = new webdriver.Builder().forBrowser('phantomjs').build();

  // There are two prices for the stock, one is LIT and the other is NEO.
  // Not sure what one I want, so using the default shown on the page, LIT.
  // https://aequitasneoexchange.com/en/trading/trading-solutions/lit-book/
  // https://aequitasneoexchange.com/en/trading/trading-solutions/neo-book/

  return Promise.each(rows,
    row => driver.get(baseUri + `/${row.symbol}`)
      .then(
        () => driver.executeScript(`return document.querySelector('#securityLastSalePrice').innerText`)
      )
      .then(
        text => { const r = row; r.price = text.replace(/\$/,''); return r }
      )
      .catch(
          err => { const r = row; r.err = err; return r }
      )
  ).then( prices => { return driver.quit().then( () => prices ) } );
}

function alphavantage(rows) {
  if ( rows.length === 0 ) { return Promise.resolve([]); }

  const baseUri = 'https://www.alphavantage.co/query?'
    + 'function=TIME_SERIES_DAILY'
    + `&apikey=${alphavantageKey}`
    + '&symbol=';

  const fetches = [];
  const nowDate = moment().format('YYYY-MM-DD');
  for (const row of rows) {
    fetches.push(
      fetch(baseUri + row.symbol)
      .then(res => res.json())
      .then(json => {
        const price = json['Time Series (Daily)'][nowDate]['4. close'];
        if (typeof price !== 'undefined') { row.price = price; }
      })
      .catch(err => row.err = err)
    );
  }

  return Promise.all(fetches).then( () => rows );
}

module.exports = {
  aequitas,
  alphavantage
};
