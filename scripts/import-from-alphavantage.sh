#!/bin/bash

APIKEY="$1"
SYMBOL="$3"
NAME="$2"
FILE=$(mktemp)

curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&apikey=${APIKEY}&datatype=csv&outputsize=full" 2>/dev/null | head -n 260 | cut -f1,5 -d, > "$FILE"

read -r -d '' SQL <<_EOF_
.mode csv
DROP TABLE IF EXISTS temp;
.import '$FILE' temp
INSERT INTO stock (name,symbol) VALUES ('$NAME','$SYMBOL');
.headers off
.mode tabs
SELECT last_insert_rowid();
_EOF_

ID=$(echo "$SQL" | sqlite3 database.sqlite)

echo $ID

read -r -d '' SQL <<_EOF_
INSERT INTO daily_price (stock_id,date,price) SELECT $ID,timestamp,close FROM temp WHERE price > 0;
--DROP TABLE IF EXISTS temp;
_EOF_

echo "$SQL" | sqlite3 database.sqlite

echo "INSERT INTO stock_service (service_id,stock_id) VALUES (2,$ID);" | sqlite3 database.sqlite

rm -vf "$FILE"
