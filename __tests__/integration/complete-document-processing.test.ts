/**
 * End-to-end integration test to verify complete document processing
 * Tests that each document type can be processed through all stages:
 * MARKDOWN_CONVERSION -> MARKDOWN_OPTIMIZER -> CHUNKER -> FACT_GENERATOR -> INGESTOR
 */

import { YouTubeDocumentHandler, WebsiteDocumentHandler, FileDocumentHandler } from '../../lib/services/jobs/documentHandlers';

// Mock the database and morag service
jest.mock('../../lib/database', () => ({
  prisma: {
    stageExecution: {
      findFirst: jest.fn()
    },
    documentFile: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

jest.mock('../../lib/services/moragService', () => ({
  moragService: {
    downloadFile: jest.fn()
  }
}));

describe('Complete Document Processing Pipeline', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { prisma } = require('../../lib/database');
    mockPrisma = prisma;
  });

  const baseDocument = {
    id: 'test-doc-123',
    name: 'Test Document',
    realmId: 'test-realm',
    realm: { servers: [] }
  };

  const stages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];

  describe('YouTube Document Complete Processing', () => {
    it('should process through all stages correctly', async () => {
      const handler = new YouTubeDocumentHandler();

      // Mock stage outputs
      const stageOutputs = {
        'MARKDOWN_CONVERSION': '# YouTube Video Transcript\n\nThis is the converted transcript.',
        'MARKDOWN_OPTIMIZER': '# Optimized YouTube Transcript\n\nThis is the optimized transcript.',
        'CHUNKER': '{"chunks": [{"id": 1, "content": "chunk 1"}, {"id": 2, "content": "chunk 2"}]}',
        'FACT_GENERATOR': '{"facts": [{"entity": "YouTube", "relation": "is", "value": "platform"}]}',
        'INGESTOR': '{"status": "ingested", "documents": 1}'
      };

      const stageFiles = {
        'MARKDOWN_CONVERSION': ['output/test-doc-123/test-doc-123.md'],
        'MARKDOWN_OPTIMIZER': ['output/test-doc-123/test-doc-123.opt.md'],
        'CHUNKER': ['output/test-doc-123/test-doc-123.chunks.json'],
        'FACT_GENERATOR': ['output/test-doc-123/test-doc-123.facts.json'],
        'INGESTOR': ['output/test-doc-123/test-doc-123.ingested']
      };

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const isFirstStage = i === 0;
        const previousStage = i > 0 ? stages[i - 1] : null;

        console.log(`Testing stage: ${stage}`);

        // Mock previous stage execution if not first stage
        if (!isFirstStage && previousStage) {
          mockPrisma.stageExecution.findFirst.mockResolvedValue({
            id: `exec-${i}`,
            outputFiles: JSON.stringify(stageFiles[previousStage]),
            status: 'COMPLETED'
          });

          // Mock database file retrieval
          mockPrisma.documentFile.findFirst.mockResolvedValue({
            id: `file-${i}`,
            filename: stageFiles[previousStage][0].split('/').pop(),
            content: stageOutputs[previousStage]
          });
        }

        const request = {
          documentId: baseDocument.id,
          stage,
          executionId: `exec-${i}`,
          document: { ...baseDocument, type: 'youtube' },
          job: {
            id: `job-${i}`,
            stage,
            documentId: baseDocument.id
          }
        };

        const content = {
          content: '',
          sourceUrl: 'https://www.youtube.com/watch?v=test123',
          contentSource: 'url'
        };

        const backendRequest = await handler.buildBackendRequest(request, content);

        if (isFirstStage) {
          // First stage should use input_files with source URL
          expect(backendRequest).toMatchObject({
            stage: 'markdown-conversion',
            input_files: ['https://www.youtube.com/watch?v=test123']
          });
          expect(backendRequest).not.toHaveProperty('file_content');
        } else {
          // Subsequent stages should use file_content from previous stage
          expect(backendRequest).toMatchObject({
            stage: stage.toLowerCase().replace('_', '-'),
            file_content: stageOutputs[previousStage!],
            use_file_upload: true
          });
          expect(backendRequest).not.toHaveProperty('input_files');
        }

        console.log(`✅ Stage ${stage} processed correctly`);
      }
    });
  });

  describe('Website Document Complete Processing', () => {
    it('should process through all stages correctly', async () => {
      const handler = new WebsiteDocumentHandler();

      // Mock stage outputs
      const stageOutputs = {
        'MARKDOWN_CONVERSION': '# Website Article\n\nThis is the converted article content.',
        'MARKDOWN_OPTIMIZER': '# Optimized Website Article\n\nThis is the optimized article.',
        'CHUNKER': '{"chunks": [{"id": 1, "content": "article chunk 1"}, {"id": 2, "content": "article chunk 2"}]}',
        'FACT_GENERATOR': '{"facts": [{"entity": "Website", "relation": "contains", "value": "information"}]}',
        'INGESTOR': '{"status": "ingested", "documents": 1}'
      };

      const stageFiles = {
        'MARKDOWN_CONVERSION': ['output/test-doc-123/test-doc-123.md'],
        'MARKDOWN_OPTIMIZER': ['output/test-doc-123/test-doc-123.opt.md'],
        'CHUNKER': ['output/test-doc-123/test-doc-123.chunks.json'],
        'FACT_GENERATOR': ['output/test-doc-123/test-doc-123.facts.json'],
        'INGESTOR': ['output/test-doc-123/test-doc-123.ingested']
      };

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const isFirstStage = i === 0;
        const previousStage = i > 0 ? stages[i - 1] : null;

        // Mock previous stage execution if not first stage
        if (!isFirstStage && previousStage) {
          mockPrisma.stageExecution.findFirst.mockResolvedValue({
            id: `exec-${i}`,
            outputFiles: JSON.stringify(stageFiles[previousStage]),
            status: 'COMPLETED'
          });

          // Mock database file retrieval
          mockPrisma.documentFile.findFirst.mockResolvedValue({
            id: `file-${i}`,
            filename: stageFiles[previousStage][0].split('/').pop(),
            content: stageOutputs[previousStage]
          });
        }

        const request = {
          documentId: baseDocument.id,
          stage,
          executionId: `exec-${i}`,
          document: { ...baseDocument, type: 'website' },
          job: {
            id: `job-${i}`,
            stage,
            documentId: baseDocument.id
          }
        };

        const content = {
          content: '',
          sourceUrl: 'https://example.com/article',
          contentSource: 'url'
        };

        const backendRequest = await handler.buildBackendRequest(request, content);

        if (isFirstStage) {
          // First stage should use input_files with source URL
          expect(backendRequest).toMatchObject({
            stage: 'markdown-conversion',
            input_files: ['https://example.com/article']
          });
          expect(backendRequest).not.toHaveProperty('file_content');
        } else {
          // Subsequent stages should use file_content from previous stage
          expect(backendRequest).toMatchObject({
            stage: stage.toLowerCase().replace('_', '-'),
            file_content: stageOutputs[previousStage!],
            use_file_upload: true
          });
          expect(backendRequest).not.toHaveProperty('input_files');
        }

        console.log(`✅ Website stage ${stage} processed correctly`);
      }
    });
  });

  describe('File Document Complete Processing', () => {
    it('should process through all stages correctly', async () => {
      const handler = new FileDocumentHandler();

      // Mock stage outputs
      const stageOutputs = {
        'MARKDOWN_CONVERSION': '# PDF Document\n\nThis is the converted PDF content.',
        'MARKDOWN_OPTIMIZER': '# Optimized PDF Document\n\nThis is the optimized PDF content.',
        'CHUNKER': '{"chunks": [{"id": 1, "content": "pdf chunk 1"}, {"id": 2, "content": "pdf chunk 2"}]}',
        'FACT_GENERATOR': '{"facts": [{"entity": "PDF", "relation": "contains", "value": "text"}]}',
        'INGESTOR': '{"status": "ingested", "documents": 1}'
      };

      const stageFiles = {
        'MARKDOWN_CONVERSION': ['output/test-doc-123/test-doc-123.md'],
        'MARKDOWN_OPTIMIZER': ['output/test-doc-123/test-doc-123.opt.md'],
        'CHUNKER': ['output/test-doc-123/test-doc-123.chunks.json'],
        'FACT_GENERATOR': ['output/test-doc-123/test-doc-123.facts.json'],
        'INGESTOR': ['output/test-doc-123/test-doc-123.ingested']
      };

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const isFirstStage = i === 0;
        const previousStage = i > 0 ? stages[i - 1] : null;

        // Mock previous stage execution if not first stage
        if (!isFirstStage && previousStage) {
          mockPrisma.stageExecution.findFirst.mockResolvedValue({
            id: `exec-${i}`,
            outputFiles: JSON.stringify(stageFiles[previousStage]),
            status: 'COMPLETED'
          });

          // Mock database file retrieval
          mockPrisma.documentFile.findFirst.mockResolvedValue({
            id: `file-${i}`,
            filename: stageFiles[previousStage][0].split('/').pop(),
            content: stageOutputs[previousStage]
          });
        }

        const request = {
          documentId: baseDocument.id,
          stage,
          executionId: `exec-${i}`,
          document: {
            ...baseDocument,
            type: 'file',
            files: isFirstStage ? [{ id: 'file-123', filename: 'test.pdf', content: 'Original PDF content' }] : undefined,
            // For subsequent stages, FileDocumentHandler expects markdown content in document.markdown
            markdown: !isFirstStage && previousStage ? stageOutputs[previousStage] : undefined
          },
          job: {
            id: `job-${i}`,
            stage,
            documentId: baseDocument.id
          }
        };

        const content = isFirstStage
          ? {
              content: 'Original PDF content',
              contentSource: 'original_file'
            }
          : {
              content: stageOutputs[previousStage!] || '',
              contentSource: 'markdown_field'
            };

        const backendRequest = await handler.buildBackendRequest(request, content);

        if (isFirstStage) {
          // First stage should use file_content with original file
          expect(backendRequest).toMatchObject({
            stage: 'markdown-conversion',
            file_content: 'Original PDF content',
            use_file_upload: true
          });
          expect(backendRequest).not.toHaveProperty('input_files');
        } else {
          // Subsequent stages should use file_content from previous stage
          expect(backendRequest).toMatchObject({
            stage: stage.toLowerCase().replace('_', '-'),
            file_content: stageOutputs[previousStage!],
            use_file_upload: true
          });
          expect(backendRequest).not.toHaveProperty('input_files');
        }

        console.log(`✅ File stage ${stage} processed correctly`);
      }
    });
  });
});
