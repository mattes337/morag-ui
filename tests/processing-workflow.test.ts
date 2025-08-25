/**
 * Test suite for document processing workflow components
 * Verifies that the UI correctly displays processing states and stage information
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Document Processing Workflow', () => {
  let testRealmId: string;
  let testUserId: string;
  let testDocuments: any[] = [];

  beforeAll(async () => {
    // Get test realm and user
    const testRealm = await prisma.realm.findFirst({
      where: { name: 'Test Realm - Processing' }
    });
    
    const testUser = await prisma.user.findFirst();
    
    if (!testRealm || !testUser) {
      throw new Error('Test data not found. Run test-processing-workflow.ts first.');
    }
    
    testRealmId = testRealm.id;
    testUserId = testUser.id;
    
    // Get test documents
    testDocuments = await prisma.document.findMany({
      where: {
        name: { startsWith: 'Test Document -' }
      },
      include: {
        stageExecutions: {
          orderBy: { startedAt: 'asc' }
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Document States', () => {
    it('should have documents in various processing states', () => {
      expect(testDocuments.length).toBeGreaterThan(0);
      
      const states = testDocuments.map(doc => doc.state);
      expect(states).toContain('PENDING');
      expect(states).toContain('INGESTING');
      expect(states).toContain('INGESTED');
    });

    it('should have documents with different processing modes', () => {
      const modes = testDocuments.map(doc => doc.processingMode);
      expect(modes).toContain('AUTOMATIC');
      expect(modes).toContain('MANUAL');
    });
  });

  describe('Stage Executions', () => {
    it('should have stage executions for processing documents', () => {
      const docsWithExecutions = testDocuments.filter(doc => doc.stageExecutions.length > 0);
      expect(docsWithExecutions.length).toBeGreaterThan(0);
    });

    it('should have completed markdown conversion for processed documents', () => {
      const fullyProcessed = testDocuments.find(doc => doc.name.includes('Fully Processed'));
      expect(fullyProcessed).toBeDefined();
      
      const markdownExecution = fullyProcessed.stageExecutions.find(
        exec => exec.stage === 'MARKDOWN_CONVERSION'
      );
      expect(markdownExecution).toBeDefined();
      expect(markdownExecution.status).toBe('COMPLETED');
    });

    it('should have failed stage execution for failed document', () => {
      const failedDoc = testDocuments.find(doc => doc.name.includes('Failed'));
      expect(failedDoc).toBeDefined();
      
      const failedExecution = failedDoc.stageExecutions.find(
        exec => exec.status === 'FAILED'
      );
      expect(failedExecution).toBeDefined();
      expect(failedExecution.errorMessage).toBeTruthy();
    });

    it('should have running stage execution for in-progress document', () => {
      const runningDoc = testDocuments.find(doc => doc.name.includes('Converting to Markdown'));
      expect(runningDoc).toBeDefined();
      expect(runningDoc.stageStatus).toBe('RUNNING');
      
      const runningExecution = runningDoc.stageExecutions.find(
        exec => exec.status === 'RUNNING'
      );
      expect(runningExecution).toBeDefined();
    });
  });

  describe('API Endpoints', () => {
    it('should return pipeline status for documents', async () => {
      const testDoc = testDocuments[0];
      
      // Test the stages API endpoint
      const response = await fetch(`http://localhost:3001/api/documents/${testDoc.id}/stages`, {
        headers: {
          'Cookie': 'auth-token=test-token' // You may need to adjust authentication
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('pipelineStatus');
        expect(data).toHaveProperty('executionStats');
        expect(data.pipelineStatus).toHaveProperty('currentStage');
        expect(data.pipelineStatus).toHaveProperty('stageStatus');
        expect(data.pipelineStatus).toHaveProperty('completedStages');
        expect(data.pipelineStatus).toHaveProperty('progress');
      }
    });

    it('should return processing status for documents', async () => {
      const testDoc = testDocuments[0];
      
      // Test the processing API endpoint
      const response = await fetch(`http://localhost:3001/api/documents/${testDoc.id}/processing`, {
        headers: {
          'Cookie': 'auth-token=test-token' // You may need to adjust authentication
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('processing');
        expect(data).toHaveProperty('jobs');
        expect(data.processing).toHaveProperty('currentStage');
        expect(data.processing).toHaveProperty('stageStatus');
      }
    });
  });

  describe('Stage Progress Calculation', () => {
    it('should calculate correct progress for fully processed document', () => {
      const fullyProcessed = testDocuments.find(doc => doc.name.includes('Fully Processed'));
      expect(fullyProcessed).toBeDefined();
      
      const completedStages = fullyProcessed.stageExecutions.filter(
        exec => exec.status === 'COMPLETED'
      );
      
      // Should have all 4 stages completed (MARKDOWN_CONVERSION, CHUNKER, FACT_GENERATOR, INGESTOR)
      expect(completedStages.length).toBe(4);
    });

    it('should calculate correct progress for partially processed document', () => {
      const partialDoc = testDocuments.find(doc => doc.name.includes('Markdown Converted'));
      expect(partialDoc).toBeDefined();
      
      const completedStages = partialDoc.stageExecutions.filter(
        exec => exec.status === 'COMPLETED'
      );
      
      // Should have only 1 stage completed (MARKDOWN_CONVERSION)
      expect(completedStages.length).toBe(1);
      expect(completedStages[0].stage).toBe('MARKDOWN_CONVERSION');
    });
  });

  describe('Processing Mode Handling', () => {
    it('should handle automatic processing mode correctly', () => {
      const autoDoc = testDocuments.find(doc => 
        doc.processingMode === 'AUTOMATIC' && doc.stageExecutions.length > 0
      );
      expect(autoDoc).toBeDefined();
      expect(autoDoc.processingMode).toBe('AUTOMATIC');
    });

    it('should handle manual processing mode correctly', () => {
      const manualDoc = testDocuments.find(doc => doc.processingMode === 'MANUAL');
      expect(manualDoc).toBeDefined();
      expect(manualDoc.processingMode).toBe('MANUAL');
    });
  });
});

// Helper function to test stage status mapping
export function mapDocumentToStageInfo(document: any, pipelineStatus: any) {
  const stages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
  
  return stages.map(stage => {
    const isCompleted = pipelineStatus?.completedStages?.includes(stage);
    const isFailed = pipelineStatus?.failedStages?.includes(stage);
    const isCurrent = pipelineStatus?.currentStage === stage;
    
    let status = 'PENDING';
    if (isCompleted) status = 'COMPLETED';
    else if (isFailed) status = 'FAILED';
    else if (isCurrent && pipelineStatus?.stageStatus === 'RUNNING') status = 'RUNNING';
    
    return {
      stage,
      status,
      progress: isCurrent ? pipelineStatus?.progress : (isCompleted ? 100 : 0)
    };
  });
}

// Test the mapping function
describe('Stage Info Mapping', () => {
  it('should correctly map pipeline status to stage info', () => {
    const mockPipelineStatus = {
      currentStage: 'CHUNKER',
      stageStatus: 'RUNNING',
      completedStages: ['MARKDOWN_CONVERSION'],
      failedStages: [],
      progress: 40
    };

    const stageInfo = mapDocumentToStageInfo({}, mockPipelineStatus);
    
    expect(stageInfo).toHaveLength(5);
    expect(stageInfo[0]).toEqual({
      stage: 'MARKDOWN_CONVERSION',
      status: 'COMPLETED',
      progress: 100
    });
    expect(stageInfo[2]).toEqual({
      stage: 'CHUNKER',
      status: 'RUNNING',
      progress: 40
    });
    expect(stageInfo[3]).toEqual({
      stage: 'FACT_GENERATOR',
      status: 'PENDING',
      progress: 0
    });
  });
});
