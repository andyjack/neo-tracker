#!/bin/bash

FILE="$1"
SYMBOL="$2"
NAME="$3"

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
INSERT INTO daily_price (stock_id,date,price) SELECT $ID,Date,Close FROM temp;
DROP TABLE IF EXISTS temp;
_EOF_

echo "$SQL" | sqlite3 database.sqlite
