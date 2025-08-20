import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import { GET, POST, DELETE } from '../../app/api/processing-jobs/route';
import { GET as getById, PUT, DELETE as deleteById } from '../../app/api/processing-jobs/[id]/route';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { PrismaClient, JobStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('../../lib/services/backgroundJobService');
jest.mock('@prisma/client');

const mockBackgroundJobService = backgroundJobService as {
  createJob: MockedFunction<any>;
  cancelJob: MockedFunction<any>;
  getStats: MockedFunction<any>;
};

const mockPrisma = {
  processingJob: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn()
  },
  document: {
    findUnique: jest.fn()
  }
} as any;

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

// Helper to create mock NextRequest
function createMockRequest(method: string, url: string, body?: any): NextRequest {
  const jsonMock = jest.fn() as jest.MockedFunction<() => Promise<any>>;
  jsonMock.mockResolvedValue(body || {});
  const textMock = jest.fn() as jest.MockedFunction<() => Promise<string>>;
  textMock.mockResolvedValue(JSON.stringify(body || {}));
  
  const request = {
    method,
    url,
    json: jsonMock,
    text: textMock,
    nextUrl: {
      searchParams: new URLSearchParams()
    }
  } as unknown as NextRequest;
  
  return request;
}

describe('/api/processing-jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/processing-jobs', () => {
    const mockJobs = [
      {
        id: 'job-1',
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        status: JobStatus.PENDING,
        priority: 1,
        createdAt: new Date(),
        scheduledAt: new Date()
      },
      {
        id: 'job-2',
        documentId: 'doc-2',
        stage: 'CHUNKER',
        status: JobStatus.PROCESSING,
        priority: 0,
        createdAt: new Date(),
        scheduledAt: new Date()
      }
    ];

    beforeEach(() => {
      mockPrisma.processingJob.findMany.mockResolvedValue(mockJobs);
      mockPrisma.processingJob.count.mockResolvedValue(2);
      mockPrisma.processingJob.groupBy.mockResolvedValue([
        { status: JobStatus.PENDING, _count: { id: 1 } },
        { status: JobStatus.PROCESSING, _count: { id: 1 } }
      ]);
    });

    it('should return all processing jobs with pagination', async () => {
      const request = createMockRequest('GET', '/api/processing-jobs?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toEqual(mockJobs);
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.offset).toBe(0);
      expect(data.summary.byStatus).toHaveLength(2);
    });

    it('should filter jobs by documentId', async () => {
      const request = createMockRequest('GET', '/api/processing-jobs?documentId=doc-1');
      await GET(request);

      expect(mockPrisma.processingJob.findMany).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      });
    });

    it('should filter jobs by status', async () => {
      const request = createMockRequest('GET', '/api/processing-jobs?status=PENDING');
      await GET(request);

      expect(mockPrisma.processingJob.findMany).toHaveBeenCalledWith({
        where: { status: JobStatus.PENDING },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      });
    });

    it('should filter jobs by stage', async () => {
      const request = createMockRequest('GET', '/api/processing-jobs?stage=MARKDOWN_CONVERSION');
      await GET(request);

      expect(mockPrisma.processingJob.findMany).toHaveBeenCalledWith({
        where: { stage: 'MARKDOWN_CONVERSION' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.processingJob.findMany.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('GET', '/api/processing-jobs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch processing jobs');
    });
  });

  describe('POST /api/processing-jobs', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'test.pdf',
      state: 'uploaded'
    };

    const mockJob = {
      id: 'job-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      status: JobStatus.PENDING,
      priority: 1,
      createdAt: new Date()
    };

    beforeEach(() => {
      mockPrisma.document.findUnique.mockResolvedValue(mockDocument);
      mockBackgroundJobService.createJob.mockResolvedValue(mockJob);
    });

    it('should create a new processing job', async () => {
      const request = createMockRequest('POST', '/api/processing-jobs', {
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 1
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.job).toEqual(mockJob);
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 1
      });
    });

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest('POST', '/api/processing-jobs', {
        stage: 'MARKDOWN_CONVERSION'
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('documentId and stage are required');
    });

    it('should return 400 for invalid stage', async () => {
      const request = createMockRequest('POST', '/api/processing-jobs', {
        documentId: 'doc-1',
        stage: 'INVALID_STAGE'
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid stage');
    });

    it('should return 404 for non-existent document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      const request = createMockRequest('POST', '/api/processing-jobs', {
        documentId: 'non-existent',
        stage: 'MARKDOWN_CONVERSION'
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Document not found');
    });
  });

  describe('DELETE /api/processing-jobs', () => {
    it('should cancel jobs by IDs', async () => {
      mockPrisma.processingJob.deleteMany.mockResolvedValue({ count: 2 });

      const request = createMockRequest('DELETE', '/api/processing-jobs', {
        jobIds: ['job-1', 'job-2']
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cancelled).toBe(2);
      expect(mockPrisma.processingJob.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['job-1', 'job-2'] },
          status: { in: [JobStatus.PENDING, JobStatus.WAITING_FOR_REMOTE_WORKER] }
        }
      });
    });

    it('should cancel all pending jobs for a document', async () => {
      mockPrisma.processingJob.deleteMany.mockResolvedValue({ count: 3 });

      const request = createMockRequest('DELETE', '/api/processing-jobs', {
        documentId: 'doc-1'
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cancelled).toBe(3);
      expect(mockPrisma.processingJob.deleteMany).toHaveBeenCalledWith({
        where: {
          documentId: 'doc-1',
          status: { in: [JobStatus.PENDING, JobStatus.WAITING_FOR_REMOTE_WORKER] }
        }
      });
    });

    it('should return 400 when neither jobIds nor documentId provided', async () => {
      const request = createMockRequest('DELETE', '/api/processing-jobs', {});
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Either jobIds or documentId must be provided');
    });
  });
});

