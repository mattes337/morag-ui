import { NextRequest } from 'next/server';
import { GET, DELETE } from '../../../../../app/api/migrations/[id]/route';
import { DocumentMigrationService } from '../../../../../lib/services/documentMigrationService';
import { getAuthUser } from '../../../../../lib/auth';
import { MigrationStatus } from '@prisma/client';

// Mock dependencies
jest.mock('../../../../../lib/services/documentMigrationService', () => ({
  DocumentMigrationService: {
    getMigrationById: jest.fn(),
    cancelMigration: jest.fn(),
  },
}));
jest.mock('../../../../../lib/auth');

const mockDocumentMigrationService = DocumentMigrationService as jest.Mocked<typeof DocumentMigrationService>;
const mockRequireAuth = require('../../../../../lib/auth').requireAuth as jest.MockedFunction<any>;

describe('/api/migrations/[id]', () => {
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
    it('should return migration details', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.COMPLETED,
        totalDocuments: 5,
        processedDocuments: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.migration).toEqual(mockMigration);
      expect(mockDocumentMigrationService.getMigrationById).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return 404 for non-existent migration', async () => {
      mockDocumentMigrationService.getMigrationById.mockResolvedValue(null);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Migration not found');
    });

    it('should return 400 for unauthenticated user', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000'
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
        status: MigrationStatus.PENDING,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations/migration-1');

      const response = await GET(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should handle service errors', async () => {
      mockDocumentMigrationService.getMigrationById.mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000'
      );

      const response = await GET(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('DELETE', () => {
    it('should cancel migration successfully', async () => {
      const mockMigration = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: MigrationStatus.CANCELLED,
        totalDocuments: 5,
        processedDocuments: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentMigrationService.cancelMigration.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000',
        { method: 'DELETE' }
      );

      const response = await DELETE(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.migration).toEqual(mockMigration);
      expect(mockDocumentMigrationService.cancelMigration).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'user-1'
      );
    });

    it('should return 404 for non-existent migration', async () => {
      mockDocumentMigrationService.cancelMigration.mockRejectedValue(
        new Error('Migration not found')
      );

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000',
        { method: 'DELETE' }
      );

      const response = await DELETE(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should return 400 for unauthenticated user', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000', {
        method: 'DELETE',
      });

      const response = await DELETE(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for unauthorized access', async () => {
      const mockMigration = {
        id: 'migration-1',
        createdBy: 'other-user',
        status: MigrationStatus.PENDING,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations/migration-1', {
        method: 'DELETE',
      });

      const response = await DELETE(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should handle cancellation errors', async () => {
      const mockMigration = {
        id: 'migration-1',
        createdBy: 'user-1',
        status: MigrationStatus.COMPLETED,
      };

      mockDocumentMigrationService.getMigrationById.mockResolvedValue(mockMigration as any);
      mockDocumentMigrationService.cancelMigration.mockRejectedValue(
        new Error('Cannot cancel completed migration')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations/migration-1', {
        method: 'DELETE',
      });

      const response = await DELETE(mockRequest, { params: { id: 'migration-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot cancel completed migration');
    });

    it('should handle service errors', async () => {
      mockDocumentMigrationService.cancelMigration.mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations/550e8400-e29b-41d4-a716-446655440000', {
        method: 'DELETE',
      });

      const response = await DELETE(mockRequest, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});