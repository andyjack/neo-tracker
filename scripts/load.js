#!/usr/bin/env node

process.env.PATH = `${process.env.PATH}:./node_modules/.bin`;

const webdriver = require('selenium-webdriver');

const driver = new webdriver.Builder().forBrowser('phantomjs').build();

driver.get('https://www.aequitasneo.com/en/single-security/CLU');
driver.executeScript('return document.querySelector(\'#securityLastSalePrice\').innerText')
  // eslint-disable-next-line no-console
  .then((text) => { console.log(`${text.replace(/\$/, '')}`); });