describe('/api/processing-jobs/[id]', () => {
  const mockJob = {
    id: 'job-1',
    documentId: 'doc-1',
    stage: 'MARKDOWN_CONVERSION',
    status: JobStatus.PENDING,
    priority: 1,
    createdAt: new Date(),
    scheduledAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/processing-jobs/[id]', () => {
    it('should return a specific job', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(mockJob);

      const request = createMockRequest('GET', '/api/processing-jobs/job-1');
      const response = await getById(request, { params: { id: 'job-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.job).toEqual(mockJob);
      expect(mockPrisma.processingJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' }
      });
    });

    it('should return 404 for non-existent job', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(null);

      const request = createMockRequest('GET', '/api/processing-jobs/non-existent');
      const response = await getById(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Job not found');
    });
  });

  describe('PUT /api/processing-jobs/[id]', () => {
    beforeEach(() => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(mockJob);
      mockPrisma.processingJob.update.mockResolvedValue({ ...mockJob, status: JobStatus.CANCELLED });
    });

    it('should cancel a job', async () => {
      const request = createMockRequest('PUT', '/api/processing-jobs/job-1', {
        action: 'cancel'
      });
      const response = await PUT(request, { params: { id: 'job-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.job.status).toBe(JobStatus.CANCELLED);
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.CANCELLED,
          completedAt: expect.any(Date),
          error: 'Job cancelled by user'
        }
      });
    });

    it('should reschedule a job', async () => {
      const newScheduleTime = new Date(Date.now() + 60000);
      const request = createMockRequest('PUT', '/api/processing-jobs/job-1', {
        action: 'reschedule',
        scheduledAt: newScheduleTime.toISOString()
      });
      const response = await PUT(request, { params: { id: 'job-1' } });

      expect(response.status).toBe(200);
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          scheduledAt: newScheduleTime,
          status: JobStatus.PENDING
        }
      });
    });

    it('should update job priority', async () => {
      const request = createMockRequest('PUT', '/api/processing-jobs/job-1', {
        action: 'update_priority',
        priority: 5
      });
      const response = await PUT(request, { params: { id: 'job-1' } });

      expect(response.status).toBe(200);
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: { priority: 5 }
      });
    });

    it('should return 400 for invalid action', async () => {
      const request = createMockRequest('PUT', '/api/processing-jobs/job-1', {
        action: 'invalid'
      });
      const response = await PUT(request, { params: { id: 'job-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });

    it('should return 404 for non-existent job', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(null);

      const request = createMockRequest('PUT', '/api/processing-jobs/non-existent', {
        action: 'cancel'
      });
      const response = await PUT(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Job not found');
    });
  });

  describe('DELETE /api/processing-jobs/[id]', () => {
    it('should delete a specific job', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(mockJob);
      mockBackgroundJobService.cancelJob.mockResolvedValue(true);

      const request = createMockRequest('DELETE', '/api/processing-jobs/job-1');
      const response = await deleteById(request, { params: { id: 'job-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockBackgroundJobService.cancelJob).toHaveBeenCalledWith('job-1');
    });

    it('should return 404 for non-existent job', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(null);

      const request = createMockRequest('DELETE', '/api/processing-jobs/non-existent');
      const response = await deleteById(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Job not found');
    });

    it('should handle cancellation failures', async () => {
      mockPrisma.processingJob.findUnique.mockResolvedValue(mockJob);
      mockBackgroundJobService.cancelJob.mockResolvedValue(false);

      const request = createMockRequest('DELETE', '/api/processing-jobs/job-1');
      const response = await deleteById(request, { params: { id: 'job-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to cancel job');
    });
  });
});