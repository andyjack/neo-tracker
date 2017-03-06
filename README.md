# Tracker for NEO exchange prices

A couple of securities I track using Google Sheets have moved to the [NEO
Exchange](https://aequitasneoexchange.com/en/).  Google Finance functions
don't know about this small exchange so I wrote something to track prices by
scraping its website, and providing some CSV data on current prices, moving
averages, and sparklines.

# Initial install

```
yarn install --offline
```

# Create initial database

```sh
# you backed this up right?
rm database.sqlite
node scripts/migrate.js
```

# Import data

XXX_raw.csv is from copying from Historical data from my brokerage website,
pasting into a spreadsheet application (Numbers on macOS worked fine), and
then exporting to CSV.  Data was copied from TSX the year up to and including
2017-Feb-21, then data from 2017-Feb-22 to the current date was added.

```
# tidy up data
scripts/convert.pl data/CLU_raw.csv > data/CLU.csv
scripts/convert.pl data/CRQ_raw.csv > data/CRQ.csv

# import into database
scripts/import-csv.sh data/CLU.csv CLU 'iSHARES US FUNDAMENTAL INDEX ETF'
scripts/import-csv.sh data/CRQ.csv CRQ 'iSHARES CANADIAN FUNDAMENTAL INDEX ETF'
```

# Start the app

```
# start for the first time
./node_modules/.bin/pm2 start app.js

# make pm2 remember to run the app
./node_modules/.bin/pm2 save

# install with systemd - follow instructions
./node_modules/.bin/pm2 startup system
```

# Set up scheduled requests

```
# .cron extension inside of cron.d will make cron ignore the file!
sudo cp cron/neo-tracker /etc/cron.d/neo-tracker
```

# Routes

## GET

* `/current/SYMBOL` - returns as a CSV line, the following in order:
  1. 52-week low
  1. 52-week high
  1. 50-day MA
  1. 200-day MA
  1. current price
* `/sparkline/month/SYMBOL` - returns as CSV, date and closing price for the
  past month for the given symbol
* `/sparkline/year/SYMBOL` - returns as CSV, date and closing price for the
  past year (Mondays only) for the given symbol

## POST

* `/update/current` - fetch prices from the NEO exchange website, and update
  the locally stored prices.  Should be run every hour or so on trading days
* `/update/daily` - copy the current price into the daily price for today.
  Should be run once a day, on trading days, after close of trading.  If the
  data for the stock and day already exists in the daily price table, this is
  a no-op.

# Some TODO

* more server maintenance stuff:
  * etckeeper
  * logwatch
  * cheesy letsencrypt renewal replaced with certbot-auto

# Development

Run the server on port 3000, with watching of files and auto-restarting:
```
yarn run gulp
```

<!--
 vim:tw=78
-->
