#!/usr/bin/env node

import { aequitas } from '../lib/getPrices.mjs';

const rows = [{ symbol: 'ICO' }, { symbol: 'HIP' }, { symbol: 'HUGE' }];
// eslint-disable-next-line no-console
aequitas(rows).then((prices) => console.dir(prices));
