/**
 * Integration test to verify backend API compliance
 * Tests that our document handlers generate correct API calls according to BACKEND_API_GUIDE.md
 */

import { YouTubeDocumentHandler, WebsiteDocumentHandler, FileDocumentHandler } from '../../lib/services/jobs/documentHandlers';

// Mock document and job data
const mockDocument = {
  id: 'test-doc-123',
  name: 'Test Document',
  type: 'youtube',
  realmId: 'test-realm',
  realm: {
    servers: []
  }
};

const mockJob = {
  id: 'test-job-123',
  stage: 'MARKDOWN_CONVERSION',
  documentId: 'test-doc-123'
};

const mockRequest = {
  documentId: 'test-doc-123',
  stage: 'MARKDOWN_CONVERSION',
  executionId: 'test-execution-123',
  document: mockDocument,
  job: mockJob
};

const mockContent = {
  content: '',
  sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  contentSource: 'url'
};

describe('Backend API Compliance Tests', () => {
  describe('YouTubeDocumentHandler', () => {
    let handler: YouTubeDocumentHandler;

    beforeEach(() => {
      handler = new YouTubeDocumentHandler();
    });

    it('should generate correct API request for YouTube URL', async () => {
      const request = await handler.buildBackendRequest(mockRequest, mockContent);

      // Verify the request structure matches API guide
      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        output_dir: './output/test-doc-123',
        webhook_url: expect.stringContaining('/api/webhooks/stages'),
        config: {
          extract_metadata: true,
          extract_transcript: true,
          use_proxy: true
        }
      });

      // Verify no deprecated parameters
      expect(request).not.toHaveProperty('url');
      expect(request.config).not.toHaveProperty('input_type');
    });

    it('should handle YouTube URL corruption fix', async () => {
      const corruptedContent = {
        content: '',
        sourceUrl: 'https:/www.youtube.com/watch?v=dQw4w9WgXcQ', // Missing second slash
        contentSource: 'url'
      };

      const request = await handler.buildBackendRequest(mockRequest, corruptedContent);

      // The URL should be passed as-is to input_files (corruption fix happens in MoragService)
      expect(request.input_files).toEqual(['https:/www.youtube.com/watch?v=dQw4w9WgXcQ']);
    });
  });

  describe('WebsiteDocumentHandler', () => {
    let handler: WebsiteDocumentHandler;

    beforeEach(() => {
      handler = new WebsiteDocumentHandler();
    });

    it('should generate correct API request for website URL', async () => {
      const websiteContent = {
        content: '',
        sourceUrl: 'https://example.com/article',
        contentSource: 'url'
      };

      const websiteDoc = { ...mockDocument, type: 'website' };
      const websiteRequest = { ...mockRequest, document: websiteDoc };

      const request = await handler.buildBackendRequest(websiteRequest, websiteContent);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://example.com/article'],
        output_dir: './output/test-doc-123',
        webhook_url: expect.stringContaining('/api/webhooks/stages'),
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

      // Verify no deprecated parameters
      expect(request).not.toHaveProperty('url');
      expect(request.config).not.toHaveProperty('input_type');
    });
  });

  describe('FileDocumentHandler', () => {
    let handler: FileDocumentHandler;

    beforeEach(() => {
      handler = new FileDocumentHandler();
    });

    it('should generate correct API request for URL-based file', async () => {
      const urlContent = {
        content: '',
        sourceUrl: 'https://example.com/document.pdf',
        contentSource: 'url'
      };

      const fileDoc = { ...mockDocument, type: 'file' };
      const fileRequest = { ...mockRequest, document: fileDoc };

      const request = await handler.buildBackendRequest(fileRequest, urlContent);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        input_files: ['https://example.com/document.pdf'],
        output_dir: './output/test-doc-123',
        webhook_url: expect.stringContaining('/api/webhooks/stages')
      });

      // Verify no deprecated parameters
      expect(request).not.toHaveProperty('url');
    });

    it('should handle file content correctly', async () => {
      const fileContent = {
        contentSource: 'original_file',
        content: 'Test file content'
      };

      const request = await handler.buildBackendRequest(mockRequest, fileContent);

      expect(request).toMatchObject({
        stage: 'markdown-conversion',
        file_content: 'Test file content',
        use_file_upload: true,
        output_dir: './output/test-doc-123',
        webhook_url: expect.stringContaining('/api/webhooks/stages')
      });

      // Should not have input_files for file content
      expect(request).not.toHaveProperty('input_files');
      expect(request).not.toHaveProperty('url');
    });
  });

  describe('Stage Name Conversion', () => {
    let handler: YouTubeDocumentHandler;

    beforeEach(() => {
      handler = new YouTubeDocumentHandler();
    });

    it('should convert stage names to canonical format', async () => {
      const testCases = [
        { input: 'MARKDOWN_CONVERSION', expected: 'markdown-conversion' },
        { input: 'MARKDOWN_OPTIMIZER', expected: 'markdown-optimizer' },
        { input: 'FACT_GENERATOR', expected: 'fact-generator' }
      ];

      for (const testCase of testCases) {
        const jobWithStage = { ...mockJob, stage: testCase.input };
        const requestWithStage = { ...mockRequest, job: jobWithStage, stage: testCase.input };
        const request = await handler.buildBackendRequest(requestWithStage, mockContent);
        
        expect(request.stage).toBe(testCase.expected);
      }
    });
  });
});
