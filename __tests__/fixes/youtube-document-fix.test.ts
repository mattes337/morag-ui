/**
 * Test for YouTube document processing fix
 * Verifies that YouTube documents can be processed without requiring original files
 */

import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { prisma } from '../../lib/database';
import { ProcessingStage } from '@prisma/client';

// Mock the dependencies
jest.mock('../../lib/database', () => ({
  prisma: {
    document: {
      findUnique: jest.fn(),
    },
    processingJob: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../lib/services/stageExecutionService', () => ({
  stageExecutionService: {
    startExecution: jest.fn(),
    completeExecution: jest.fn(),
  },
}));

jest.mock('../../lib/services/moragService', () => ({
  moragService: {
    processStage: jest.fn(),
  },
}));

describe('YouTube Document Processing Fix', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not throw "No original file found" error for YouTube documents', async () => {
    // Mock a YouTube document without files
    const mockDocument = {
      id: 'test-doc-id',
      name: 'Test YouTube Video',
      type: 'youtube',
      subType: null,
      realmId: 'test-realm-id',
      markdown: null,
      files: [], // No original file
      realm: {
        servers: []
      }
    };

    // Mock a job with YouTube URL in metadata
    const mockJob = {
      id: 'test-job-id',
      documentId: 'test-doc-id',
      stage: ProcessingStage.MARKDOWN_CONVERSION,
      metadata: JSON.stringify({
        sourceUrl: 'https://www.youtube.com/watch?v=test123',
        documentType: 'youtube'
      })
    };

    // Setup mocks
    mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);

    // Call the private method through reflection
    const callMoragBackend = (backgroundJobService as any).callMoragBackend.bind(backgroundJobService);

    // This should not throw the "No original file found" error
    // It might throw other errors (like missing MoRAG service), but not the original file error
    try {
      await callMoragBackend(mockJob, 'test-execution-id');
    } catch (error) {
      // Verify it's not the "No original file found" error
      expect(error.message).not.toContain('No original file found for document');
    }
  });

  it('should throw error for YouTube document without URL in metadata', async () => {
    // Mock a YouTube document without files
    const mockDocument = {
      id: 'test-doc-id',
      name: 'Test YouTube Video',
      type: 'youtube',
      subType: null,
      realmId: 'test-realm-id',
      markdown: null,
      files: [], // No original file
      realm: {
        servers: []
      }
    };

    // Mock a job without URL in metadata
    const mockJob = {
      id: 'test-job-id',
      documentId: 'test-doc-id',
      stage: ProcessingStage.MARKDOWN_CONVERSION,
      metadata: JSON.stringify({
        documentType: 'youtube'
        // Missing sourceUrl
      })
    };

    // Setup mocks
    mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);

    // Call the private method through reflection
    const callMoragBackend = (backgroundJobService as any).callMoragBackend.bind(backgroundJobService);
    
    // This should throw an error about missing URL
    await expect(callMoragBackend(mockJob, 'test-execution-id')).rejects.toThrow(
      'No source URL found for youtube document test-doc-id. URL must be provided in job metadata.'
    );
  });

  it('should still require original file for non-YouTube documents', async () => {
    // Mock a regular document without files
    const mockDocument = {
      id: 'test-doc-id',
      name: 'Test Document',
      type: 'document',
      subType: 'pdf',
      realmId: 'test-realm-id',
      markdown: null,
      files: [], // No original file
      realm: {
        servers: []
      }
    };

    const mockJob = {
      id: 'test-job-id',
      documentId: 'test-doc-id',
      stage: ProcessingStage.MARKDOWN_CONVERSION,
      metadata: null
    };

    // Setup mocks
    mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);

    // Call the private method through reflection
    const callMoragBackend = (backgroundJobService as any).callMoragBackend.bind(backgroundJobService);
    
    // This should throw an error about missing original file
    await expect(callMoragBackend(mockJob, 'test-execution-id')).rejects.toThrow(
      'No original file found for document test-doc-id'
    );
  });
});
