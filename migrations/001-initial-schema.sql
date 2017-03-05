-- Up
CREATE TABLE stock (
    stock_id INTEGER PRIMARY KEY,
    symbol TEXT,
    name TEXT,
    fetch_updates INTEGER DEFAULT 1
);

CREATE TABLE current_price (
    stock_id INTEGER,
    price REAL,
    time INTEGER,
    CONSTRAINT current_price_fk_stock_stock_id
        FOREIGN KEY (stock_id) REFERENCES stock(stock_id)
);

CREATE UNIQUE INDEX uniq_current_price_stock_id
    ON current_price (stock_id);

CREATE TABLE daily_price (
    stock_id INTEGER,
    price REAL,
    date REAL,
    CONSTRAINT daily_price_fk_stock_stock_id
        FOREIGN KEY (stock_id) REFERENCES stock(stock_id)
);

CREATE UNIQUE INDEX uniq_daily_price_stock_id_date
    ON daily_price (stock_id, date);

-- Down
DROP INDEX uniq_daily_price_stock_id_date;
DROP TABLE daily_price;
DROP INDEX uniq_current_price_stock_id;
DROP TABLE current_price;
DROP TABLE stock;
