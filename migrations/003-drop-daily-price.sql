-- Up
DROP TABLE current_price;

-- Down
CREATE TABLE current_price (
    stock_id INTEGER,
    price REAL,
    time INTEGER,
    CONSTRAINT current_price_fk_stock_stock_id
        FOREIGN KEY (stock_id) REFERENCES stock(stock_id)
);

CREATE UNIQUE INDEX uniq_current_price_stock_id
    ON current_price (stock_id);
