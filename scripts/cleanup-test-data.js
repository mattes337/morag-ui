#!/usr/bin/env node

/**
 * Database Cleanup Script for Testing
 * 
 * Deletes all documents and resets the database to a fresh state for testing.
 * 
 * Usage:
 *   node scripts/cleanup-test-data.js                     # Delete all documents
 *   node scripts/cleanup-test-data.js --documents-only   # Only delete documents
 *   node scripts/cleanup-test-data.js --jobs-only        # Only delete jobs
 *   node scripts/cleanup-test-data.js --full-reset       # Full database reset
 *   node scripts/cleanup-test-data.js --confirm          # Skip confirmation prompt
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const prisma = new PrismaClient();

class DatabaseCleaner {
  constructor() {
    this.deletedCounts = {
      documents: 0,
      jobs: 0,
      processingJobs: 0,
      documentFiles: 0,
      documentChunks: 0,
      stageExecutions: 0,
      processingErrors: 0,
      facts: 0,
      entities: 0
    };
  }

  async initialize() {
    console.log('🧹 Initializing Database Cleaner...');
  }

  async confirmAction(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async getDocumentStats() {
    const stats = await prisma.document.groupBy({
      by: ['type', 'state'],
      _count: {
        id: true
      }
    });

    const totalDocuments = await prisma.document.count();
    const totalJobs = await prisma.job.count();
    const totalProcessingJobs = await prisma.processingJob.count();

    return {
      totalDocuments,
      totalJobs,
      totalProcessingJobs,
      byTypeAndState: stats
    };
  }

  async deleteDocumentFiles() {
    console.log('🗂️ Deleting document files...');
    
    // Get all document files to delete physical files
    const documentFiles = await prisma.documentFile.findMany({
      select: {
        id: true,
        filepath: true,
        filename: true
      }
    });

    let physicalFilesDeleted = 0;
    
    for (const file of documentFiles) {
      try {
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
          physicalFilesDeleted++;
        }
      } catch (error) {
        console.warn(`⚠️ Could not delete physical file ${file.filepath}:`, error.message);
      }
    }

    // Delete database records
    const { count } = await prisma.documentFile.deleteMany({});
    this.deletedCounts.documentFiles = count;
    
    console.log(`✅ Deleted ${count} document file records and ${physicalFilesDeleted} physical files`);
  }

  async deleteProcessingData() {
    console.log('⚙️ Deleting processing data...');
    
    // Delete in order to respect foreign key constraints
    const processingErrors = await prisma.processingError.deleteMany({});
    this.deletedCounts.processingErrors = processingErrors.count;
    
    const stageExecutions = await prisma.stageExecution.deleteMany({});
    this.deletedCounts.stageExecutions = stageExecutions.count;
    
    const processingJobs = await prisma.processingJob.deleteMany({});
    this.deletedCounts.processingJobs = processingJobs.count;
    
    const jobs = await prisma.job.deleteMany({});
    this.deletedCounts.jobs = jobs.count;
    
    console.log(`✅ Deleted processing data: ${processingJobs.count} processing jobs, ${jobs.count} jobs, ${stageExecutions.count} stage executions, ${processingErrors.count} errors`);
  }

  async deleteDocumentData() {
    console.log('📄 Deleting document data...');
    
    // Delete related data first
    const facts = await prisma.fact.deleteMany({});
    this.deletedCounts.facts = facts.count;
    
    const entities = await prisma.documentEntity.deleteMany({});
    this.deletedCounts.entities = entities.count;
    
    const chunks = await prisma.documentChunk.deleteMany({});
    this.deletedCounts.documentChunks = chunks.count;
    
    console.log(`✅ Deleted document data: ${facts.count} facts, ${entities.count} entities, ${chunks.count} chunks`);
  }

  async deleteDocuments() {
    console.log('📋 Deleting documents...');
    
    const { count } = await prisma.document.deleteMany({});
    this.deletedCounts.documents = count;
    
    console.log(`✅ Deleted ${count} documents`);
  }

  async cleanupTestFiles() {
    console.log('🗂️ Cleaning up test files...');
    
    const testFilesDir = path.join(process.cwd(), 'test-files');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const outputDir = path.join(process.cwd(), 'output');
    
    let cleanedDirs = 0;
    
    for (const dir of [testFilesDir, uploadsDir, outputDir]) {
      if (fs.existsSync(dir)) {
        try {
          // Remove all files in directory but keep the directory
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile()) {
              fs.unlinkSync(filePath);
            } else if (stat.isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            }
          }
          cleanedDirs++;
        } catch (error) {
          console.warn(`⚠️ Could not clean directory ${dir}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Cleaned ${cleanedDirs} directories`);
  }

  async performCleanup(options = {}) {
    console.log('🧹 Starting database cleanup...');
    
    try {
      // Use transaction for data consistency
      await prisma.$transaction(async (tx) => {
        if (!options.jobsOnly) {
          // Delete document files first
          await this.deleteDocumentFiles();
          
          // Delete document-related data
          await this.deleteDocumentData();
          
          // Delete documents
          await this.deleteDocuments();
        }
        
        if (!options.documentsOnly) {
          // Delete processing data
          await this.deleteProcessingData();
        }
      }, {
        timeout: 60000 // 60 seconds timeout
      });
      
      // Clean up physical files
      if (options.fullReset) {
        await this.cleanupTestFiles();
      }
      
      console.log('✅ Database cleanup completed successfully');
      
    } catch (error) {
      console.error('❌ Database cleanup failed:', error.message);
      throw error;
    }
  }

  async resetDatabase() {
    console.log('🔄 Performing full database reset...');
    
    try {
      // This is more aggressive - drops and recreates tables
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
      
      // Get all table names
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_name NOT LIKE '_prisma%'
      `;
      
      // Truncate all tables
      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table.table_name}\``);
      }
      
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
      
      console.log('✅ Database reset completed');
      
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      
      // Fallback to regular cleanup
      console.log('🔄 Falling back to regular cleanup...');
      await this.performCleanup({ fullReset: true });
    }
  }

  async printSummary() {
    console.log('\n📊 Cleanup Summary:');
    console.log('==================');
    
    Object.entries(this.deletedCounts).forEach(([key, count]) => {
      if (count > 0) {
        console.log(`  ${key}: ${count}`);
      }
    });
    
    const totalDeleted = Object.values(this.deletedCounts).reduce((sum, count) => sum + count, 0);
    console.log(`  Total records deleted: ${totalDeleted}`);
  }

  async cleanup() {
    await prisma.$disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      options[key] = true;
    }
  });

  const cleaner = new DatabaseCleaner();
  
  try {
    await cleaner.initialize();
    
    // Show current stats
    const stats = await cleaner.getDocumentStats();
    console.log('📊 Current database stats:');
    console.log(`  Documents: ${stats.totalDocuments}`);
    console.log(`  Jobs: ${stats.totalJobs}`);
    console.log(`  Processing Jobs: ${stats.totalProcessingJobs}`);
    
    if (stats.totalDocuments === 0 && stats.totalJobs === 0 && stats.totalProcessingJobs === 0) {
      console.log('✨ Database is already clean!');
      return;
    }
    
    // Confirm action unless --confirm flag is provided
    if (!options.confirm) {
      let message = '⚠️ This will delete ';
      if (options.documentsOnly) {
        message += 'all documents and related data';
      } else if (options.jobsOnly) {
        message += 'all jobs and processing data';
      } else if (options.fullReset) {
        message += 'ALL data and reset the database';
      } else {
        message += 'all documents and jobs';
      }
      message += '. Continue?';
      
      const confirmed = await cleaner.confirmAction(message);
      if (!confirmed) {
        console.log('❌ Operation cancelled');
        return;
      }
    }
    
    // Perform cleanup based on options
    if (options.fullReset) {
      await cleaner.resetDatabase();
    } else {
      await cleaner.performCleanup(options);
    }
    
    await cleaner.printSummary();
    console.log('\n✅ Cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await cleaner.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseCleaner };
