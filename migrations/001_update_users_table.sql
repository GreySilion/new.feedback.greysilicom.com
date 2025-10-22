-- Migration to update users table structure
-- This preserves existing data while adding new columns

-- First, check if the columns exist before adding them
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'username';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ),
  "ALTER TABLE users 
   ADD COLUMN username VARCHAR(255) NULL AFTER id,
   ADD COLUMN email_verified DATETIME NULL,
   ADD COLUMN image VARCHAR(255) NULL,
   ADD COLUMN mobile VARCHAR(20) NULL,
   ADD COLUMN role ENUM('ADMIN', 'USER') DEFAULT 'USER' NULL,
   ADD COLUMN is_two_factor_enabled BOOLEAN DEFAULT FALSE NULL,
   ADD COLUMN two_factor_confirmed_at DATETIME NULL,
   ADD COLUMN is_oauth BOOLEAN DEFAULT FALSE NULL,
   ADD COLUMN password_reset_token VARCHAR(255) NULL,
   ADD COLUMN password_reset_expires DATETIME NULL,
   ADD COLUMN verification_token VARCHAR(255) NULL,
   ADD COLUMN verification_token_expires DATETIME NULL,
   ADD COLUMN is_verified BOOLEAN DEFAULT FALSE NULL,
   ADD COLUMN last_login_at DATETIME NULL,
   ADD COLUMN updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
   ADD COLUMN deleted_at DATETIME NULL,
   MODIFY COLUMN email VARCHAR(255) NULL,
   MODIFY COLUMN password VARCHAR(255) NULL,
   ADD UNIQUE INDEX idx_users_email (email) WHERE deleted_at IS NULL,
   ADD UNIQUE INDEX idx_users_username (username) WHERE deleted_at IS NULL,
   ADD INDEX idx_users_mobile (mobile) WHERE deleted_at IS NULL;",
  'SELECT 1'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update existing records to set default values if needed
-- For example, set is_verified to true for existing users
-- UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;

-- Add any additional indexes or constraints as needed
