#!/usr/bin/env node

import getPrices from '../lib/getPrices.mjs';

const rows = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }, { symbol: 'KO' }];

getPrices.alphavantage(rows).then((prices) => console.dir(prices));
