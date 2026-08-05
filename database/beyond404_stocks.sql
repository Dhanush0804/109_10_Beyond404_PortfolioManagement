CREATE DATABASE  IF NOT EXISTS `beyond404` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `beyond404`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: beyond404
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `stock_id` bigint NOT NULL AUTO_INCREMENT,
  `stock_name` varchar(150) NOT NULL,
  `ticker` varchar(20) NOT NULL,
  `stock_market` enum('NYSE','NASDAQ','EURONEXT','NSE','BSE') NOT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `uk_ticker_market` (`ticker`,`stock_market`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,'Apple Inc.','AAPL','NASDAQ'),(2,'Microsoft Corporation','MSFT','NASDAQ'),(3,'NVIDIA Corporation','NVDA','NASDAQ'),(4,'Alphabet Inc.','GOOG','NASDAQ'),(5,'Broadcom Inc.','AVGO','NASDAQ'),(6,'Costco Wholesale Corporation','COST','NASDAQ'),(7,'Adobe Inc.','ADBE','NASDAQ'),(8,'JPMorgan Chase & Co.','JPM','NYSE'),(9,'Bank of America Corporation','BAC','NYSE'),(10,'Morgan Stanley','MS','NYSE'),(11,'Berkshire Hathaway Inc.','BRK-B','NYSE'),(12,'Johnson & Johnson','JNJ','NYSE'),(13,'Procter & Gamble Company','PG','NYSE'),(14,'Coca-Cola Company','KO','NYSE'),(15,'ICICI Bank Limited','ICICIBANK.NS','NSE'),(16,'HDFC Bank Limited','HDFCBANK.NS','NSE'),(17,'Infosys Limited','INFY.NS','NSE'),(18,'Tata Consultancy Services Limited','TCS.NS','NSE'),(19,'Reliance Industries Limited','RELIANCE.NS','NSE'),(20,'Axis Bank Limited','AXISBANK.NS','NSE'),(21,'Wipro Limited','WIPRO.NS','NSE'),(22,'Kotak Mahindra Bank Limited','KOTAKBANK.NS','NSE'),(23,'Larsen & Toubro Limited','LT.NS','NSE'),(24,'Bajaj Auto Limited','BAJAJ-AUTO.NS','NSE'),(25,'Maruti Suzuki India Limited','MARUTI.NS','NSE'),(26,'HCL Technologies Limited','HCLTECH.NS','NSE'),(27,'Tech Mahindra Limited','TECHM.NS','NSE'),(28,'ITC Limited','ITC.NS','NSE'),(29,'Bharti Airtel Limited','BHARTIARTL.NS','NSE'),(30,'Nestle India Limited','NESTLEIND.NS','NSE'),(31,'NTPC Limited','NTPC.NS','NSE'),(32,'Reliance Industries Limited','RELIANCE.BO','BSE'),(33,'ICICI Bank Limited','ICICIBANK.BO','BSE'),(34,'Tata Consultancy Services Limited','TCS.BO','BSE'),(35,'Bajaj Auto Limited','BAJAJ-AUTO.BO','BSE'),(36,'Maruti Suzuki India Limited','MARUTI.BO','BSE'),(37,'ITC Limited','ITC.BO','BSE'),(38,'Bharti Airtel Limited','BHARTIARTL.BO','BSE'),(39,'Titan Company Limited','TITAN.BO','BSE'),(40,'UltraTech Cement Limited','ULTRACEMCO.BO','BSE'),(41,'Bajaj Finance Limited','BAJFINANCE.BO','BSE'),(42,'Sun Pharmaceutical Industries Limited','SUNPHARMA.BO','BSE'),(43,'Power Grid Corporation of India Limited','POWERGRID.BO','BSE'),(44,'State Bank of India','SBIN.BO','BSE'),(45,'ASML Holding N.V.','ASML.AS','EURONEXT'),(46,'Unilever PLC','UNA.AS','EURONEXT'),(47,'TotalEnergies SE','TTE.PA','EURONEXT'),(48,'Schneider Electric SE','SU.PA','EURONEXT'),(49,'BNP Paribas SA','BNP.PA','EURONEXT'),(50,'Kering SA','KER.PA','EURONEXT'),(51,'AXA SA','CS.PA','EURONEXT');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-05 15:03:55
