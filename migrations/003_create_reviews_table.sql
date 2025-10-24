-- Update reviews table for feedback system

-- 1. Modify existing columns
ALTER TABLE reviews
  MODIFY COLUMN status ENUM('pending', 'replied') DEFAULT 'pending',
  MODIFY COLUMN uid VARCHAR(36) NOT NULL;

-- 2. Add replied_at column if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'reviews'
    AND COLUMN_NAME = 'replied_at'
    AND TABLE_SCHEMA = DATABASE()
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE reviews ADD COLUMN replied_at TIMESTAMP NULL AFTER reply;',
  'SELECT "Column replied_at already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add indexes safely
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_NAME = 'reviews'
    AND INDEX_NAME = 'idx_reviews_uid'
    AND TABLE_SCHEMA = DATABASE()
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE reviews ADD UNIQUE INDEX idx_reviews_uid (uid);',
  'SELECT "Index idx_reviews_uid already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_NAME = 'reviews'
    AND INDEX_NAME = 'idx_reviews_status'
    AND TABLE_SCHEMA = DATABASE()
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE reviews ADD INDEX idx_reviews_status (status);',
  'SELECT "Index idx_reviews_status already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_NAME = 'reviews'
    AND INDEX_NAME = 'idx_reviews_created_at'
    AND TABLE_SCHEMA = DATABASE()
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE reviews ADD INDEX idx_reviews_created_at (created_at);',
  'SELECT "Index idx_reviews_created_at already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_NAME = 'reviews'
    AND INDEX_NAME = 'idx_reviews_rating'
    AND TABLE_SCHEMA = DATABASE()
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE reviews ADD INDEX idx_reviews_rating (rating);',
  'SELECT "Index idx_reviews_rating already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
