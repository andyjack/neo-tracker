#!/usr/bin/env node

process.env.PATH = `${process.env.PATH}:./node_modules/.bin`;

const By = require('selenium-webdriver').By;
const webdriver = require('selenium-webdriver');
const driver = new webdriver.Builder().forBrowser('phantomjs').build();
const fs = require('fs');

driver.get('https://www.aequitasneo.com/en/single-security/CLU');
driver.executeScript(`return document.querySelector('#securityLastSalePrice').innerText`)
  .then(text => { console.log(`${text.replace(/\$/,'')}`) });

/*
 *driver.takeScreenshot().then(function(data){
 *     var base64Data = data.replace(/^data:image\/png;base64,/,"")
 *  fs.writeFile("out.png", base64Data, 'base64', function(err) {
 *            if(err) console.log(err);
 *  });
 *});
 */
