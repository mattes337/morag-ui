/**
 * Integration test to verify all document types can be processed
 * Tests YouTube, Website, PDF, Audio, Video, Image, and Text documents
 */

import { YouTubeDocumentHandler, WebsiteDocumentHandler, FileDocumentHandler } from '../../lib/services/jobs/documentHandlers';

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
});
