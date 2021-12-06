#!/usr/bin/env node

import getPrices from '../lib/getPrices.mjs';

const rows = [{ symbol: 'ICO' }, { symbol: 'HIP' }, { symbol: 'HUGE' }];
// eslint-disable-next-line no-console
getPrices.aequitas(rows).then((prices) => console.dir(prices));
