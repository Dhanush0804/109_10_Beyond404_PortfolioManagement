CREATE TABLE IF NOT EXISTS customers
(
    customer_id BIGINT NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    risk_lvl ENUM('LOW','MEDIUM','HIGH'),


    CONSTRAINT pk_customers PRIMARY KEY (customer_id)
);



CREATE TABLE IF NOT EXISTS stocks
(
    stock_id BIGINT NOT NULL AUTO_INCREMENT,

    stock_name VARCHAR(150) NOT NULL,

    ticker VARCHAR(20) NOT NULL,

    stock_market ENUM(
        'NYSE',
        'NASDAQ',
        'EURONEXT',
        'NSE',
        'BSE'
    ) NOT NULL,

    CONSTRAINT pk_stocks PRIMARY KEY (stock_id),

    CONSTRAINT uk_ticker_market UNIQUE (ticker, stock_market)
);



CREATE TABLE IF NOT EXISTS investments
(
    asset_id BIGINT NOT NULL AUTO_INCREMENT,

    customer_id BIGINT NOT NULL,

    stock_id BIGINT NOT NULL,

    transaction_type ENUM('BUY','SELL') NOT NULL,

    transaction_amount DECIMAL(12,2) NOT NULL,

    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT pk_investments PRIMARY KEY (asset_id),


    CONSTRAINT fk_investments_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id)
    ON DELETE CASCADE,


    CONSTRAINT fk_investments_stock
    FOREIGN KEY (stock_id)
    REFERENCES stocks(stock_id)
    ON DELETE CASCADE

);