#!/usr/bin/env node

const getPrices = require('../lib/getPrices.js');
const rows = [{symbol:"AAPL"},{symbol:"MSFT"}];
getPrices['alphavantage'](rows).then(prices => console.dir(prices));
