#!/usr/bin/env node

const getPrices = require('../lib/getPrices');

const rows = [{ symbol: 'ICO' }, { symbol: 'HIP' }, { symbol: 'HUGE' }];
// eslint-disable-next-line no-console
getPrices.aequitas(rows).then((prices) => console.dir(prices));
