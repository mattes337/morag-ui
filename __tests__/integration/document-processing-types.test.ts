/**
 * Integration test to verify all document types can be processed
 * Tests YouTube, Website, PDF, Audio, Video, Image, and Text documents
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

describe('Document Processing Types', () => {
  const baseRequest = {
    documentId: 'test-doc-123',
    stage: 'MARKDOWN_CONVERSION',
    executionId: 'test-execution-123',
    document: {
      id: 'test-doc-123',
      name: 'Test Document',
      realmId: 'test-realm',
      realm: { servers: [] }
    },
    job: {
      id: 'test-job-123',
      stage: 'MARKDOWN_CONVERSION',
      documentId: 'test-doc-123'
    }
  };

  describe('YouTube Documents', () => {
    let handler: YouTubeDocumentHandler;

    beforeEach(() => {
      handler = new YouTubeDocumentHandler();
    });

    it('should process YouTube video URLs', async () => {
      const youtubeRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'youtube' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(youtubeRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        config: {
          extract_metadata: true,
          extract_transcript: true,
          use_proxy: true
        }
      });
    });

    it('should process YouTube short URLs', async () => {
      const youtubeRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'youtube' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://youtu.be/dQw4w9WgXcQ',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(youtubeRequest, content);

      expect(request.input_files).toEqual(['https://youtu.be/dQw4w9WgXcQ']);
    });
  });

  describe('Website Documents', () => {
    let handler: WebsiteDocumentHandler;

    beforeEach(() => {
      handler = new WebsiteDocumentHandler();
    });

    it('should process web page URLs', async () => {
      const websiteRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'website' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/article',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(websiteRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://example.com/article'],
        config: {
          follow_links: false,
          max_depth: 1,
          extract_metadata: true,
          clean_content: true,
          extract_links: true,
          preserve_tables: true,
          preserve_lists: true
        }
      });
    });
  });

  describe('File Documents', () => {
    let handler: FileDocumentHandler;

    beforeEach(() => {
      handler = new FileDocumentHandler();
    });

    it('should process PDF files via URL', async () => {
      const fileRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'file' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/document.pdf',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(fileRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://example.com/document.pdf']
      });
    });

    it('should process uploaded file content', async () => {
      const fileRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'file' }
      };

      const content = {
        content: 'Test PDF content',
        contentSource: 'original_file'
      };

      const request = await handler.buildBackendRequest(fileRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        file_content: 'Test PDF content',
        use_file_upload: true
      });
    });

    it('should process audio files via URL', async () => {
      const fileRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'audio' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/audio.mp3',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(fileRequest, content);

      expect(request.input_files).toEqual(['https://example.com/audio.mp3']);
    });

    it('should process video files via URL', async () => {
      const fileRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'video' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/video.mp4',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(fileRequest, content);

      expect(request.input_files).toEqual(['https://example.com/video.mp4']);
    });

    it('should process image files via URL', async () => {
      const fileRequest = {
        ...baseRequest,
        document: { ...baseRequest.document, type: 'image' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/image.jpg',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(fileRequest, content);

      expect(request.input_files).toEqual(['https://example.com/image.jpg']);
    });
  });

  describe('All Document Types API Compliance', () => {
    it('should use input_files for all URL-based documents', async () => {
      const handlers = [
        new YouTubeDocumentHandler(),
        new WebsiteDocumentHandler(),
        new FileDocumentHandler()
      ];

      const urlContent = {
        content: '',
        sourceUrl: 'https://example.com/test',
        contentSource: 'url'
      };

      for (const handler of handlers) {
        const request = await handler.buildBackendRequest(baseRequest, urlContent);
        
        // All URL-based documents should use input_files
        expect(request).toHaveProperty('input_files');
        expect(request.input_files).toEqual(['https://example.com/test']);
        
        // Should not have deprecated url parameter
        expect(request).not.toHaveProperty('url');
      }
    });

    it('should use canonical stage names for all handlers', async () => {
      const handlers = [
        new YouTubeDocumentHandler(),
        new WebsiteDocumentHandler(),
        new FileDocumentHandler()
      ];

      const urlContent = {
        content: '',
        sourceUrl: 'https://example.com/test',
        contentSource: 'url'
      };

      for (const handler of handlers) {
        const request = await handler.buildBackendRequest(baseRequest, urlContent);
        
        // All handlers should convert MARKDOWN_CONVERSION to markdown-conversion
        expect(request.stage).toBe('markdown-conversion');
      }
    });
  });

  describe('Stage Chaining - Subsequent Stages Use Previous Output', () => {
    let mockPrisma: any;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();

      // Get the mocked prisma
      const { prisma } = require('../../lib/database');
      mockPrisma = prisma;
    });

    it('should use markdown output for MARKDOWN_OPTIMIZER stage (YouTube)', async () => {
      const handler = new YouTubeDocumentHandler();

      // Mock successful previous stage execution
      mockPrisma.stageExecution.findFirst.mockResolvedValue({
        id: 'exec-123',
        outputFiles: JSON.stringify(['output/test-doc-123/test-doc-123.md']),
        status: 'COMPLETED'
      });

      // Mock file content retrieval from database
      mockPrisma.documentFile.findFirst.mockResolvedValue({
        id: 'file-123',
        filename: 'test-doc-123.md',
        content: '# Test Markdown Content\n\nThis is the converted markdown from YouTube video.'
      });

      const optimizerRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'MARKDOWN_OPTIMIZER' },
        document: { ...baseRequest.document, type: 'youtube' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://www.youtube.com/watch?v=test',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(optimizerRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-optimizer',
        file_content: '# Test Markdown Content\n\nThis is the converted markdown from YouTube video.',
        use_file_upload: true
      });
      expect(request).not.toHaveProperty('input_files');
      expect(mockPrisma.documentFile.findFirst).toHaveBeenCalled();
    });

    it('should use markdown output for CHUNKER stage (Website)', async () => {
      const handler = new WebsiteDocumentHandler();

      // Mock successful previous stage execution (MARKDOWN_OPTIMIZER)
      mockPrisma.stageExecution.findFirst.mockResolvedValue({
        id: 'exec-456',
        outputFiles: JSON.stringify(['output/test-doc-123/test-doc-123.opt.md']),
        status: 'COMPLETED'
      });

      // Mock file content retrieval from database
      mockPrisma.documentFile.findFirst.mockResolvedValue({
        id: 'file-456',
        filename: 'test-doc-123.opt.md',
        content: '# Optimized Website Content\n\nThis is the optimized markdown from website.'
      });

      const chunkerRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'CHUNKER' },
        document: { ...baseRequest.document, type: 'website' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/article',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(chunkerRequest, content);

      expect(request).toMatchObject({
        stage: 'chunker',
        file_content: '# Optimized Website Content\n\nThis is the optimized markdown from website.',
        use_file_upload: true
      });
      expect(request).not.toHaveProperty('input_files');
      expect(mockPrisma.documentFile.findFirst).toHaveBeenCalled();
    });

    it('should use chunks.json for FACT_GENERATOR stage (File)', async () => {
      const handler = new FileDocumentHandler();

      // Mock successful previous stage execution (CHUNKER)
      mockPrisma.stageExecution.findFirst.mockResolvedValue({
        id: 'exec-789',
        outputFiles: JSON.stringify(['output/test-doc-123/test-doc-123.chunks.json']),
        status: 'COMPLETED'
      });

      // Mock file content retrieval
      const mockDownloadFileFromMorag = jest.spyOn(handler as any, 'downloadFileFromMorag');
      mockDownloadFileFromMorag.mockResolvedValue('{"chunks": [{"id": 1, "content": "chunk 1"}, {"id": 2, "content": "chunk 2"}]}');

      const factGenRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'FACT_GENERATOR' },
        document: { ...baseRequest.document, type: 'file' }
      };

      const content = {
        content: 'Original file content',
        contentSource: 'original_file'
      };

      const request = await handler.buildBackendRequest(factGenRequest, content);

      expect(request).toMatchObject({
        stage: 'fact-generator',
        file_content: '{"chunks": [{"id": 1, "content": "chunk 1"}, {"id": 2, "content": "chunk 2"}]}',
        use_file_upload: true
      });
      expect(request).not.toHaveProperty('input_files');
      expect(mockDownloadFileFromMorag).toHaveBeenCalledWith('output/test-doc-123/test-doc-123.chunks.json');
    });

    it('should use facts.json for INGESTOR stage (YouTube)', async () => {
      const handler = new YouTubeDocumentHandler();

      // Mock successful previous stage execution (FACT_GENERATOR)
      mockPrisma.stageExecution.findFirst.mockResolvedValue({
        id: 'exec-101',
        outputFiles: JSON.stringify(['output/test-doc-123/test-doc-123.facts.json']),
        status: 'COMPLETED'
      });

      // Mock file content retrieval from database
      mockPrisma.documentFile.findFirst.mockResolvedValue({
        id: 'file-101',
        filename: 'test-doc-123.facts.json',
        content: '{"facts": [{"entity": "test", "relation": "is", "value": "example"}]}'
      });

      const ingestorRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'INGESTOR' },
        document: { ...baseRequest.document, type: 'youtube' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://www.youtube.com/watch?v=test',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(ingestorRequest, content);

      expect(request).toMatchObject({
        stage: 'ingestor',
        file_content: '{"facts": [{"entity": "test", "relation": "is", "value": "example"}]}',
        use_file_upload: true
      });
      expect(request).not.toHaveProperty('input_files');
      expect(mockPrisma.documentFile.findFirst).toHaveBeenCalled();
    });

    it('should throw error when no previous stage files found', async () => {
      const handler = new YouTubeDocumentHandler();

      // Mock no previous stage execution found
      mockPrisma.stageExecution.findFirst.mockResolvedValue(null);

      const optimizerRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'MARKDOWN_OPTIMIZER' },
        document: { ...baseRequest.document, type: 'youtube' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://www.youtube.com/watch?v=test',
        contentSource: 'url'
      };

      await expect(handler.buildBackendRequest(optimizerRequest, content))
        .rejects.toThrow('No output files found from previous stages for YouTube document test-doc-123, stage MARKDOWN_OPTIMIZER');
    });

    it('should retrieve content from database', async () => {
      const handler = new WebsiteDocumentHandler();

      // Mock successful previous stage execution
      mockPrisma.stageExecution.findFirst.mockResolvedValue({
        id: 'exec-123',
        outputFiles: JSON.stringify(['output/test-doc-123/test-doc-123.md']),
        status: 'COMPLETED'
      });

      // Mock database success
      mockPrisma.documentFile.findFirst.mockResolvedValue({
        id: 'file-123',
        filename: 'test-doc-123.md',
        content: '# Content from database\n\nThis was retrieved from local database.'
      });

      const optimizerRequest = {
        ...baseRequest,
        job: { ...baseRequest.job, stage: 'MARKDOWN_OPTIMIZER' },
        document: { ...baseRequest.document, type: 'website' }
      };

      const content = {
        content: '',
        sourceUrl: 'https://example.com/test',
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(optimizerRequest, content);

      expect(request).toMatchObject({
        stage: 'markdown-optimizer',
        file_content: '# Content from database\n\nThis was retrieved from local database.',
        use_file_upload: true
      });
      expect(mockPrisma.documentFile.findFirst).toHaveBeenCalled();
    });
  });
});
