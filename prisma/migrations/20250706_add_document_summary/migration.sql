-- Add summary column to Document table
-- This column will store the textual summary extracted from ingestion metadata

ALTER TABLE `Document` ADD COLUMN `summary` TEXT;
