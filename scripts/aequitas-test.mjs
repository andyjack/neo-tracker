#!/usr/bin/env node

import getPrices from '../lib/getPrices.mjs';

const rows = [{ symbol: 'AEMX' }, { symbol: 'CGSB' }];

getPrices.aequitas(rows).then((prices) => console.dir(prices));
