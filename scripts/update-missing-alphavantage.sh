#!/bin/bash

APIKEY="$1"
SYMBOL="$2"
FILE=$(mktemp)

curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&apikey=${APIKEY}&datatype=csv" 2>/dev/null | head -n 260 | cut -f1,5 -d, > "$FILE"

read -r -d '' SQL <<_EOF_
.mode csv
DROP TABLE IF EXISTS temp;
.import '$FILE' temp
.headers off
.mode tabs
SELECT stock_id FROM stock WHERE symbol = '$SYMBOL';
_EOF_

ID=$(echo "$SQL" | sqlite3 database.sqlite)

if [ -z "$ID" ]; then
    echo "no id for $SYMBOL! abort";
    exit 1;
fi
echo $ID

read -r -d '' SQL <<_EOF_
INSERT INTO daily_price (stock_id,date,price) SELECT $ID,timestamp,close FROM temp LEFT JOIN daily_price on (stock_id=$ID and timestamp=date) WHERE close > 0 AND date IS NULL;
--DROP TABLE IF EXISTS temp;
_EOF_

echo "$SQL" | sqlite3 database.sqlite

rm -vf "$FILE"
