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
(4, 'Amazon.com Inc.', 'AMZN', 'NASDAQ'),
(5, 'Alphabet Inc. Class A', 'GOOGL', 'NASDAQ'),
(6, 'Meta Platforms Inc.', 'META', 'NASDAQ'),
(7, 'Tesla Inc.', 'TSLA', 'NASDAQ'),
(8, 'Netflix Inc.', 'NFLX', 'NASDAQ'),
(9, 'Adobe Inc.', 'ADBE', 'NASDAQ'),
(10, 'Intel Corporation', 'INTC', 'NASDAQ'),
(11, 'Advanced Micro Devices', 'AMD', 'NASDAQ'),
(12, 'Cisco Systems Inc.', 'CSCO', 'NASDAQ'),

-- ==========================
-- NYSE
-- ==========================

(13, 'JPMorgan Chase & Co.', 'JPM', 'NYSE'),
(14, 'Visa Inc.', 'V', 'NYSE'),
(15, 'The Coca-Cola Company', 'KO', 'NYSE'),
(16, 'The Walt Disney Company', 'DIS', 'NYSE'),
(17, 'Goldman Sachs Group', 'GS', 'NYSE'),
(18, 'International Business Machines', 'IBM', 'NYSE'),
(19, 'The Boeing Company', 'BA', 'NYSE'),
(20, 'Exxon Mobil Corporation', 'XOM', 'NYSE'),
(21, 'Pfizer Inc.', 'PFE', 'NYSE'),
(22, 'Shell plc', 'SHEL', 'NYSE'),

-- ==========================
-- EURONEXT
-- ==========================

(23, 'ASML Holding N.V.', 'ASML', 'EURONEXT'),
(24, 'Airbus SE', 'AIR', 'EURONEXT'),
(25, 'TotalEnergies SE', 'TTE', 'EURONEXT'),
(26, 'Stellantis N.V.', 'STLAM', 'EURONEXT'),
(27, 'L''Oréal S.A.', 'OR', 'EURONEXT'),
(28, 'Sanofi S.A.', 'SAN', 'EURONEXT'),
(29, 'Danone S.A.', 'BN', 'EURONEXT'),
(30, 'BNP Paribas', 'BNP', 'EURONEXT'),
(31, 'Société Générale', 'GLE', 'EURONEXT'),
(32, 'ArcelorMittal', 'MT', 'EURONEXT'),

-- ==========================
-- NSE
-- ==========================

(33, 'Reliance Industries Ltd.', 'RELIANCE', 'NSE'),
(34, 'Tata Consultancy Services', 'TCS', 'NSE'),
(35, 'Infosys Limited', 'INFY', 'NSE'),
(36, 'HDFC Bank Ltd.', 'HDFCBANK', 'NSE'),
(37, 'ICICI Bank Ltd.', 'ICICIBANK', 'NSE'),
(38, 'State Bank of India', 'SBIN', 'NSE'),
(39, 'Wipro Limited', 'WIPRO', 'NSE'),
(40, 'ITC Limited', 'ITC', 'NSE'),
(41, 'Tata Motors Ltd.', 'TATAMOTORS', 'NSE'),
(42, 'Larsen & Toubro Ltd.', 'LT', 'NSE'),

-- ==========================
-- BSE
-- ==========================

(43, 'Reliance Industries Ltd.', 'RELIANCE', 'BSE'),
(44, 'Tata Consultancy Services', 'TCS', 'BSE'),
(45, 'Infosys Limited', 'INFY', 'BSE'),
(46, 'HDFC Bank Ltd.', 'HDFCBANK', 'BSE'),
(47, 'ICICI Bank Ltd.', 'ICICIBANK', 'BSE'),
(48, 'State Bank of India', 'SBIN', 'BSE'),
(49, 'Wipro Limited', 'WIPRO', 'BSE'),
(50, 'Sun Pharmaceutical Industries', 'SUNPHARMA', 'BSE'),
(51, 'Bajaj Finance Ltd.', 'BAJFINANCE', 'BSE'),
(52, 'Asian Paints Ltd.', 'ASIANPAINT', 'BSE');



