import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { GET, POST, PUT } from '../../app/api/scheduler/route';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('../../lib/services/jobScheduler');

const mockJobScheduler = jobScheduler as {
  getStatus: Mock;
  getStats: Mock;
  start: Mock;
  stop: Mock;
  restart: Mock;
  triggerJob: Mock;
  updateConfig: Mock;
};

// Helper to create mock NextRequest
function createMockRequest(method: string, url: string, body?: any): NextRequest {
  const request = {
    method,
    url,
    json: vi.fn().mockResolvedValue(body || {}),
    text: vi.fn().mockResolvedValue(JSON.stringify(body || {})),
    nextUrl: {
      searchParams: new URLSearchParams(url.split('?')[1] || '')
    }
  } as unknown as NextRequest;
  
  return request;
}

describe('/api/scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/scheduler', () => {
    it('should return scheduler status', async () => {
      const mockStatus = {
        isRunning: true,
        stats: {
          totalJobs: 100,
          pendingJobs: 10,
          runningJobs: 2,
          completedJobs: 85,
          failedJobs: 3
        },
        lastHealthCheck: new Date(),
        config: {
          maxConcurrentJobs: 5,
          processingInterval: 30000,
          healthCheckInterval: 300000
        }
      };
      
      mockJobScheduler.getStatus.mockResolvedValue(mockStatus);
      
      const request = createMockRequest('GET', '/api/scheduler');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockStatus);
      expect(mockJobScheduler.getStatus).toHaveBeenCalled();
    });

    it('should return scheduler statistics when stats=true', async () => {
      const mockStats = {
        totalJobs: 100,
        pendingJobs: 10,
        runningJobs: 2,
        completedJobs: 85,
        failedJobs: 3,
        averageProcessingTime: 45000,
        successRate: 0.97
      };
      
      mockJobScheduler.getStats.mockResolvedValue(mockStats);
      
      const request = createMockRequest('GET', '/api/scheduler?stats=true');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockStats);
      expect(mockJobScheduler.getStats).toHaveBeenCalled();
    });

    it('should handle scheduler errors', async () => {
      mockJobScheduler.getStatus.mockRejectedValue(new Error('Scheduler error'));
      
      const request = createMockRequest('GET', '/api/scheduler');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get scheduler status');
    });
  });

  describe('POST /api/scheduler', () => {
    it('should start the scheduler', async () => {
      mockJobScheduler.start.mockResolvedValue({
        success: true,
        message: 'Scheduler started successfully'
      });
      
      const request = createMockRequest('POST', '/api/scheduler', { action: 'start' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Scheduler started successfully');
      expect(mockJobScheduler.start).toHaveBeenCalled();
    });

    it('should stop the scheduler', async () => {
      mockJobScheduler.stop.mockResolvedValue({
        success: true,
        message: 'Scheduler stopped successfully'
      });
      
      const request = createMockRequest('POST', '/api/scheduler', { action: 'stop' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockJobScheduler.stop).toHaveBeenCalled();
    });

    it('should restart the scheduler', async () => {
      mockJobScheduler.restart.mockResolvedValue({
        success: true,
        message: 'Scheduler restarted successfully'
      });
      
      const request = createMockRequest('POST', '/api/scheduler', { action: 'restart' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockJobScheduler.restart).toHaveBeenCalled();
    });

    it('should trigger a specific job', async () => {
      mockJobScheduler.triggerJob.mockResolvedValue({
        success: true,
        jobId: 'job-123',
        message: 'Job triggered successfully'
      });
      
      const request = createMockRequest('POST', '/api/scheduler', {
        action: 'trigger',
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION'
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe('job-123');
      expect(mockJobScheduler.triggerJob).toHaveBeenCalledWith('doc-1', 'MARKDOWN_CONVERSION');
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('POST', '/api/scheduler', { action: 'invalid' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });

    it('should return 400 for missing documentId in trigger action', async () => {
      const request = createMockRequest('POST', '/api/scheduler', {
        action: 'trigger',
        stage: 'MARKDOWN_CONVERSION'
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('documentId and stage are required for trigger action');
    });

    it('should handle scheduler operation errors', async () => {
      mockJobScheduler.start.mockResolvedValue({
        success: false,
        error: 'Scheduler is already running'
      });
      
      const request = createMockRequest('POST', '/api/scheduler', { action: 'start' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Scheduler is already running');
    });
  });

  describe('PUT /api/scheduler', () => {
    it('should update scheduler configuration', async () => {
      const newConfig = {
        maxConcurrentJobs: 10,
        processingInterval: 15000,
        healthCheckInterval: 180000
      };
      
      mockJobScheduler.updateConfig.mockResolvedValue({
        success: true,
        config: newConfig,
        message: 'Configuration updated successfully'
      });
      
      const request = createMockRequest('PUT', '/api/scheduler', newConfig);
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config).toEqual(newConfig);
      expect(mockJobScheduler.updateConfig).toHaveBeenCalledWith(newConfig);
    });

    it('should handle configuration validation errors', async () => {
      mockJobScheduler.updateConfig.mockResolvedValue({
        success: false,
        error: 'Invalid configuration: maxConcurrentJobs must be positive'
      });
      
      const invalidConfig = {
        maxConcurrentJobs: -1
      };
      
      const request = createMockRequest('PUT', '/api/scheduler', invalidConfig);
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid configuration: maxConcurrentJobs must be positive');
    });

    it('should handle update errors', async () => {
      mockJobScheduler.updateConfig.mockRejectedValue(new Error('Update failed'));
      
      const request = createMockRequest('PUT', '/api/scheduler', { maxConcurrentJobs: 5 });
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update scheduler configuration');
    });
  });
});