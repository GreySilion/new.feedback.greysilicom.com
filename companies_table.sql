-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: Grey_silicon_feedback_dump
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `name` text COLLATE utf8mb4_general_ci,
  `image` text COLLATE utf8mb4_general_ci,
  `domain` text COLLATE utf8mb4_general_ci,
  `address` text COLLATE utf8mb4_general_ci,
  `country` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zip` int DEFAULT NULL,
  `email` text COLLATE utf8mb4_general_ci,
  `mobile` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avg_rating` decimal(28,2) DEFAULT NULL,
  `review_count` int DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_general_ci,
  `company_status` tinyint DEFAULT NULL COMMENT 'varified = 1,\r\nclaimed = null',
  `status` tinyint DEFAULT NULL COMMENT 'pending = 0,\r\npublished = 1,\r\nrejected = 2',
  `MPESA_SHORTCODE` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MPESA_STORE_NUMBER` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MPESA_PASSKEY` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MPESA_CONSUMER_KEY` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MPESA_CONSUMER_SECRET` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Initiator` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MPESA_SECURITY_CREDS` varchar(5000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `feedback_count` int DEFAULT '0',
  `feedback_sent` int DEFAULT '0',
  `sms_sender_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `feedback_message` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-24 15:56:40
