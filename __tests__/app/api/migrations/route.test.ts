import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/migrations/route';
import { DocumentMigrationService } from '../../../../lib/services/documentMigrationService';
import { getAuthUser } from '../../../../lib/auth';
import { MigrationStatus } from '@prisma/client';

// Mock dependencies
jest.mock('../../../../lib/services/documentMigrationService', () => ({
  DocumentMigrationService: {
    createMigration: jest.fn(),
    getMigrations: jest.fn(),
  },
}));
jest.mock('../../../../lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
  getAuthUser: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' })
}));

const mockDocumentMigrationService = DocumentMigrationService as jest.Mocked<typeof DocumentMigrationService>;

describe('/api/migrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      userId: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    });
  });

  describe('POST', () => {
    it('should create a new migration', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.PENDING,
        totalDocuments: 2,
        processedDocuments: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocumentMigrationService.createMigration.mockResolvedValue(mockMigration as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations',
        {
          method: 'POST',
          body: JSON.stringify({
            sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
            targetRealmId: '550e8400-e29b-41d4-a716-446655440001',
            documentIds: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'],
            migrationOptions: {
              copyStageFiles: true,
              reprocessStages: ['ingestor'],
              preserveOriginal: true,
              migrationMode: 'copy',
            },
          }),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockMigration);
      expect(mockDocumentMigrationService.createMigration).toHaveBeenCalledWith(
        {
          sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
          targetRealmId: '550e8400-e29b-41d4-a716-446655440001',
          documentIds: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'],
          migrationOptions: {
            copyStageFiles: true,
            reprocessStages: ['ingestor'],
            preserveOriginal: true,
            migrationMode: 'copy',
          },
        },
        'user-1'
      );
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        documentIds: ['550e8400-e29b-41d4-a716-446655440002'],
        sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
        // Missing targetRealmId
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for empty document IDs', async () => {
      const requestBody = {
        documentIds: [],
        sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
        targetRealmId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 401 for unauthenticated user', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const requestBody = {
        documentIds: ['550e8400-e29b-41d4-a716-446655440002'],
        sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
        targetRealmId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      mockDocumentMigrationService.createMigration.mockRejectedValue(
        new Error('Database error')
      );

      const requestBody = {
        documentIds: ['550e8400-e29b-41d4-a716-446655440002'],
        sourceRealmId: '550e8400-e29b-41d4-a716-446655440000',
        targetRealmId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET', () => {
    it('should return user migrations', async () => {
      const mockMigrations = [
        {
          id: 'migration-1',
          status: MigrationStatus.COMPLETED,
          totalDocuments: 5,
          processedDocuments: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDocumentMigrationService.getMigrations.mockResolvedValue(mockMigrations as any);

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMigrations);
      expect(mockDocumentMigrationService.getMigrations).toHaveBeenCalledWith('user-1', {});
    });

    it('should handle query parameters', async () => {
      const mockMigrations: any[] = [];
      mockDocumentMigrationService.getMigrations.mockResolvedValue(mockMigrations as any);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/migrations?status=COMPLETED'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMigrations);
      expect(mockDocumentMigrationService.getMigrations).toHaveBeenCalledWith(
        'user-1',
        {
          status: MigrationStatus.COMPLETED,
        }
      );
    });

    it('should return 401 for unauthenticated user', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      mockDocumentMigrationService.getMigrations.mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/migrations');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});