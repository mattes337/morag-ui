-- Add ingestionMetadata column to Document table
-- This column will store JSON metadata from document processing including
-- entities, relations, chunks, and processing statistics

ALTER TABLE `Document` ADD COLUMN `ingestionMetadata` JSON;
