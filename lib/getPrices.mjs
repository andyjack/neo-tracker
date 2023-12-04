import fetch from 'node-fetch';
import fs from 'fs';
import firefox from 'selenium-webdriver/firefox.js';
import webdriver from 'selenium-webdriver';
import moment from 'moment';

const alphavantageKey = fs.readFileSync('alpha_vantage_key.txt', 'utf8').trim();
const alphavantageSleep = 61000 / 5; // free api limit is 5 per minute

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
  const newArray = array;
  let currentIndex = newArray.length;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
}

function aequitas(rows) {
  if (rows.length === 0) {
    return Promise.resolve([]);
  }
  const baseUri = 'https://www.neo.inc/en/live/security-activity';
  const options = new firefox.Options()
    .addArguments('-headless')
    .setBinary('/snap/bin/firefox');
  const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();

  // There are two prices for the stock, one is LIT and the other is NEO.
  // Not sure what one I want, so using the default shown on the page, LIT.
  // https://aequitasneoexchange.com/en/trading/trading-solutions/lit-book/
  // https://aequitasneoexchange.com/en/trading/trading-solutions/neo-book/
  return shuffle(rows)
    .reduce(async (acc, row, idx) => {
      const accRows = await acc;
      const r = row;
      await driver
        .get(`${baseUri}/${r.symbol}`)
        .then(() => sleep(1000))
        .then(() =>
          driver.executeScript(
            `
              return [
                document.querySelector('#security-summary-table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText,
                document.querySelector('#securityDetails > div:nth-child(2) > span:nth-child(4) > strong').innerText
              ]
            `
          )
        )
        .then(([price, trading]) => {
          const allowedStates = /^(:?REGULAR|EXTENDED) TRADING$/i;
          if (allowedStates.test(trading.trim())) {
            r.price = price.replace(/\$/, '');
            r.date = moment().format('YYYY-MM-DD');
          } else {
            r.err = `${
              r.symbol
            } market not open for trading [${trading.trim()}]`;
          }
        })
        .catch((e) => {
          r.err = e.toString().trim();
        })
        .then(() => {
          // don't need to sleep after the last row
          if (idx + 1 < rows.length) {
            return sleep(90000);
          }
          return Promise.resolve();
        });
      accRows.push(r);
      return accRows;
    }, Promise.resolve([]))
    .then((prices) => driver.quit().then(() => prices));
}

function alphavantage(rows) {
  if (rows.length === 0) {
    return Promise.resolve([]);
  }

  return rows.reduce(async (acc, row, idx) => {
    const prices = await acc;
    prices.push(await alphavantageFetch(row));
    // don't need to sleep on the last element
    if (idx + 1 < rows.length) {
      await sleep(alphavantageSleep);
    }
    return prices;
  }, []);
}

async function alphavantageFetch(row) {
  const baseUri =
    'https://www.alphavantage.co/query?' +
    'function=GLOBAL_QUOTE' +
    `&apikey=${alphavantageKey}` +
    '&symbol=';

  let jsonKeys;
  const r = row;
  return fetch(baseUri + row.symbol)
    .then((res) => res.json())
    .then((json) => {
      jsonKeys = Object.keys(json).join(',');
      const gq = json['Global Quote'];
      if (!gq) {
        r.price = '';
        if (json.Note) {
          r.err = json.Note;
        } else if (json.Information) {
          r.err = json.Information;
        }
        return;
      }
      r.date = gq['07. latest trading day'] || '';
      r.price = gq['05. price'] || '';
    })
    .catch((err) => {
      r.err = `${err.toString().trim()} - [keys in resp:${jsonKeys}]`;
    })
    .then(() => r);
}

export default { aequitas, alphavantage };
