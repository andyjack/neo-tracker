-- Up
CREATE TABLE stock_service (
    stock_id INTEGER,
    service_id INTEGER,
    CONSTRAINT stock_service_api_fk_stock_stock_id
        FOREIGN KEY (stock_id) REFERENCES stock(stock_id)
);
CREATE TABLE service (
    service_id INTEGER PRIMARY KEY,
    name TEXT
);
INSERT INTO service VALUES (1,'aequitas');
INSERT INTO service VALUES (2,'alphavantage');
INSERT INTO stock_service (service_id,stock_id) SELECT 1,stock_id FROM stock;

-- Down
DROP TABLE stock_service;
DROP TABLE service;
