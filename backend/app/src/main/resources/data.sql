-- =========================
-- CUSTOMERS DATA
-- =========================

INSERT IGNORE INTO customers
(customer_id, name, risk_lvl)
VALUES
(1, 'Rahul Sharma', 'MEDIUM'),
(2, 'Priya Nair', 'LOW'),
(3, 'Arjun Mehta', 'HIGH'),
(4, 'Sneha Reddy', 'MEDIUM');



-- =========================
-- STOCKS DATA
-- =========================

INSERT IGNORE INTO stocks
(stock_id, stock_name, ticker, stock_market)
VALUES

-- ==========================
-- NASDAQ
-- ==========================

(1, 'Apple Inc.', 'AAPL', 'NASDAQ'),
(2, 'Microsoft Corporation', 'MSFT', 'NASDAQ'),
(3, 'NVIDIA Corporation', 'NVDA', 'NASDAQ'),
(4, 'Alphabet Inc.', 'GOOG', 'NASDAQ'),
(5, 'Broadcom Inc.', 'AVGO', 'NASDAQ'),
(6, 'Costco Wholesale Corporation', 'COST', 'NASDAQ'),
(7, 'Adobe Inc.', 'ADBE', 'NASDAQ'),

-- ==========================
-- NYSE
-- ==========================

(8, 'JPMorgan Chase & Co.', 'JPM', 'NYSE'),
(9, 'Bank of America Corporation', 'BAC', 'NYSE'),
(10, 'Morgan Stanley', 'MS', 'NYSE'),
(11, 'Berkshire Hathaway Inc.', 'BRK-B', 'NYSE'),
(12, 'Johnson & Johnson', 'JNJ', 'NYSE'),
(13, 'Procter & Gamble Company', 'PG', 'NYSE'),
(14, 'Coca-Cola Company', 'KO', 'NYSE'),

-- ==========================
-- NSE
-- ==========================

(15, 'ICICI Bank Limited', 'ICICIBANK.NS', 'NSE'),
(16, 'HDFC Bank Limited', 'HDFCBANK.NS', 'NSE'),
(17, 'Infosys Limited', 'INFY.NS', 'NSE'),
(18, 'Tata Consultancy Services Limited', 'TCS.NS', 'NSE'),
(19, 'Reliance Industries Limited', 'RELIANCE.NS', 'NSE'),
(20, 'Axis Bank Limited', 'AXISBANK.NS', 'NSE'),
(21, 'Wipro Limited', 'WIPRO.NS', 'NSE'),
(22, 'Kotak Mahindra Bank Limited', 'KOTAKBANK.NS', 'NSE'),
(23, 'Larsen & Toubro Limited', 'LT.NS', 'NSE'),
(24, 'Bajaj Auto Limited', 'BAJAJ-AUTO.NS', 'NSE'),
(25, 'Maruti Suzuki India Limited', 'MARUTI.NS', 'NSE'),
(26, 'HCL Technologies Limited', 'HCLTECH.NS', 'NSE'),
(27, 'Tech Mahindra Limited', 'TECHM.NS', 'NSE'),
(28, 'ITC Limited', 'ITC.NS', 'NSE'),
(29, 'Bharti Airtel Limited', 'BHARTIARTL.NS', 'NSE'),
(30, 'Nestle India Limited', 'NESTLEIND.NS', 'NSE'),
(31, 'NTPC Limited', 'NTPC.NS', 'NSE'),

-- ==========================
-- BSE
-- ==========================

(32, 'Reliance Industries Limited', 'RELIANCE.BO', 'BSE'),
(33, 'ICICI Bank Limited', 'ICICIBANK.BO', 'BSE'),
(34, 'Tata Consultancy Services Limited', 'TCS.BO', 'BSE'),
(35, 'Bajaj Auto Limited', 'BAJAJ-AUTO.BO', 'BSE'),
(36, 'Maruti Suzuki India Limited', 'MARUTI.BO', 'BSE'),
(37, 'ITC Limited', 'ITC.BO', 'BSE'),
(38, 'Bharti Airtel Limited', 'BHARTIARTL.BO', 'BSE'),
(39, 'Titan Company Limited', 'TITAN.BO', 'BSE'),
(40, 'UltraTech Cement Limited', 'ULTRACEMCO.BO', 'BSE'),
(41, 'Bajaj Finance Limited', 'BAJFINANCE.BO', 'BSE'),
(42, 'Sun Pharmaceutical Industries Limited', 'SUNPHARMA.BO', 'BSE'),
(43, 'Power Grid Corporation of India Limited', 'POWERGRID.BO', 'BSE'),
(44, 'State Bank of India', 'SBIN.BO', 'BSE'),

-- ==========================
-- EURONEXT
-- ==========================

(45, 'ASML Holding N.V.', 'ASML.AS', 'EURONEXT'),
(46, 'Unilever PLC', 'UNA.AS', 'EURONEXT'),
(47, 'TotalEnergies SE', 'TTE.PA', 'EURONEXT'),
(48, 'Schneider Electric SE', 'SU.PA', 'EURONEXT'),
(49, 'BNP Paribas SA', 'BNP.PA', 'EURONEXT'),
(50, 'Kering SA', 'KER.PA', 'EURONEXT'),
(51, 'AXA SA', 'CS.PA', 'EURONEXT');



