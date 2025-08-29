#!/usr/bin/env node

/**
 * Background Job Execution Script
 * 
 * Runs all background jobs and processes pending jobs for testing.
 * 
 * Usage:
 *   node scripts/run-background-jobs.js                    # Run all pending jobs once
 *   node scripts/run-background-jobs.js --watch           # Continuously watch and process jobs
 *   node scripts/run-background-jobs.js --document=<id>   # Process jobs for specific document
 *   node scripts/run-background-jobs.js --stage=<stage>   # Process jobs for specific stage
 *   node scripts/run-background-jobs.js --max=10          # Limit number of jobs to process
 */

const { PrismaClient } = require('@prisma/client');

// Dynamic import for node-fetch (ESM module)
let fetch;
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
  }
  return fetch;
}

const prisma = new PrismaClient();

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEFAULT_API_KEY = process.env.TEST_API_KEY || 'gk_test_automation_key';
const POLL_INTERVAL = 5000; // 5 seconds

class JobRunner {
  constructor() {
    this.useDirectDb = process.env.NODE_ENV === 'test' || process.env.SKIP_AUTH === 'true';
    this.apiKey = DEFAULT_API_KEY;
    this.baseUrl = API_BASE_URL;
    this.isRunning = false;
    this.processedJobs = [];
  }

  async initialize() {
    console.log('🚀 Initializing Job Runner...');

    if (this.useDirectDb) {
      console.log('🔓 Using direct database access (auth skipped)');
    } else {
      // Verify API key
      await this.verifyApiKey();
    }

    // Import services dynamically
    try {
      this.backgroundJobService = await this.importService('backgroundJobService');
      this.jobProcessor = await this.importService('jobProcessor');
      this.jobManager = await this.importService('jobManager');
      console.log('✅ Services loaded successfully');
    } catch (error) {
      console.warn('⚠️ Could not load services, will use direct database operations');
      this.backgroundJobService = null;
      this.jobProcessor = null;
      this.jobManager = null;
    }
  }

  async importService(serviceName) {
    try {
      const module = await import(`../lib/services/${serviceName}.js`);
      return module[serviceName] || module.default;
    } catch (error) {
      // Try alternative import paths
      try {
        const module = await import(`../lib/services/jobs/${serviceName}.js`);
        return module[serviceName] || module.default;
      } catch (error2) {
        console.warn(`Could not import ${serviceName}, will use direct database operations`);
        return null;
      }
    }
  }

  async verifyApiKey() {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.baseUrl}/api/processing-jobs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API key verification failed: ${response.status}`);
      }

      console.log('✅ API key verified');
    } catch (error) {
      console.error('❌ API key verification failed:', error.message);
      console.log('💡 Make sure you have a valid API key set in TEST_API_KEY environment variable');
      process.exit(1);
    }
  }

  async getPendingJobs(options = {}) {
    const whereClause = {
      status: 'PENDING'
    };

    if (options.documentId) {
      whereClause.documentId = options.documentId;
    }

    if (options.stage) {
      whereClause.stage = options.stage;
    }

    const jobs = await prisma.processingJob.findMany({
      where: whereClause,
      include: {
        document: {
          include: {
            realm: true,
            user: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: options.max || 50
    });

    return jobs;
  }

  async createJobForDocument(documentId, stage, priority = 0) {
    console.log(`📝 Creating job for document ${documentId}, stage ${stage}`);

    try {
      if (this.useDirectDb) {
        // Direct database creation
        const job = await prisma.processingJob.create({
          data: {
            documentId,
            stage,
            priority: priority || 0,
            scheduledAt: new Date(),
            status: 'PENDING'
          }
        });
        console.log(`✅ Created job: ${job.id}`);
        return job;
      } else {
        // API-based creation
        const fetch = await getFetch();
        const response = await fetch(`${this.baseUrl}/api/processing-jobs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId,
            stage,
            priority
          })
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const result = await response.json();
        console.log(`✅ Created job: ${result.job.id}`);
        return result.job;
      }
    } catch (error) {
      console.error(`❌ Failed to create job:`, error.message);
      throw error;
    }
  }

  async processJob(job) {
    console.log(`🔄 Processing job ${job.id} (${job.stage}) for document ${job.documentId}`);
    
    try {
      // Mark job as processing
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: 'PROCESSING',
          startedAt: new Date()
        }
      });

      // Use service if available, otherwise simulate processing
      if (this.jobProcessor) {
        await this.jobProcessor.processJob(job);
      } else {
        // Simulate job processing
        console.log(`⏳ Simulating processing for job ${job.id}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark as completed
        await prisma.processingJob.update({
          where: { id: job.id },
          data: {
            status: 'FINISHED',
            completedAt: new Date()
          }
        });
      }

      this.processedJobs.push(job.id);
      console.log(`✅ Completed job ${job.id}`);
      
    } catch (error) {
      console.error(`❌ Failed to process job ${job.id}:`, error.message);
      
      // Mark job as failed
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date()
        }
      });
      
      throw error;
    }
  }

  async runOnce(options = {}) {
    console.log('🔄 Running background jobs once...');
    
    const jobs = await this.getPendingJobs(options);
    
    if (jobs.length === 0) {
      console.log('📭 No pending jobs found');
      return { processed: 0, failed: 0 };
    }

    console.log(`📋 Found ${jobs.length} pending jobs`);
    
    let processed = 0;
    let failed = 0;
    
    for (const job of jobs) {
      try {
        await this.processJob(job);
        processed++;
      } catch (error) {
        failed++;
        console.error(`Job ${job.id} failed:`, error.message);
        
        if (options.failFast) {
          console.log('💥 Failing fast due to job error');
          break;
        }
      }
    }
    
    console.log(`📊 Processed: ${processed}, Failed: ${failed}`);
    return { processed, failed };
  }

  async watch(options = {}) {
    console.log('👀 Starting job watcher...');
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        const result = await this.runOnce(options);
        
        if (result.processed > 0 || result.failed > 0) {
          console.log(`🔄 Cycle complete: ${result.processed} processed, ${result.failed} failed`);
        }
        
        // Wait before next cycle
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        
      } catch (error) {
        console.error('❌ Error in watch cycle:', error.message);
        
        if (options.failFast) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    }
    
    console.log('⏹️ Job watcher stopped');
  }

  stop() {
    console.log('🛑 Stopping job runner...');
    this.isRunning = false;
  }

  async getJobStats() {
    const stats = await prisma.processingJob.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const result = {};
    stats.forEach(stat => {
      result[stat.status] = stat._count.id;
    });

    return result;
  }

  async cleanup() {
    await prisma.$disconnect();
  }

  getProcessedJobs() {
    return this.processedJobs;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  const runner = new JobRunner();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    runner.stop();
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    runner.stop();
  });

  try {
    await runner.initialize();
    
    // Show current job stats
    const stats = await runner.getJobStats();
    console.log('📊 Current job stats:', stats);
    
    if (options.watch) {
      await runner.watch({
        documentId: options.document,
        stage: options.stage,
        max: options.max ? parseInt(options.max) : undefined,
        failFast: options.failFast
      });
    } else {
      const result = await runner.runOnce({
        documentId: options.document,
        stage: options.stage,
        max: options.max ? parseInt(options.max) : undefined,
        failFast: options.failFast
      });
      
      console.log('\n✅ Job execution completed');
      console.log('📋 Processed jobs:', runner.getProcessedJobs());
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { JobRunner };
