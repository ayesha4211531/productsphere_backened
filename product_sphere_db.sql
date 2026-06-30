-- Product Sphere B2B Local Market Database Schema
-- SQL File for importing into MySQL (via phpMyAdmin or Command Line)

CREATE DATABASE IF NOT EXISTS `product_sphere_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `product_sphere_db`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'admin, buyer, wholesaler',
  `phone` VARCHAR(50) DEFAULT NULL,
  `gender` VARCHAR(50) DEFAULT 'male',
  `status` VARCHAR(50) DEFAULT 'approved' COMMENT 'approved, pending, rejected',
  `license_no` VARCHAR(100) DEFAULT NULL,
  `business_address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Dumping data for table `users`
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `gender`) VALUES
(1, 'System Admin', 'admin@productsphere.com', 'adminpassword', 'admin', '03001234567', 'male'),
(2, 'Wholesaler User', 'wholesaler@productsphere.com', 'wholesalerpassword', 'wholesaler', '03007654321', 'male'),
(3, 'Buyer User', 'buyer@productsphere.com', 'buyerpassword', 'buyer', '03211234567', 'female')
ON DUPLICATE KEY UPDATE id=id;
