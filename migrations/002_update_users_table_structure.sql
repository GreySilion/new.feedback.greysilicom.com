-- Drop existing users table if it exists
DROP TABLE IF EXISTS users;

-- Create new users table with the structure from the screenshot
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  email_verified DATETIME NULL,
  image VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  mobile VARCHAR(20) NULL,
  role ENUM('ADMIN', 'USER') DEFAULT 'USER',
  is_two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_confirmed_at DATETIME NULL,
  is_oauth BOOLEAN DEFAULT FALSE,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires DATETIME NULL,
  verification_token VARCHAR(255) NULL,
  verification_token_expires DATETIME NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  -- Add indexes for better query performance
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_mobile_index` (`mobile`),
  KEY `users_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
