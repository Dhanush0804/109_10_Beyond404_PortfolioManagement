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
(stock_id, company_name, sector)
VALUES

(1, 'Tata Consultancy Services', 'IT'),
(2, 'Infosys Limited', 'IT'),
(3, 'Wipro Limited', 'IT'),
(4, 'HCL Technologies', 'IT'),
(5, 'Tech Mahindra', 'IT'),

(6, 'Reliance Industries', 'Energy'),
(7, 'ONGC Limited', 'Energy'),
(8, 'Adani Enterprises', 'Infrastructure'),
(9, 'NTPC Limited', 'Power'),
(10, 'Power Grid Corporation', 'Power'),

(11, 'HDFC Bank', 'Banking'),
(12, 'ICICI Bank', 'Banking'),
(13, 'State Bank of India', 'Banking'),
(14, 'Axis Bank', 'Banking'),
(15, 'Kotak Mahindra Bank', 'Banking'),

(16, 'ITC Limited', 'FMCG'),
(17, 'Hindustan Unilever', 'FMCG'),
(18, 'Nestle India', 'FMCG'),
(19, 'Britannia Industries', 'FMCG'),
(20, 'Dabur India', 'FMCG'),

(21, 'Tata Motors', 'Automobile'),
(22, 'Maruti Suzuki', 'Automobile'),
(23, 'Mahindra and Mahindra', 'Automobile'),
(24, 'Bajaj Auto', 'Automobile'),
(25, 'Hero MotoCorp', 'Automobile'),

(26, 'Sun Pharmaceutical', 'Healthcare'),
(27, 'Dr Reddys Laboratories', 'Healthcare'),
(28, 'Cipla Limited', 'Healthcare'),

(29, 'Larsen and Toubro', 'Construction'),
(30, 'UltraTech Cement', 'Cement'),

(31, 'Asian Paints', 'Consumer'),
(32, 'Titan Company', 'Consumer'),

(33, 'Coal India', 'Mining'),
(34, 'Tata Steel', 'Metal'),
(35, 'JSW Steel', 'Metal'),

(36, 'Zomato Limited', 'Technology'),
(37, 'Paytm', 'Technology'),
(38, 'Bharat Electronics', 'Defence'),
(39, 'Indian Oil Corporation', 'Energy'),
(40, 'Vedanta Limited', 'Metal');



-- =========================
-- INVESTMENTS DATA
-- =========================

INSERT IGNORE INTO investments
(asset_id, customer_id, stock_id, transaction_type, transaction_amount, transaction_timestamp)
VALUES


-- Rahul Sharma Portfolio
(1, 1, 1, 'BUY', 150000, '2025-01-15 10:30:00'),
(2, 1, 6, 'BUY', 100000, '2025-02-10 11:00:00'),
(3, 1, 11, 'BUY', 80000, '2025-03-12 09:45:00'),
(4, 1, 21, 'BUY', 60000, '2025-04-05 14:20:00'),
(5, 1, 16, 'BUY', 50000, '2025-05-01 12:00:00'),
(6, 1, 31, 'SELL', 20000, '2025-06-10 10:15:00'),
(7, 1, 26, 'BUY', 40000, '2025-07-01 13:10:00'),
(8, 1, 29, 'BUY', 70000, '2025-08-12 11:30:00'),
(9, 1, 34, 'SELL', 30000, '2025-09-15 15:00:00'),
(10,1, 2, 'BUY', 90000, '2025-10-20 10:40:00'),



-- Priya Nair Portfolio
(11,2,11,'BUY',120000,'2025-01-20 10:00:00'),
(12,2,13,'BUY',100000,'2025-02-15 11:30:00'),
(13,2,16,'BUY',90000,'2025-03-01 12:00:00'),
(14,2,17,'BUY',70000,'2025-04-10 14:00:00'),
(15,2,18,'BUY',60000,'2025-05-15 09:30:00'),
(16,2,26,'BUY',50000,'2025-06-20 11:20:00'),
(17,2,31,'SELL',25000,'2025-07-05 13:40:00'),
(18,2,21,'BUY',40000,'2025-08-18 10:15:00'),
(19,2,32,'BUY',45000,'2025-09-12 15:10:00'),
(20,2,30,'SELL',20000,'2025-10-25 12:30:00'),



-- Arjun Mehta Portfolio
(21,3,6,'BUY',200000,'2025-01-05 10:00:00'),
(22,3,8,'BUY',150000,'2025-02-08 11:10:00'),
(23,3,36,'BUY',90000,'2025-03-15 12:30:00'),
(24,3,37,'BUY',70000,'2025-04-20 14:30:00'),
(25,3,34,'BUY',60000,'2025-05-25 09:20:00'),
(26,3,39,'SELL',30000,'2025-06-30 11:45:00'),
(27,3,23,'BUY',80000,'2025-07-15 10:30:00'),
(28,3,22,'BUY',75000,'2025-08-22 13:00:00'),
(29,3,40,'SELL',25000,'2025-09-10 15:30:00'),
(30,3,38,'BUY',50000,'2025-10-18 12:00:00'),



-- Sneha Reddy Portfolio
(31,4,1,'BUY',110000,'2025-01-10 10:30:00'),
(32,4,4,'BUY',90000,'2025-02-14 11:00:00'),
(33,4,12,'BUY',120000,'2025-03-18 13:20:00'),
(34,4,15,'BUY',70000,'2025-04-22 10:10:00'),
(35,4,19,'BUY',50000,'2025-05-30 12:40:00'),
(36,4,27,'BUY',60000,'2025-06-15 14:10:00'),
(37,4,29,'SELL',30000,'2025-07-25 11:30:00'),
(38,4,33,'BUY',40000,'2025-08-08 15:00:00'),
(39,4,35,'BUY',55000,'2025-09-20 10:20:00'),
(40,4,25,'SELL',20000,'2025-10-28 13:50:00');