import { NextRequest } from 'next/server';

// Mock the modules first
jest.mock('../../../lib/services/stageExecutionService', () => ({
  stageExecutionService: {
    getExecution: jest.fn(),
    getLatestExecution: jest.fn(),
    completeExecution: jest.fn(),
    failExecution: jest.fn(),
  },
}));

jest.mock('../../../lib/database', () => ({
  prisma: {
    document: {
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Import after mocking
import { POST } from '../../../app/api/webhooks/stages/route';
import { stageExecutionService } from '../../../lib/services/stageExecutionService';
import { prisma } from '../../../lib/database';

// Get the mocked functions
const mockStageExecutionService = stageExecutionService as jest.Mocked<typeof stageExecutionService>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/webhooks/stages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle stage completion webhook with query parameters', async () => {
    // Mock execution
    const mockExecution = {
      id: 'execution-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      status: 'RUNNING',
    };

    mockStageExecutionService.getExecution.mockResolvedValue(mockExecution);
    mockStageExecutionService.completeExecution.mockResolvedValue(mockExecution);
    mockPrisma.document.update.mockResolvedValue({});

    // Create webhook payload
    const payload = {
      event: 'stage_completed',
      timestamp: '2024-01-01T10:00:00Z',
      stage: {
        type: 1, // MARKDOWN_CONVERSION
        status: 'completed',
        execution_time: 15.5,
      },
      files: {
        output_files: ['/tmp/morag/output/doc-1/converted.md'],
      },
      metadata: {
        metrics: { pages_processed: 5 },
      },
    };

    // Create request with query parameters
    const request = new NextRequest('http://localhost:3000/api/webhooks/stages?documentId=doc-1&executionId=execution-1&stage=MARKDOWN_CONVERSION', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.status).toBe('success');
    expect(mockStageExecutionService.getExecution).toHaveBeenCalledWith('execution-1');
    expect(mockStageExecutionService.completeExecution).toHaveBeenCalledWith(
      'execution-1',
      ['/tmp/morag/output/doc-1/converted.md'],
      expect.objectContaining({
        executionTime: 15.5,
        stageWebhookCompletion: true,
      })
    );
    expect(mockPrisma.document.update).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
      data: {
        stageStatus: 'COMPLETED',
        lastStageError: null,
      },
    });
  });

  it('should handle stage failure webhook', async () => {
    const mockExecution = {
      id: 'execution-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      status: 'RUNNING',
    };

    mockStageExecutionService.getExecution.mockResolvedValue(mockExecution);
    mockStageExecutionService.failExecution.mockResolvedValue(mockExecution);
    mockPrisma.document.update.mockResolvedValue({});

    const payload = {
      event: 'stage_completed',
      timestamp: '2024-01-01T10:00:00Z',
      stage: {
        type: 1,
        status: 'failed',
        error_message: 'Conversion failed',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/webhooks/stages?documentId=doc-1&executionId=execution-1&stage=MARKDOWN_CONVERSION', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.status).toBe('success');
    expect(mockStageExecutionService.failExecution).toHaveBeenCalledWith('execution-1', 'Conversion failed');
    expect(mockPrisma.document.update).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
      data: {
        stageStatus: 'FAILED',
        lastStageError: 'Conversion failed',
      },
    });
  });

  it('should reject invalid webhook payload', async () => {
    const payload = {
      // Missing required fields
      timestamp: '2024-01-01T10:00:00Z',
    };

    const request = new NextRequest('http://localhost:3000/api/webhooks/stages', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toContain('missing required fields');
  });

  it('should handle GET request for health check', async () => {
    const { GET } = await import('../../../app/api/webhooks/stages/route');
    
    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.status).toBe('ok');
    expect(result.endpoint).toBe('stages-webhook');
  });
});
