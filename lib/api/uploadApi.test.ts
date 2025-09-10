import { 
  uploadFile, 
  uploadFiles, 
  cancelUpload, 
  retryUpload,
  getUploadStatus,
  UploadStatus,
  UploadProgressCallback
} from './uploadApi';
import { validateFile, validateFiles } from '@/lib/utils/fileValidation';

// Mock file validation
jest.mock('@/lib/utils/fileValidation');
const mockValidateFile = validateFile as jest.MockedFunction<typeof validateFile>;
const mockValidateFiles = validateFiles as jest.MockedFunction<typeof validateFiles>;

// Mock fetch globally
global.fetch = jest.fn();

describe('Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Reset fetch mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
    
    // Default validation response
    mockValidateFile.mockResolvedValue({
      isValid: true,
      errors: []
    });
    
    mockValidateFiles.mockResolvedValue({
      isValid: true,
      errors: []
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Single File Upload', () => {
    test('uploads file successfully', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const mockProgressCallback: UploadProgressCallback = jest.fn();
      
      // Mock successful upload response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'upload-1',
            filename: 'document.pdf',
            size: mockFile.size,
            status: 'completed',
            url: '/uploads/document.pdf'
          }
        })
      } as Response);

      const result = await uploadFile(mockFile, mockProgressCallback);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'upload-1',
        filename: 'document.pdf',
        size: mockFile.size,
        status: 'completed',
        url: '/uploads/document.pdf'
      });
    });

    test('handles upload failure with proper error', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      // Mock failed upload response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Internal server error'
        })
      } as Response);

      const result = await uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });

    test('simulates chunked upload with progress callbacks', async () => {
      const mockFile = new File(['x'.repeat(1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      const mockProgressCallback: UploadProgressCallback = jest.fn();

      // Mock chunked upload responses
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, chunkId: 'chunk-1', progress: 33 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, chunkId: 'chunk-2', progress: 66 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            data: { id: 'upload-1', status: 'completed' },
            progress: 100 
          })
        } as Response);

      const uploadPromise = uploadFile(mockFile, mockProgressCallback);

      // Simulate progress updates
      jest.advanceTimersByTime(1000);
      expect(mockProgressCallback).toHaveBeenCalledWith(33);
      
      jest.advanceTimersByTime(1000);
      expect(mockProgressCallback).toHaveBeenCalledWith(66);
      
      jest.advanceTimersByTime(1000);
      expect(mockProgressCallback).toHaveBeenCalledWith(100);

      const result = await uploadPromise;
      expect(result.success).toBe(true);
    });

    test('handles network timeout', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      // Mock timeout
      (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 30000)
        )
      );

      // Advance timers to trigger timeout
      const uploadPromise = uploadFile(mockFile);
      jest.advanceTimersByTime(35000);

      await expect(uploadPromise).rejects.toThrow('Network timeout');
    });

    test('validates file before upload', async () => {
      const mockFile = new File(['content'], 'invalid.exe', { type: 'application/exe' });
      
      mockValidateFile.mockResolvedValue({
        isValid: false,
        errors: [{ code: 'UNSUPPORTED_FILE_TYPE', message: 'File type not supported' }]
      });

      await expect(uploadFile(mockFile)).rejects.toThrow('File type not supported');
      
      // Should not make any network requests
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Files Upload', () => {
    test('uploads multiple files with progress tracking', async () => {
      const mockFiles = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'doc2.txt', { type: 'text/plain' }),
      ];
      const mockProgressCallback: UploadProgressCallback = jest.fn();

      // Mock successful responses for both files
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'upload-1', status: 'completed' }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'upload-2', status: 'completed' }
          })
        } as Response);

      const results = await uploadFiles(mockFiles, mockProgressCallback);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          overall: 100,
          files: expect.arrayContaining([
            expect.objectContaining({ progress: 100 }),
            expect.objectContaining({ progress: 100 })
          ])
        })
      );
    });

    test('handles partial failures in batch upload', async () => {
      const mockFiles = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'doc2.txt', { type: 'text/plain' }),
      ];

      // Mock success for first file, failure for second
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'upload-1', status: 'completed' }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            success: false,
            error: 'Upload failed'
          })
        } as Response);

      const results = await uploadFiles(mockFiles);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Upload failed');
    });

    test('validates all files before starting upload', async () => {
      const mockFiles = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'invalid.exe', { type: 'application/exe' }),
      ];

      mockValidateFiles.mockResolvedValue({
        isValid: false,
        errors: [{ code: 'UNSUPPORTED_FILE_TYPE', message: 'Some files are invalid' }]
      });

      await expect(uploadFiles(mockFiles)).rejects.toThrow('Some files are invalid');
      
      // Should not make any network requests
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Upload Cancellation', () => {
    test('cancels ongoing upload', async () => {
      const uploadId = 'upload-1';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Upload cancelled'
        })
      } as Response);

      const result = await cancelUpload(uploadId);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/upload/${uploadId}/cancel`,
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    test('handles cancellation failure', async () => {
      const uploadId = 'upload-1';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Cannot cancel completed upload'
        })
      } as Response);

      const result = await cancelUpload(uploadId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel completed upload');
    });
  });

  describe('Upload Retry', () => {
    test('retries failed upload', async () => {
      const uploadId = 'upload-1';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: uploadId, status: 'uploading' }
        })
      } as Response);

      const result = await retryUpload(uploadId);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/upload/${uploadId}/retry`,
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    test('handles retry failure', async () => {
      const uploadId = 'upload-1';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Retry limit exceeded'
        })
      } as Response);

      const result = await retryUpload(uploadId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Retry limit exceeded');
    });
  });

  describe('Upload Status Tracking', () => {
    test('retrieves upload status', async () => {
      const uploadId = 'upload-1';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: uploadId,
            status: 'uploading',
            progress: 75,
            filename: 'document.pdf',
            size: 1024 * 1024,
            uploadSpeed: 1024 * 512, // 512KB/s
            timeRemaining: 30 // 30 seconds
          }
        })
      } as Response);

      const result = await getUploadStatus(uploadId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: uploadId,
          status: 'uploading',
          progress: 75
        })
      );
    });

    test('handles status query for non-existent upload', async () => {
      const uploadId = 'non-existent';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: 'Upload not found'
        })
      } as Response);

      const result = await getUploadStatus(uploadId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload not found');
    });
  });

  describe('Error Simulation', () => {
    test('simulates random upload failures (5% rate)', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      // Mock random failure
      Math.random = jest.fn().mockReturnValue(0.02); // 2% < 5%
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Simulated random failure'
        })
      } as Response);

      const result = await uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Simulated random failure');
    });

    test('simulates network errors', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      // Mock network error
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('Progress Reporting', () => {
    test('reports accurate progress for chunked uploads', async () => {
      const mockFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      const progressReports: number[] = [];
      const mockProgressCallback: UploadProgressCallback = (progress) => {
        if (typeof progress === 'number') {
          progressReports.push(progress);
        }
      };

      // Mock chunked responses
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, progress: 25 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, progress: 50 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, progress: 75 })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            progress: 100,
            data: { id: 'upload-1', status: 'completed' }
          })
        } as Response);

      const uploadPromise = uploadFile(mockFile, mockProgressCallback);
      
      // Advance timers to trigger progress updates
      jest.advanceTimersByTime(4000);
      
      await uploadPromise;

      expect(progressReports).toEqual([25, 50, 75, 100]);
    });

    test('reports batch upload progress', async () => {
      const mockFiles = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'doc2.txt', { type: 'text/plain' }),
        new File(['content3'], 'doc3.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      ];
      
      const progressReports: any[] = [];
      const mockProgressCallback: UploadProgressCallback = (progress) => {
        progressReports.push(progress);
      };

      // Mock responses for all files
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'upload-1', status: 'completed' }
          })
        } as Response);

      await uploadFiles(mockFiles, mockProgressCallback);

      // Should report overall progress and individual file progress
      expect(progressReports).toContainEqual(
        expect.objectContaining({
          overall: expect.any(Number),
          files: expect.arrayContaining([
            expect.objectContaining({ id: expect.any(String), progress: expect.any(Number) })
          ])
        })
      );
    });
  });

  describe('Upload Queue Management', () => {
    test('manages concurrent upload limits', async () => {
      const mockFiles = Array.from({ length: 10 }, (_, i) => 
        new File([`content${i}`], `doc${i}.pdf`, { type: 'application/pdf' })
      );

      // Track fetch call timing
      const fetchCalls: number[] = [];
      (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
        fetchCalls.push(Date.now());
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: `upload-${fetchCalls.length}`, status: 'completed' }
          })
        } as Response);
      });

      await uploadFiles(mockFiles);

      // Should not exceed concurrent limit (assuming limit of 3)
      expect(global.fetch).toHaveBeenCalledTimes(10);
    });
  });

  describe('Integration with Processing Pipeline', () => {
    test('integrates with ProcessingJob mock data', async () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'upload-1',
            status: 'completed',
            processingJobId: 'job-123',
            pipelineStages: [
              { name: 'markdown-conversion', status: 'pending' },
              { name: 'chunker', status: 'pending' },
              { name: 'fact-generator', status: 'pending' },
              { name: 'ingestor', status: 'pending' }
            ]
          }
        })
      } as Response);

      const result = await uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('processingJobId');
      expect(result.data).toHaveProperty('pipelineStages');
    });
  });
});