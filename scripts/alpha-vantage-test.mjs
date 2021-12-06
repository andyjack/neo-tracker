#!/usr/bin/env node

import getPrices from '../lib/getPrices.mjs';

const rows = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }, { symbol: 'KO' }];
// eslint-disable-next-line no-console
getPrices.alphavantage(rows).then((prices) => console.dir(prices));
