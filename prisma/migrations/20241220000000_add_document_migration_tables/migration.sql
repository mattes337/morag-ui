-- CreateTable
CREATE TABLE `document_migrations` (
    `id` VARCHAR(191) NOT NULL,
    `sourceRealmId` VARCHAR(191) NOT NULL,
    `targetRealmId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalDocuments` INTEGER NOT NULL DEFAULT 0,
    `processedDocuments` INTEGER NOT NULL DEFAULT 0,
    `failedDocuments` INTEGER NOT NULL DEFAULT 0,
    `migrationOptions` LONGTEXT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `document_migrations_sourceRealmId_fkey` (`sourceRealmId`),
    INDEX `document_migrations_targetRealmId_fkey` (`targetRealmId`),
    INDEX `document_migrations_createdBy_fkey` (`createdBy`),
    INDEX `document_migrations_status_idx` (`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_migration_items` (
    `id` VARCHAR(191) NOT NULL,
    `migrationId` VARCHAR(191) NOT NULL,
    `sourceDocumentId` VARCHAR(191) NOT NULL,
    `targetDocumentId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` TEXT NULL,
    `migratedStages` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `document_migration_items_migrationId_fkey` (`migrationId`),
    INDEX `document_migration_items_sourceDocumentId_fkey` (`sourceDocumentId`),
    INDEX `document_migration_items_targetDocumentId_fkey` (`targetDocumentId`),
    INDEX `document_migration_items_status_idx` (`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_migrations` ADD CONSTRAINT `document_migrations_sourceRealmId_fkey` FOREIGN KEY (`sourceRealmId`) REFERENCES `realms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_migrations` ADD CONSTRAINT `document_migrations_targetRealmId_fkey` FOREIGN KEY (`targetRealmId`) REFERENCES `realms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_migrations` ADD CONSTRAINT `document_migrations_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_migration_items` ADD CONSTRAINT `document_migration_items_migrationId_fkey` FOREIGN KEY (`migrationId`) REFERENCES `document_migrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_migration_items` ADD CONSTRAINT `document_migration_items_sourceDocumentId_fkey` FOREIGN KEY (`sourceDocumentId`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_migration_items` ADD CONSTRAINT `document_migration_items_targetDocumentId_fkey` FOREIGN KEY (`targetDocumentId`) REFERENCES `documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;