INSERT IGNORE INTO investments
(asset_id, customer_id, stock_id, transaction_type, quantity, transaction_amount, transaction_timestamp)
VALUES

-- Rahul Sharma (MEDIUM)

-- Rahul Sharma (MEDIUM)

(1,1,1,'BUY',50,150000.00,'2025-08-10 10:30:00'),
(2,1,18,'BUY',120,120000.00,'2025-09-14 11:15:00'),
(3,1,8,'BUY',25,85000.00,'2025-10-09 09:40:00'),
(4,1,45,'BUY',20,70000.00,'2025-11-12 13:10:00'),
(5,1,16,'BUY',40,95000.00,'2025-12-18 14:00:00'),
(6,1,47,'BUY',30,65000.00,'2026-01-20 10:20:00'),
(7,1,28,'BUY',60,55000.00,'2026-02-25 15:00:00'),

(8,1,1,'SELL',10,40000.00,'2026-04-15 11:40:00'),
(9,1,18,'SELL',8,30000.00,'2026-06-08 10:10:00'),
(10,1,47,'SELL',5,25000.00,'2026-07-18 12:20:00'),

-- Priya Nair (LOW)

-- Priya Nair (LOW)

(11,2,14,'BUY',35,80000.00,'2025-08-18 09:45:00'),
(12,2,15,'BUY',75,90000.00,'2025-09-20 11:20:00'),
(13,2,28,'BUY',80,70000.00,'2025-10-16 10:10:00'),
(14,2,32,'BUY',40,85000.00,'2025-11-14 13:00:00'),
(15,2,46,'BUY',15,65000.00,'2025-12-22 12:40:00'),
(16,2,49,'BUY',20,50000.00,'2026-01-26 11:00:00'),
(17,2,10,'BUY',30,60000.00,'2026-03-12 15:30:00'),
(18,2,4,'BUY',18,95000.00,'2026-05-18 10:50:00'),

(19,2,14,'SELL',5,20000.00,'2026-06-20 12:15:00'),
(20,2,28,'SELL',6,18000.00,'2026-07-22 09:40:00'),

-- Arjun Mehta (HIGH)

-- Arjun Mehta (HIGH)

(21,3,2,'BUY',60,180000.00,'2025-08-08 10:00:00'),
(22,3,3,'BUY',70,200000.00,'2025-09-11 11:10:00'),
(23,3,4,'BUY',55,160000.00,'2025-10-15 13:30:00'),
(24,3,7,'BUY',50,150000.00,'2025-11-18 10:45:00'),
(25,3,6,'BUY',40,90000.00,'2026-01-08 09:30:00'),
(26,3,17,'BUY',65,80000.00,'2026-02-16 14:10:00'),

(27,3,2,'SELL',20,70000.00,'2026-03-14 10:20:00'),
(28,3,3,'SELL',18,65000.00,'2026-04-20 15:10:00'),
(29,3,4,'SELL',30,45000.00,'2026-06-10 11:30:00'),
(30,3,17,'SELL',12,60000.00,'2026-07-28 13:20:00'),

-- Sneha Reddy (MEDIUM)

(31,4,3,'BUY',22,90000.00,'2025-08-12 10:15:00'),
(32,4,7,'BUY',25,85000.00,'2025-09-15 11:45:00'),
(33,4,11,'BUY',18,80000.00,'2025-10-24 12:20:00'),
(34,4,14,'BUY',28,75000.00,'2025-11-21 09:30:00'),
(35,4,49,'BUY',20,65000.00,'2025-12-28 14:40:00'),
(36,4,17,'BUY',75,70000.00,'2026-01-24 10:00:00'),
(37,4,31,'BUY',35,60000.00,'2026-03-05 11:15:00'),
(38,4,39,'BUY',40,50000.00,'2026-05-22 13:00:00'),

(39,4,14,'SELL',10,25000.00,'2026-06-28 10:30:00'),
(40,4,17,'SELL',15,30000.00,'2026-07-30 15:10:00');

INSERT IGNORE INTO assets_holdings
(
    holding_id,
    customer_id,
    stock_id,
    quantity
)
VALUES


-- Rahul Sharma

(1,1,1,40),
(2,1,18,112),
(3,1,8,25),
(4,1,45,20),
(5,1,16,40),
(6,1,47,25),
(7,1,28,60),


-- Priya Nair

(8,2,14,30),
(9,2,15,75),
(10,2,28,74),
(11,2,32,40),
(12,2,46,15),
(13,2,49,20),
(14,2,10,30),
(15,2,4,18),


-- Arjun Mehta

(16,3,2,40),
(17,3,3,52),
(18,3,4,25),
(19,3,7,50),
(20,3,6,40),
(21,3,17,53),


-- Sneha Reddy

(22,4,3,22),
(23,4,7,25),
(24,4,11,18),
(25,4,14,18),
(26,4,49,20),
(27,4,17,60),
(28,4,31,35),
(29,4,39,40);
