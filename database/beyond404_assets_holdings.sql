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
-- Table structure for table `assets_holdings`
--

DROP TABLE IF EXISTS `assets_holdings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets_holdings` (
  `holding_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `stock_id` bigint NOT NULL,
  `quantity` double NOT NULL,
  PRIMARY KEY (`holding_id`),
  UNIQUE KEY `unique_customer_stock_holding` (`customer_id`,`stock_id`),
  KEY `fk_asset_stock` (`stock_id`),
  CONSTRAINT `fk_asset_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `fk_asset_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`stock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets_holdings`
--

LOCK TABLES `assets_holdings` WRITE;
/*!40000 ALTER TABLE `assets_holdings` DISABLE KEYS */;
INSERT INTO `assets_holdings` VALUES (1,1,1,40),(2,1,18,112),(3,1,8,25),(4,1,45,20),(5,1,16,40),(6,1,47,25),(7,1,28,60),(8,2,14,30),(9,2,15,75),(10,2,28,74),(11,2,32,40),(12,2,46,15),(13,2,49,20),(14,2,10,30),(15,2,4,18),(16,3,2,40),(17,3,3,52),(18,3,4,25),(19,3,7,50),(20,3,6,40),(21,3,17,53),(22,4,3,22),(23,4,7,25),(24,4,11,18),(25,4,14,18),(26,4,49,20),(27,4,17,60),(28,4,31,35),(29,4,39,40);
/*!40000 ALTER TABLE `assets_holdings` ENABLE KEYS */;
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
