import { NextRequest } from 'next/server';
import { GET } from '../../../../../../app/api/migrations/[id]/progress/route';
import { DocumentMigrationService } from '../../../../../../lib/services/documentMigrationService';
import { getAuthUser } from '../../../../../../lib/auth';
import { MigrationStatus } from '@prisma/client';

// Mock dependencies
jest.mock('../../../../../../../lib/services/documentMigrationService', () => ({
  DocumentMigrationService: {
    getMigration: jest.fn(),
    getMigrationProgress: jest.fn(),
  },
}));
jest.mock('../../../../../../../lib/auth');

const mockDocumentMigrationService = DocumentMigrationService as jest.Mocked<typeof DocumentMigrationService>;
const mockRequireAuth = require('../../../../../../../lib/auth').requireAuth as jest.MockedFunction<any>;

describe('/api/migrations/[id]/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      userId: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    });
  });

  describe('GET', () => {
    it('should return migration progress', async () => {
      const mockProgress = {
        totalDocuments: 10,
        processedDocuments: 7,
        failedDocuments: 1,
        currentStage: 'Processing documents',
        estimatedTimeRemaining: 300,
        percentage: 70,
      };

      mockDocumentMigrationService.getMigrationProgress.mockResolvedValue(mockProgress as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000/progress'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.progress).toEqual(mockProgress);
      expect(mockDocumentMigrationService.getMigrationProgress).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'user-1');
    });

    it('should return 404 for non-existent migration', async () => {
      mockDocumentMigrationService.getMigrationProgress.mockRejectedValue(
        new Error('Migration not found')
      );

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000/progress'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should return 400 for unauthenticated user', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000/progress'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for unauthorized access', async () => {
      const mockMigration = {
        id: 'migration-1',
        createdBy: 'other-user',
        status: MigrationStatus.IN_PROGRESS,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/migration-1/progress'
      );

      const response = await GET(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should handle completed migration progress', async () => {
      const mockProgress = {
        migrationId: 'migration-1',
        status: MigrationStatus.COMPLETED,
        totalDocuments: 5,
        processedDocuments: 5,
        failedDocuments: 0,
        completedDocuments: 5,
        pendingDocuments: 0,
        progressPercentage: 100,
      };

      const mockMigration = {
        id: 'migration-1',
        createdBy: 'user-1',
        status: MigrationStatus.COMPLETED,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);
      mockDocumentMigrationService.getMigrationProgress.mockResolvedValue(mockProgress);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/migration-1/progress'
      );

      const response = await GET(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProgress);
      expect(data.progressPercentage).toBe(100);
      expect(data.status).toBe(MigrationStatus.COMPLETED);
    });

    it('should handle failed migration progress', async () => {
      const mockProgress = {
        migrationId: 'migration-1',
        status: MigrationStatus.FAILED,
        totalDocuments: 3,
        processedDocuments: 1,
        failedDocuments: 2,
        completedDocuments: 1,
        pendingDocuments: 0,
        progressPercentage: 33,
      };

      const mockMigration = {
        id: 'migration-1',
        createdBy: 'user-1',
        status: MigrationStatus.FAILED,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);
      mockDocumentMigrationService.getMigrationProgress.mockResolvedValue(mockProgress);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/migration-1/progress'
      );

      const response = await GET(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProgress);
      expect(data.status).toBe(MigrationStatus.FAILED);
      expect(data.failedDocuments).toBe(2);
    });

    it('should handle service errors', async () => {
      mockDocumentMigrationService.getMigrationProgress.mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000/progress'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle null progress response', async () => {
      const mockMigration = {
        id: 'migration-1',
        createdBy: 'user-1',
        status: MigrationStatus.PENDING,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);
      mockDocumentMigrationService.getMigrationProgress.mockResolvedValue(null);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/migration-1/progress'
      );

      const response = await GET(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Migration progress not found');
    });
  });
});