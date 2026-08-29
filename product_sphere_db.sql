-- Product Sphere B2B Local Market Database Schema
-- SQL File for importing into MySQL (via phpMyAdmin or Command Line)

CREATE DATABASE IF NOT EXISTS `b2b_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `b2b_app`;

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
  `shop_picture` LONGTEXT DEFAULT NULL,
  `cnic_front` LONGTEXT DEFAULT NULL,
  `cnic_back` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Dumping data for table `users` (Strictly 3 default users)
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `gender`, `status`, `license_no`, `business_address`, `shop_picture`, `cnic_front`, `cnic_back`) VALUES
(1, 'System Admin', 'admin@productsphere.com', 'adminpassword', 'admin', '03001234567', 'male', 'approved', NULL, NULL, NULL, NULL, NULL),
(2, 'Wholesaler User', 'wholesaler@productsphere.com', 'wholesalerpassword', 'wholesaler', '03007654321', 'male', 'approved', 'TX-998827-B', 'Karkhana Bazar, Faisalabad, Punjab', NULL, NULL, NULL),
(3, 'Buyer User', 'buyer@productsphere.com', 'buyerpassword', 'buyer', '03211234567', 'female', 'approved', NULL, NULL, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE id=id;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT DEFAULT 1,
  `category` VARCHAR(100) NOT NULL,
  `wholesaler_id` INT NOT NULL,
  `wholesaler_name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `product_image` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`wholesaler_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) UNIQUE NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyer_id` INT NOT NULL,
  `buyer_name` VARCHAR(255) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL COMMENT 'cash, online',
  `payment_status` VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, paid',
  `status` VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, shipped, delivered',
  `items` TEXT NOT NULL COMMENT 'JSON array of items',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `negotiations`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `negotiations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyer_id` INT NOT NULL,
  `buyer_name` VARCHAR(255) NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `bid_price` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, accepted, rejected',
  `message` TEXT,
  `wholesaler_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `system_settings`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `system_settings` (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;