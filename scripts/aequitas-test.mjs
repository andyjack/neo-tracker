#!/usr/bin/env node

import getPrices from '../lib/getPrices.mjs';

const rows = [{ symbol: 'AEMX' }, { symbol: 'CGSB' }];
// eslint-disable-next-line no-console
getPrices.aequitas(rows).then((prices) => console.dir(prices));
