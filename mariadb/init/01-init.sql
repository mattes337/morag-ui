-- MariaDB initialization script for Morag UI
-- This script runs when the MariaDB container starts for the first time

-- Ensure the database exists
CREATE DATABASE IF NOT EXISTS morag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON morag.* TO 'morag_user'@'%';
FLUSH PRIVILEGES;

-- Set some optimizations for the database
SET GLOBAL innodb_buffer_pool_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_file_per_table = 1;
SET GLOBAL innodb_flush_log_at_trx_commit = 2;

-- Log the initialization
SELECT 'MariaDB initialization completed for Morag UI' AS message;
