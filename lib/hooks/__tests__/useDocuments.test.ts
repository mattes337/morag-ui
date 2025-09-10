/**
 * Tests for Document Management Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useDocuments, useDocumentById, useDocumentUpload, useDocumentDelete, useDocumentStats, useDocumentProcessing } from '../useDocuments';
import { mockApiClient } from '../../api/mockApiClient';

// Mock the API client
jest.mock('../../api/mockApiClient');

const mockApiClientInstance = mockApiClient as jest.Mocked<typeof mockApiClient>;

describe('useDocuments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockDocuments = [
        { id: 'doc1', name: 'Document 1', status: 'completed' },
        { id: 'doc2', name: 'Document 2', status: 'processing' }
      ];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockDocuments,
        timestamp: new Date().toISOString(),
        requestId: 'test-1'
      });

      const { result } = renderHook(() => useDocuments());

      expect(result.current.loading).toBe(true);

      // Wait for the hook to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/documents');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockDocuments);
      expect(result.current.error).toBeUndefined();
    });

    it('should fetch documents with realm filtering', async () => {
      const realmId = 'realm-123';
      const mockDocuments = [{ id: 'doc1', name: 'Document 1', realmId }];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockDocuments,
        timestamp: new Date().toISOString(),
        requestId: 'test-2'
      });

      const { result } = renderHook(() => useDocuments(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/documents?realm=${realmId}`);
      expect(result.current.data).toEqual(mockDocuments);
    });

    it('should handle API errors', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        statusCode: 500
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-3'
      });

      const { result } = renderHook(() => useDocuments());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useDocumentById', () => {
    it('should fetch single document by ID', async () => {
      const documentId = 'doc-123';
      const mockDocument = { id: documentId, name: 'Test Document', status: 'completed' };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockDocument,
        timestamp: new Date().toISOString(),
        requestId: 'test-4'
      });

      const { result } = renderHook(() => useDocumentById(documentId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/documents/${documentId}`);
      expect(result.current.data).toEqual(mockDocument);
    });

    it('should not make API call when ID is empty', () => {
      renderHook(() => useDocumentById(''));

      expect(mockApiClientInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('useDocumentUpload', () => {
    it('should upload documents successfully', async () => {
      const mockUploadResponse = {
        documents: [{
          id: 'doc-new',
          filename: 'test.pdf',
          size: 1024,
          uploadUrl: '/api/documents/doc-new/download',
          status: 'completed' as const
        }],
        batchId: 'batch-123'
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: { documentId: 'doc-new', pipelineId: 'pipeline-123' },
        timestamp: new Date().toISOString(),
        requestId: 'test-5'
      });

      const { result } = renderHook(() => useDocumentUpload());

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const files = [mockFile];
      const realmId = 'realm-123';

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadDocuments(files, realmId);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(uploadResult).toBeDefined();
      expect(uploadResult.documents).toHaveLength(1);
    });

    it('should handle upload errors', async () => {
      const mockError = {
        code: 'UPLOAD_ERROR',
        message: 'Upload failed',
        statusCode: 500
      };

      mockApiClientInstance.post.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDocumentUpload());

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const files = [mockFile];
      const realmId = 'realm-123';

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadDocuments(files, realmId);
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(uploadResult).toBeNull();
    });
  });

  describe('useDocumentDelete', () => {
    it('should delete document successfully', async () => {
      mockApiClientInstance.delete.mockResolvedValue({
        success: true,
        data: { message: 'Document deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: 'test-6'
      });

      const { result } = renderHook(() => useDocumentDelete());

      let deleteResult: boolean;
      await act(async () => {
        deleteResult = await result.current.deleteDocument('doc-123');
      });

      expect(deleteResult!).toBe(true);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiClientInstance.delete).toHaveBeenCalledWith('/api/documents/doc-123');
    });

    it('should handle delete errors', async () => {
      const mockError = {
        code: 'DELETE_ERROR',
        message: 'Delete failed',
        statusCode: 500
      };

      mockApiClientInstance.delete.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-7'
      });

      const { result } = renderHook(() => useDocumentDelete());

      let deleteResult: boolean;
      await act(async () => {
        deleteResult = await result.current.deleteDocument('doc-123');
      });

      expect(deleteResult!).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDocumentStats', () => {
    it('should fetch document statistics', async () => {
      const mockStats = {
        totalDocuments: 150,
        totalSize: 1048576,
        byType: { pdf: 75, docx: 50, txt: 25 },
        byStatus: { completed: 120, processing: 20, failed: 10 },
        recentUploads: 5,
        processingQueue: 3
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockStats,
        timestamp: new Date().toISOString(),
        requestId: 'test-8'
      });

      const { result } = renderHook(() => useDocumentStats());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/documents/stats');
      expect(result.current.data).toEqual(mockStats);
    });
  });

  describe('useDocumentProcessing', () => {
    it('should fetch document processing status', async () => {
      const documentId = 'doc-123';
      const mockStatus = {
        documentId,
        status: 'processing' as const,
        currentStage: 'chunker',
        progress: 65,
        stages: [
          { name: 'markdown-conversion', status: 'completed' as const, progress: 100 },
          { name: 'chunker', status: 'running' as const, progress: 65 },
          { name: 'ingestor', status: 'pending' as const, progress: 0 }
        ]
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockStatus,
        timestamp: new Date().toISOString(),
        requestId: 'test-9'
      });

      const { result } = renderHook(() => useDocumentProcessing(documentId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/documents/${documentId}/processing`);
      expect(result.current.data).toEqual(mockStatus);
    });
  });
});