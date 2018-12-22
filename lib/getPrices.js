const fetch = require('node-fetch');
const fs = require('fs');
require('chromedriver'); // add chromedriver from this package to the PATH
const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');

const alphavantageKey = fs.readFileSync('alpha_vantage_key.txt', 'utf8').trim();

function sleep(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

function aequitas(rows) {
  if (rows.length === 0) {
    return Promise.resolve([]);
  }
  const baseUri = 'https://www.aequitasneo.com/en/single-security';
  const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless(true))
    .build();

  // There are two prices for the stock, one is LIT and the other is NEO.
  // Not sure what one I want, so using the default shown on the page, LIT.
  // https://aequitasneoexchange.com/en/trading/trading-solutions/lit-book/
  // https://aequitasneoexchange.com/en/trading/trading-solutions/neo-book/
  return rows
    .reduce(async (acc, row) => {
      const accRows = await acc;
      const r = row;
      await driver
        .get(`${baseUri}/${row.symbol}`)
        .then(() => sleep(1000))
        .then(() =>
          driver.executeScript(
            "return document.querySelector('#security-summary-table tr td:nth-child(2)').innerText"
          )
        )
        .then(text => {
          r.price = text.replace(/\$/, '');
        })
        .catch(e => {
          r.err = e.toString().trim();
        })
        .then(() => sleep(3000));
      accRows.push(r);
      return accRows;
    }, Promise.resolve([]))
    .then(prices => driver.quit().then(() => prices));
}

function alphavantage(rows) {
  if (rows.length === 0) {
    return Promise.resolve([]);
  }

  const baseUri =
    'https://www.alphavantage.co/query?' +
    'function=TIME_SERIES_DAILY' +
    `&apikey=${alphavantageKey}` +
    '&symbol=';

  const promises = rows.map(row => {
    let jsonKeys;
    const r = row;
    return fetch(baseUri + row.symbol)
      .then(res => res.json())
      .then(json => {
        jsonKeys = Object.keys(json).join(',');
        let nowDate = json['Meta Data']['3. Last Refreshed'];
        [nowDate] = /^(\d\d\d\d-\d\d-\d\d)/.exec(nowDate);
        const price = json['Time Series (Daily)'][nowDate]['4. close'];
        if (typeof price !== 'undefined') {
          r.price = price;
        }
      })
      .catch(err => {
        r.err = `${err.toString().trim()} - [keys in resp:${jsonKeys}]`;
      })
      .then(() => r);
  });
  return promises.reduce(async (acc, p) => {
    const prices = await acc;
    prices.push(await p);
    await sleep(5000);
    return prices;
  }, []);
}

module.exports = {
  aequitas,
  alphavantage,
};
