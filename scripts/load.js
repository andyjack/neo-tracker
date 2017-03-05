#!/usr/bin/env node

process.env.PATH = `${process.env.PATH}:./node_modules/.bin`;

const By = require('selenium-webdriver').By;
const webdriver = require('selenium-webdriver');
const driver = new webdriver.Builder().forBrowser('phantomjs').build();
const fs = require('fs');

driver.get('https://aequitasneoexchange.com/en/security-detail?q=clu');
driver.findElement(By.css('td.quote-summary-lastSalePrice'))
  .getText().then(text => { console.log(`${text}`) });

/*
 *driver.takeScreenshot().then(function(data){
 *     var base64Data = data.replace(/^data:image\/png;base64,/,"")
 *  fs.writeFile("out.png", base64Data, 'base64', function(err) {
 *            if(err) console.log(err);
 *  });
 *});
 */
