-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: farmacia_control
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `farmacia_control`
--

/*!40000 DROP DATABASE IF EXISTS `farmacia_control`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `farmacia_control` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `farmacia_control`;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,1,'2026-03-01','2026-06-01',20),(2,1,'2026-03-20','2026-04-10',15);
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `proveedor` varchar(100) NOT NULL,
  `presentacion_venta` varchar(50) NOT NULL DEFAULT 'Unidad',
  `unidades_por_presentacion` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Amoxicilina 500mg','Medicamentos',1.20,2.00,100,'Farmaceutica Central','Unidad',1),(4,'Acetaminofen 500mg','Medicamentos',4.75,8.50,101,'Farmaceutica Central','Blister',10),(5,'Ibuprofeno 400mg','Medicamentos',7.00,12.00,90,'Farmaceutica Central','Blister',10),(6,'Loratadina 10mg','Medicamentos',6.00,10.00,75,'Distribuidora Salud','Blister',10),(7,'Omeprazol 20mg','Medicamentos',1.10,2.00,80,'Distribuidora Salud','Unidad',1),(8,'Vitamina C 500mg','Vitaminas',28.00,45.00,30,'NutriFarma','Frasco',60),(9,'Complejo B','Vitaminas',24.00,40.00,25,'NutriFarma','Frasco',30),(10,'Multivitaminico Adulto','Vitaminas',65.00,95.00,18,'VitaPlus','Frasco',60),(11,'Zinc 50mg','Vitaminas',22.00,38.00,24,'VitaPlus','Frasco',30),(12,'Alcohol 70% 120ml','Cuidado personal',4.00,7.50,35,'Insumos Medicos GT','Frasco',1),(13,'Gel antibacterial 250ml','Cuidado personal',6.25,11.00,28,'Insumos Medicos GT','Frasco',1),(14,'Jabon antibacterial','Cuidado personal',3.50,6.50,40,'Higiene Total','Unidad',1),(15,'Suero oral sabor fresa','Cuidado personal',3.75,6.75,32,'Higiene Total','Sobre',1),(16,'Gasas esteriles paquete','Primeros auxilios',2.25,4.50,50,'Medisuministros','Caja',100),(17,'Vendas elasticas 5cm','Primeros auxilios',4.50,8.00,25,'Medisuministros','Unidad',1),(18,'Curitas caja pequena','Primeros auxilios',5.25,9.50,30,'Botiquin Express','Caja',100),(19,'Agua oxigenada 120ml','Primeros auxilios',3.10,6.00,20,'Botiquin Express','Frasco',1),(35,'Amoxicilina 500mg','Medicamentos',11.00,18.00,45,'Farmaceutica Central','Blister',10),(36,'Amoxicilina 500mg','Medicamentos',95.00,155.00,12,'Farmaceutica Central','Caja',100),(37,'Acetaminofen 500mg','Medicamentos',0.55,1.00,240,'Farmaceutica Central','Unidad',1),(38,'Acetaminofen 500mg','Medicamentos',42.00,70.00,15,'Farmaceutica Central','Caja',100),(39,'Ibuprofeno 400mg','Medicamentos',0.80,1.50,220,'Farmaceutica Central','Unidad',1),(40,'Ibuprofeno 400mg','Medicamentos',65.00,105.00,10,'Farmaceutica Central','Caja',100),(41,'Loratadina 10mg','Medicamentos',0.70,1.25,180,'Distribuidora Salud','Unidad',1),(42,'Loratadina 10mg','Medicamentos',55.00,92.00,8,'Distribuidora Salud','Caja',100),(43,'Omeprazol 20mg','Medicamentos',13.50,24.00,35,'Distribuidora Salud','Blister',14),(44,'Omeprazol 20mg','Medicamentos',26.00,45.00,10,'Distribuidora Salud','Caja',28),(45,'Vitamina C 500mg','Vitaminas',0.65,1.25,200,'NutriFarma','Unidad',1),(46,'Vitamina C 500mg','Vitaminas',6.00,10.50,60,'NutriFarma','Blister',10),(47,'Complejo B','Vitaminas',0.90,1.75,160,'NutriFarma','Unidad',1),(48,'Complejo B','Vitaminas',8.00,14.00,46,'NutriFarma','Blister',10),(49,'Multivitaminico Adulto','Vitaminas',1.80,3.50,90,'VitaPlus','Unidad',1),(50,'Multivitaminico Adulto','Vitaminas',16.00,28.00,35,'VitaPlus','Blister',10),(51,'Zinc 50mg','Vitaminas',0.75,1.50,130,'VitaPlus','Unidad',1),(52,'Zinc 50mg','Vitaminas',7.00,12.00,45,'VitaPlus','Blister',10),(53,'Alcohol 70% 120ml','Cuidado personal',45.00,78.00,9,'Insumos Medicos GT','Caja',12),(54,'Gel antibacterial 250ml','Cuidado personal',72.00,125.00,8,'Insumos Medicos GT','Caja',12),(55,'Jabon antibacterial','Cuidado personal',75.00,132.00,8,'Higiene Total','Caja',24),(56,'Suero oral sabor fresa','Cuidado personal',85.00,150.00,6,'Higiene Total','Caja',25),(57,'Vendas elasticas 5cm','Primeros auxilios',48.00,84.00,9,'Medisuministros','Caja',12),(58,'Agua oxigenada 120ml','Primeros auxilios',34.00,62.00,2,'Botiquin Express','Caja',12),(59,'Ibuwin','Medicamentos',14.00,18.00,3,'Central','Blister',5),(61,'Colageno','Vitaminas',20.00,25.00,9,'central','Frasco',2);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador General','admin@farmacia.com','123456','Administrador'),(2,'Encargado de Inventario','inventario@farmacia.com','123456','Inventario'),(3,'Usuario Prueba','prueba@farmacia.com','123456','Ventas');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `cliente` varchar(150) NOT NULL DEFAULT 'Consumidor final',
  `numero_factura` varchar(30) NOT NULL DEFAULT '',
  `fecha` datetime NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,1,'Consumidor final','FAC-000001','2026-03-31 23:48:12',2,15.00,30.00),(2,1,'Consumidor final','FAC-000002','2026-05-05 23:48:17',2,15.00,30.00),(3,1,'Consumidor final','FAC-000003','2026-05-06 00:06:54',3,15.00,45.00),(4,1,'Consumidor final','FAC-000004','2026-05-09 12:11:45',3,15.00,45.00),(5,37,'Consumidor final','FAC-000005','2026-05-25 22:11:39',1,1.00,1.00),(6,4,'Consumidor final','FAC-000006','2026-05-25 22:20:06',2,8.50,17.00),(7,59,'Consumidor final','FAC-000007','2026-05-25 22:37:41',2,18.00,36.00),(8,4,'Consumidor final','FAC-000008','2026-05-25 23:17:19',3,8.50,25.50),(9,4,'Consumidor final','FAC-000009','2026-05-27 21:16:46',3,8.50,25.50),(10,58,'Consumidor final','FAC-000010','2026-05-27 21:59:43',3,62.00,186.00),(11,58,'Consumidor final','FAC-000011','2026-05-27 22:01:40',2,62.00,124.00),(12,48,'Consumidor final','FAC-000012','2026-05-27 22:05:30',4,14.00,56.00),(13,4,'Anderson Ariana','FAC-000013','2026-05-27 22:25:09',2,8.50,17.00),(14,53,'Anderson Ariana','FAC-000013','2026-05-27 22:25:09',1,78.00,78.00),(15,4,'Alexander','FAC-000015','2026-05-27 23:25:21',5,8.50,42.50),(16,37,'Alexander','FAC-000015','2026-05-27 23:25:21',9,1.00,9.00),(17,4,'Abadio','FAC-000017','2026-05-30 10:59:57',2,8.50,17.00),(18,4,'Mario','FAC-000018','2026-05-30 12:13:18',2,8.50,17.00),(19,61,'Mario','FAC-000018','2026-05-30 12:13:18',1,25.00,25.00);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'farmacia_control'
--

--
-- Dumping routines for database 'farmacia_control'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 22:20:36
