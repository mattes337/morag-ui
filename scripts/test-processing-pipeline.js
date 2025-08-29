#!/usr/bin/env node

/**
 * Processing Pipeline Test Orchestrator
 * 
 * Orchestrates the complete testing workflow:
 * - Creates documents of each type
 * - Runs each stage for the documents
 * - Validates input/output at each stage
 * - Advances through all stages and document types
 * - Fails early on errors
 * 
 * Usage:
 *   node scripts/test-processing-pipeline.js                    # Full pipeline test
 *   node scripts/test-processing-pipeline.js --type=youtube    # Test specific document type
 *   node scripts/test-processing-pipeline.js --stage=chunker   # Test specific stage
 *   node scripts/test-processing-pipeline.js --no-cleanup      # Don't cleanup after test
 *   node scripts/test-processing-pipeline.js --continue-on-error # Don't fail fast
 */

const { DocumentCreator, TEST_DOCUMENTS } = require('./create-test-documents.js');
const { JobRunner } = require('./run-background-jobs.js');
const { DatabaseCleaner } = require('./cleanup-test-data.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Processing stages in order
const PROCESSING_STAGES = [
  'MARKDOWN_CONVERSION',
  'MARKDOWN_OPTIMIZER', 
  'CHUNKER',
  'FACT_GENERATOR',
  'INGESTOR'
];

class PipelineTestOrchestrator {
  constructor() {
    this.documentCreator = new DocumentCreator();
    this.jobRunner = new JobRunner();
    this.databaseCleaner = new DatabaseCleaner();
    
    this.testResults = {
      documentsCreated: {},
      stagesCompleted: {},
      validationResults: {},
      errors: [],
      startTime: new Date(),
      endTime: null
    };
    
    this.createdDocuments = [];
    this.failFast = true;
  }

  async initialize() {
    console.log('🚀 Initializing Pipeline Test Orchestrator...');
    
    await this.documentCreator.initialize();
    await this.jobRunner.initialize();
    await this.databaseCleaner.initialize();
    
    console.log('✅ All components initialized');
  }

  async createTestDocuments(documentTypes = null) {
    console.log('\n📝 Creating test documents...');
    
    const typesToCreate = documentTypes || Object.keys(TEST_DOCUMENTS);
    
    for (const type of typesToCreate) {
      try {
        console.log(`\n🔄 Creating ${type} document...`);
        const document = await this.documentCreator.createDocument(type);
        
        this.createdDocuments.push(document);
        this.testResults.documentsCreated[type] = {
          success: true,
          documentId: document.id,
          name: document.name
        };
        
        console.log(`✅ Created ${type} document: ${document.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to create ${type} document:`, error.message);
        this.testResults.documentsCreated[type] = {
          success: false,
          error: error.message
        };
        this.testResults.errors.push({
          stage: 'document_creation',
          type: type,
          error: error.message
        });
        
        if (this.failFast) {
          throw new Error(`Document creation failed for ${type}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Document creation completed. Created ${this.createdDocuments.length} documents.`);
    return this.createdDocuments;
  }

  async createJobsForStage(stage, documentIds = null) {
    console.log(`\n⚙️ Creating jobs for stage: ${stage}`);
    
    const targetDocuments = documentIds || this.createdDocuments.map(d => d.id);
    const createdJobs = [];
    
    for (const documentId of targetDocuments) {
      try {
        const job = await this.jobRunner.createJobForDocument(documentId, stage);
        createdJobs.push(job);
        console.log(`✅ Created job ${job.id} for document ${documentId}`);
      } catch (error) {
        console.error(`❌ Failed to create job for document ${documentId}:`, error.message);
        this.testResults.errors.push({
          stage: 'job_creation',
          documentId: documentId,
          targetStage: stage,
          error: error.message
        });
        
        if (this.failFast) {
          throw error;
        }
      }
    }
    
    return createdJobs;
  }

  async runStageJobs(stage, maxWaitTime = 300000) { // 5 minutes default
    console.log(`\n🔄 Running jobs for stage: ${stage}`);
    
    const startTime = Date.now();
    let completed = false;
    
    while (!completed && (Date.now() - startTime) < maxWaitTime) {
      const result = await this.jobRunner.runOnce({
        stage: stage,
        failFast: this.failFast
      });
      
      if (result.processed === 0) {
        // Check if all jobs for this stage are completed
        const pendingJobs = await prisma.processingJob.count({
          where: {
            stage: stage,
            status: 'PENDING'
          }
        });
        
        if (pendingJobs === 0) {
          completed = true;
          console.log(`✅ All jobs for stage ${stage} completed`);
        } else {
          // Wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (result.failed > 0 && this.failFast) {
        throw new Error(`Jobs failed for stage ${stage}`);
      }
    }
    
    if (!completed) {
      throw new Error(`Timeout waiting for stage ${stage} to complete`);
    }
  }

  async validateStageOutput(stage, documentId) {
    console.log(`🔍 Validating output for stage ${stage}, document ${documentId}`);
    
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          documentChunks: true,
          entities: true,
          facts: true,
          files: true,
          stageExecutions: {
            where: { stage: stage }
          }
        }
      });
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      const validation = {
        documentExists: true,
        stageExecuted: document.stageExecutions.length > 0,
        hasContent: false,
        hasChunks: document.documentChunks.length > 0,
        hasEntities: document.entities.length > 0,
        hasFacts: document.facts.length > 0,
        hasFiles: document.files.length > 0
      };
      
      // Stage-specific validations
      switch (stage) {
        case 'MARKDOWN_CONVERSION':
          validation.hasContent = !!document.markdown;
          validation.expected = ['hasContent'];
          break;
        case 'MARKDOWN_OPTIMIZER':
          validation.hasContent = !!document.markdown;
          validation.expected = ['hasContent'];
          break;
        case 'CHUNKER':
          validation.expected = ['hasChunks'];
          break;
        case 'FACT_GENERATOR':
          validation.expected = ['hasFacts', 'hasEntities'];
          break;
        case 'INGESTOR':
          validation.expected = ['hasChunks']; // Should still have chunks after ingestion
          break;
      }
      
      // Check if all expected conditions are met
      validation.passed = validation.expected.every(condition => validation[condition]);
      
      if (!validation.passed) {
        const failedConditions = validation.expected.filter(condition => !validation[condition]);
        validation.failureReason = `Failed conditions: ${failedConditions.join(', ')}`;
      }
      
      this.testResults.validationResults[`${stage}_${documentId}`] = validation;
      
      if (validation.passed) {
        console.log(`✅ Validation passed for ${stage} on document ${documentId}`);
      } else {
        console.error(`❌ Validation failed for ${stage} on document ${documentId}: ${validation.failureReason}`);
        if (this.failFast) {
          throw new Error(`Validation failed: ${validation.failureReason}`);
        }
      }
      
      return validation;
      
    } catch (error) {
      console.error(`❌ Validation error for ${stage} on document ${documentId}:`, error.message);
      this.testResults.errors.push({
        stage: 'validation',
        documentId: documentId,
        targetStage: stage,
        error: error.message
      });
      
      if (this.failFast) {
        throw error;
      }
      
      return { passed: false, error: error.message };
    }
  }

  async runFullPipeline(documentTypes = null, stages = null) {
    console.log('\n🔄 Running full processing pipeline test...');
    
    const targetStages = stages || PROCESSING_STAGES;
    
    // Create test documents
    await this.createTestDocuments(documentTypes);
    
    if (this.createdDocuments.length === 0) {
      throw new Error('No documents were created successfully');
    }
    
    // Process each stage
    for (const stage of targetStages) {
      console.log(`\n🎯 Processing stage: ${stage}`);
      
      try {
        // Create jobs for this stage
        await this.createJobsForStage(stage);
        
        // Run the jobs
        await this.runStageJobs(stage);
        
        // Validate output for each document
        for (const document of this.createdDocuments) {
          await this.validateStageOutput(stage, document.id);
        }
        
        this.testResults.stagesCompleted[stage] = {
          success: true,
          documentsProcessed: this.createdDocuments.length
        };
        
        console.log(`✅ Stage ${stage} completed successfully`);
        
      } catch (error) {
        console.error(`❌ Stage ${stage} failed:`, error.message);
        this.testResults.stagesCompleted[stage] = {
          success: false,
          error: error.message
        };
        this.testResults.errors.push({
          stage: stage,
          error: error.message
        });
        
        if (this.failFast) {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Full pipeline test completed');
  }

  async printTestResults() {
    this.testResults.endTime = new Date();
    const duration = this.testResults.endTime - this.testResults.startTime;
    
    console.log('\n📊 Test Results Summary');
    console.log('======================');
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Documents Created: ${Object.keys(this.testResults.documentsCreated).length}`);
    console.log(`Stages Tested: ${Object.keys(this.testResults.stagesCompleted).length}`);
    console.log(`Validations Run: ${Object.keys(this.testResults.validationResults).length}`);
    console.log(`Errors: ${this.testResults.errors.length}`);
    
    // Document creation results
    console.log('\n📝 Document Creation:');
    Object.entries(this.testResults.documentsCreated).forEach(([type, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${type}: ${result.success ? result.documentId : result.error}`);
    });
    
    // Stage completion results
    console.log('\n⚙️ Stage Processing:');
    Object.entries(this.testResults.stagesCompleted).forEach(([stage, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${stage}: ${result.success ? `${result.documentsProcessed} docs` : result.error}`);
    });
    
    // Validation results
    console.log('\n🔍 Validations:');
    Object.entries(this.testResults.validationResults).forEach(([key, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${result.passed ? 'PASSED' : result.failureReason || result.error}`);
    });
    
    // Errors
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.stage}] ${error.error}`);
      });
    }
    
    const overallSuccess = this.testResults.errors.length === 0;
    console.log(`\n${overallSuccess ? '✅' : '❌'} Overall Result: ${overallSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    return overallSuccess;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    await this.documentCreator.cleanup();
    await this.jobRunner.cleanup();
    await this.databaseCleaner.cleanup();
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
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  const orchestrator = new PipelineTestOrchestrator();

  // Configure based on options
  if (options['continue-on-error']) {
    orchestrator.failFast = false;
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, cleaning up...');
    await orchestrator.cleanup();
    process.exit(1);
  });

  try {
    await orchestrator.initialize();

    // Clean database first unless --no-cleanup-before is specified
    if (!options['no-cleanup-before']) {
      console.log('🧹 Cleaning database before test...');
      await orchestrator.databaseCleaner.performCleanup({ confirm: true });
    }

    // Determine what to test
    const documentTypes = options.type ? [options.type] : null;
    const stages = options.stage ? [options.stage.toUpperCase()] : null;

    // Validate options
    if (documentTypes && !TEST_DOCUMENTS[documentTypes[0]]) {
      console.error(`❌ Invalid document type: ${documentTypes[0]}`);
      console.log('Available types:', Object.keys(TEST_DOCUMENTS).join(', '));
      process.exit(1);
    }

    if (stages && !PROCESSING_STAGES.includes(stages[0])) {
      console.error(`❌ Invalid stage: ${stages[0]}`);
      console.log('Available stages:', PROCESSING_STAGES.join(', '));
      process.exit(1);
    }

    // Run the test
    await orchestrator.runFullPipeline(documentTypes, stages);

    // Print results
    const success = await orchestrator.printTestResults();

    // Clean up after test unless --no-cleanup is specified
    if (!options['no-cleanup']) {
      console.log('\n🧹 Cleaning up test data...');
      await orchestrator.databaseCleaner.performCleanup({ confirm: true });
    }

    console.log('\n✅ Pipeline test completed');
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);

    // Print partial results
    await orchestrator.printTestResults();

    // Clean up on failure unless --no-cleanup is specified
    if (!options['no-cleanup']) {
      console.log('\n🧹 Cleaning up after failure...');
      try {
        await orchestrator.databaseCleaner.performCleanup({ confirm: true });
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message);
      }
    }

    process.exit(1);
  } finally {
    await orchestrator.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { PipelineTestOrchestrator, PROCESSING_STAGES };
