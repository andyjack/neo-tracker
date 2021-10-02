#!/usr/bin/env node

const getPrices = require('../lib/getPrices');

const rows = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }, { symbol: 'KO' }];
// eslint-disable-next-line no-console
getPrices.alphavantage(rows).then((prices) => console.dir(prices));
