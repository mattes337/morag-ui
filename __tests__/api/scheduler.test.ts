import { GET, POST, PUT } from '../../app/api/scheduler/route';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { NextRequest } from 'next/server';

// Mock the auth module
jest.mock('../../lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN'
  })
}));

// Mock the jobScheduler
jest.mock('../../lib/services/jobScheduler', () => ({
  jobScheduler: {
    getStats: jest.fn(),
    getConfig: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    restart: jest.fn().mockResolvedValue(undefined),
    triggerProcessing: jest.fn().mockResolvedValue(undefined),
    updateConfig: jest.fn()
  }
}));

const mockJobScheduler = jest.mocked(jobScheduler);

// Helper to create mock NextRequest
function createMockRequest(method: string, url: string, body?: any): NextRequest {
  const request = {
    method,
    url,
    json: jest.fn().mockResolvedValue(body || {}) as any,
    text: jest.fn().mockResolvedValue(JSON.stringify(body || {})) as any,
    nextUrl: {
      searchParams: new URLSearchParams(url.split('?')[1] || '')
    }
  } as unknown as NextRequest;
  
  return request;
}

describe('/api/scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/scheduler', () => {
    it('should return scheduler status', async () => {
      const mockStatus = {
        isRunning: true,
        totalJobsProcessed: 10,
        pendingJobs: 2,
        failedJobs: 0,
        lastProcessedAt: new Date(),
        uptime: 3600000,
        averageProcessingTime: 2500
      };
      
      mockJobScheduler.getStats.mockReturnValue(mockStatus);
      
      const request = createMockRequest('GET', '/api/scheduler');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.stats).toEqual(mockStatus);
      expect(data.config).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(mockJobScheduler.getStats).toHaveBeenCalled();
    });

    it('should return scheduler statistics when stats=true', async () => {
      const mockStats = {
        isRunning: true,
        totalJobsProcessed: 100,
        pendingJobs: 10,
        failedJobs: 3,
        lastProcessedAt: new Date(),
        uptime: 7200000,
        averageProcessingTime: 45000
      };
      
      mockJobScheduler.getStats.mockReturnValue(mockStats);
      
      const request = createMockRequest('GET', '/api/scheduler?stats=true');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.stats).toEqual(mockStats);
      expect(data.config).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(mockJobScheduler.getStats).toHaveBeenCalled();
    });

    it('should handle scheduler errors', async () => {
      mockJobScheduler.getStats.mockImplementation(() => {
        throw new Error('Scheduler error');
      });
      
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
        success: true
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
        success: true
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
        success: true
      });
      
      const request = createMockRequest('POST', '/api/scheduler', { action: 'restart' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockJobScheduler.restart).toHaveBeenCalled();
    });

    it('should trigger job processing', async () => {
      mockJobScheduler.triggerProcessing.mockResolvedValue(undefined);
      
      const request = createMockRequest('POST', '/api/scheduler', {
        action: 'trigger'
      });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Job processing triggered manually');
      expect(mockJobScheduler.triggerProcessing).toHaveBeenCalled();
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('POST', '/api/scheduler', { action: 'invalid' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action. Must be one of: start, stop, restart, trigger');
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
      
      mockJobScheduler.updateConfig.mockReturnValue(undefined);
      mockJobScheduler.getConfig = jest.fn().mockReturnValue(newConfig);
      
      const request = createMockRequest('PUT', '/api/scheduler', { config: newConfig });
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config).toEqual(newConfig);
      expect(mockJobScheduler.updateConfig).toHaveBeenCalledWith(newConfig);
    });

    it('should handle configuration validation errors', async () => {
      const invalidConfig = {
        maxConcurrentJobs: -1
      };
      
      const request = createMockRequest('PUT', '/api/scheduler', { config: invalidConfig });
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Max concurrent jobs must be between 1 and 20');
    });

    it('should handle update errors', async () => {
      mockJobScheduler.updateConfig.mockImplementation(() => {
        throw new Error('Update failed');
      });
      
      const request = createMockRequest('PUT', '/api/scheduler', { config: { maxConcurrentJobs: 5 } });
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update scheduler configuration');
    });
  });
});