INSERT IGNORE INTO investments
(asset_id, customer_id, stock_id, transaction_type, quantity, transaction_amount, transaction_timestamp)
VALUES

-- Rahul Sharma (MEDIUM)

(1,1,1,'BUY',50,150000,'2025-08-10 10:30:00'),
(2,1,34,'BUY',120,120000,'2025-09-14 11:15:00'),
(3,1,13,'BUY',25,85000,'2025-10-09 09:40:00'),
(4,1,23,'BUY',20,70000,'2025-11-12 13:10:00'),
(5,1,36,'BUY',40,95000,'2025-12-18 14:00:00'),
(6,1,25,'BUY',30,65000,'2026-01-20 10:20:00'),
(7,1,40,'BUY',60,55000,'2026-02-25 15:00:00'),

(8,1,7,'SELL',10,40000,'2026-04-15 11:40:00'),
(9,1,18,'SELL',8,30000,'2026-06-08 10:10:00'),
(10,1,46,'SELL',5,25000,'2026-07-18 12:20:00'),

-- Priya Nair (LOW)

(11,2,15,'BUY',35,80000,'2025-08-18 09:45:00'),
(12,2,37,'BUY',75,90000,'2025-09-20 11:20:00'),
(13,2,40,'BUY',80,70000,'2025-10-16 10:10:00'),
(14,2,43,'BUY',40,85000,'2025-11-14 13:00:00'),
(15,2,24,'BUY',15,65000,'2025-12-22 12:40:00'),
(16,2,29,'BUY',20,50000,'2026-01-26 11:00:00'),
(17,2,20,'BUY',30,60000,'2026-03-12 15:30:00'),
(18,2,4,'BUY',18,95000,'2026-05-18 10:50:00'),

(19,2,27,'SELL',5,20000,'2026-06-20 12:15:00'),
(20,2,41,'SELL',6,18000,'2026-07-22 09:40:00'),

-- Arjun Mehta (HIGH)

(21,3,2,'BUY',60,180000,'2025-08-08 10:00:00'),
(22,3,3,'BUY',70,200000,'2025-09-11 11:10:00'),
(23,3,5,'BUY',55,160000,'2025-10-15 13:30:00'),
(24,3,6,'BUY',50,150000,'2025-11-18 10:45:00'),
(25,3,10,'BUY',40,90000,'2026-01-08 09:30:00'),
(26,3,35,'BUY',65,80000,'2026-02-16 14:10:00'),

(27,3,21,'SELL',20,70000,'2026-03-14 10:20:00'),
(28,3,31,'SELL',18,65000,'2026-04-20 15:10:00'),
(29,3,49,'SELL',30,45000,'2026-06-10 11:30:00'),
(30,3,26,'SELL',12,60000,'2026-07-28 13:20:00'),

-- Sneha Reddy (MEDIUM)

(31,4,8,'BUY',22,90000,'2025-08-12 10:15:00'),
(32,4,9,'BUY',25,85000,'2025-09-15 11:45:00'),
(33,4,16,'BUY',18,80000,'2025-10-24 12:20:00'),
(34,4,22,'BUY',28,75000,'2025-11-21 09:30:00'),
(35,4,30,'BUY',20,65000,'2025-12-28 14:40:00'),
(36,4,38,'BUY',75,70000,'2026-01-24 10:00:00'),
(37,4,42,'BUY',35,60000,'2026-03-05 11:15:00'),
(38,4,52,'BUY',40,50000,'2026-05-22 13:00:00'),

(39,4,32,'SELL',10,25000,'2026-06-28 10:30:00'),
(40,4,47,'SELL',15,30000,'2026-07-30 15:10:00');