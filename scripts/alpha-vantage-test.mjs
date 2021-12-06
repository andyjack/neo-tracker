#!/usr/bin/env node

import { alphavantage } from '../lib/getPrices.mjs';

const rows = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }, { symbol: 'KO' }];
// eslint-disable-next-line no-console
alphavantage(rows).then((prices) => console.dir(prices));
