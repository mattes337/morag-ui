/**
 * Tests for Realm Management Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { 
  useRealms, 
  useCurrentRealm, 
  useRealmById, 
  useRealmCreate, 
  useRealmUpdate, 
  useRealmDelete, 
  useRealmSwitch,
  useRealmMembers,
  useRealmSettings,
  useRealmUsage
} from '../useRealms';
import { mockApiClient } from '../../api/mockApiClient';

// Mock the API client
jest.mock('../../api/mockApiClient');

const mockApiClientInstance = mockApiClient as jest.Mocked<typeof mockApiClient>;

describe('useRealms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useRealms', () => {
    it('should fetch all realms successfully', async () => {
      const mockRealms = [
        {
          id: 'realm-1',
          name: 'Test Realm 1',
          ownerId: 'user-1',
          memberCount: 5,
          documentCount: 100,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { autoProcessing: true, defaultStages: [], retentionDays: 90 }
        },
        {
          id: 'realm-2',
          name: 'Test Realm 2',
          ownerId: 'user-2',
          memberCount: 3,
          documentCount: 50,
          createdAt: '2024-01-02T00:00:00Z',
          settings: { autoProcessing: false, defaultStages: [], retentionDays: 30 }
        }
      ];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRealms,
        timestamp: new Date().toISOString(),
        requestId: 'test-1'
      });

      const { result } = renderHook(() => useRealms());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/realms');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockRealms);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('useCurrentRealm', () => {
    it('should fetch current realm successfully', async () => {
      const mockRealm = {
        id: 'realm-current',
        name: 'Current Realm',
        ownerId: 'user-1',
        memberCount: 5,
        documentCount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        settings: { autoProcessing: true, defaultStages: [], retentionDays: 90 }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRealm,
        timestamp: new Date().toISOString(),
        requestId: 'test-2'
      });

      const { result } = renderHook(() => useCurrentRealm());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/realms/current');
      expect(result.current.data).toEqual(mockRealm);
    });

    it('should handle no current realm (return null)', async () => {
      mockApiClientInstance.get.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No current realm', statusCode: 404 },
        timestamp: new Date().toISOString(),
        requestId: 'test-3'
      });

      const { result } = renderHook(() => useCurrentRealm());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('useRealmById', () => {
    it('should fetch realm by ID', async () => {
      const realmId = 'realm-123';
      const mockRealm = {
        id: realmId,
        name: 'Specific Realm',
        ownerId: 'user-1',
        memberCount: 5,
        documentCount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        settings: { autoProcessing: true, defaultStages: [], retentionDays: 90 }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRealm,
        timestamp: new Date().toISOString(),
        requestId: 'test-4'
      });

      const { result } = renderHook(() => useRealmById(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/realms/${realmId}`);
      expect(result.current.data).toEqual(mockRealm);
    });
  });

  describe('useRealmCreate', () => {
    it('should create realm successfully', async () => {
      const newRealmData = {
        name: 'New Realm',
        description: 'A test realm',
        settings: { autoProcessing: true, defaultStages: ['chunker'], retentionDays: 90 }
      };

      const mockCreatedRealm = {
        id: 'realm-new',
        ownerId: 'user-1',
        memberCount: 1,
        documentCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        ...newRealmData
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: mockCreatedRealm,
        timestamp: new Date().toISOString(),
        requestId: 'test-5'
      });

      const { result } = renderHook(() => useRealmCreate());

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createRealm(newRealmData);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith('/api/realms', newRealmData);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(createResult).toEqual(mockCreatedRealm);
    });

    it('should handle creation errors', async () => {
      const mockError = {
        code: 'CREATE_REALM_ERROR',
        message: 'Failed to create realm',
        statusCode: 500
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-6'
      });

      const { result } = renderHook(() => useRealmCreate());

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createRealm({ name: 'Test Realm' });
      });

      expect(result.current.error).toBeDefined();
      expect(createResult).toBeNull();
    });
  });

  describe('useRealmUpdate', () => {
    it('should update realm successfully', async () => {
      const realmId = 'realm-123';
      const updateData = { name: 'Updated Realm Name' };
      const mockUpdatedRealm = {
        id: realmId,
        name: 'Updated Realm Name',
        ownerId: 'user-1',
        memberCount: 5,
        documentCount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        settings: { autoProcessing: true, defaultStages: [], retentionDays: 90 }
      };

      mockApiClientInstance.put.mockResolvedValue({
        success: true,
        data: mockUpdatedRealm,
        timestamp: new Date().toISOString(),
        requestId: 'test-7'
      });

      const { result } = renderHook(() => useRealmUpdate());

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateRealm(realmId, updateData);
      });

      expect(mockApiClientInstance.put).toHaveBeenCalledWith(`/api/realms/${realmId}`, updateData);
      expect(result.current.isUpdating).toBe(false);
      expect(updateResult).toEqual(mockUpdatedRealm);
    });
  });

  describe('useRealmDelete', () => {
    it('should delete realm successfully', async () => {
      const realmId = 'realm-123';

      mockApiClientInstance.delete.mockResolvedValue({
        success: true,
        data: { message: 'Realm deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: 'test-8'
      });

      const { result } = renderHook(() => useRealmDelete());

      let deleteResult: boolean;
      await act(async () => {
        deleteResult = await result.current.deleteRealm(realmId);
      });

      expect(mockApiClientInstance.delete).toHaveBeenCalledWith(`/api/realms/${realmId}`);
      expect(result.current.isDeleting).toBe(false);
      expect(deleteResult!).toBe(true);
    });
  });

  describe('useRealmSwitch', () => {
    it('should switch realm successfully', async () => {
      const realmId = 'realm-123';

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: { message: 'Switched to realm successfully' },
        timestamp: new Date().toISOString(),
        requestId: 'test-9'
      });

      const { result } = renderHook(() => useRealmSwitch());

      let switchResult: boolean;
      await act(async () => {
        switchResult = await result.current.switchRealm(realmId);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith('/api/realms/switch', { realmId });
      expect(result.current.isSwitching).toBe(false);
      expect(switchResult!).toBe(true);
    });
  });

  describe('useRealmMembers', () => {
    it('should fetch realm members', async () => {
      const realmId = 'realm-123';
      const mockMembers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          role: 'admin' as const,
          joinedAt: '2024-01-01T00:00:00Z',
          lastActive: '2024-01-15T12:00:00Z'
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          role: 'member' as const,
          joinedAt: '2024-01-05T00:00:00Z',
          lastActive: '2024-01-14T10:00:00Z'
        }
      ];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockMembers,
        timestamp: new Date().toISOString(),
        requestId: 'test-10'
      });

      const { result } = renderHook(() => useRealmMembers(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/realms/${realmId}/members`);
      expect(result.current.data).toEqual(mockMembers);
    });
  });

  describe('useRealmSettings', () => {
    it('should fetch and update realm settings', async () => {
      const realmId = 'realm-123';
      const mockSettings = {
        processing: {
          autoProcessOnUpload: true,
          defaultStages: ['chunker', 'ingestor'],
          enableMarkdownOptimizer: false,
          chunkingStrategy: 'semantic' as const,
          chunkSize: 1000,
          chunkOverlap: 200
        },
        storage: {
          maxFileSize: 100,
          allowedFileTypes: ['pdf', 'docx', 'txt'],
          retentionPolicyDays: 90
        },
        access: {
          allowPublicSharing: false,
          requireApprovalForNewMembers: true,
          defaultMemberRole: 'viewer' as const
        }
      };

      // Mock the initial fetch
      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockSettings,
        timestamp: new Date().toISOString(),
        requestId: 'test-11'
      });

      const { result } = renderHook(() => useRealmSettings(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/realms/${realmId}/settings`);
      expect(result.current.data).toEqual(mockSettings);

      // Test updating settings
      const updatedSettings = {
        ...mockSettings,
        processing: { ...mockSettings.processing, autoProcessOnUpload: false }
      };

      mockApiClientInstance.put.mockResolvedValue({
        success: true,
        data: { message: 'Settings updated' },
        timestamp: new Date().toISOString(),
        requestId: 'test-12'
      });

      let updateResult: boolean;
      await act(async () => {
        updateResult = await result.current.updateSettings(updatedSettings);
      });

      expect(mockApiClientInstance.put).toHaveBeenCalledWith(`/api/realms/${realmId}/settings`, updatedSettings);
      expect(updateResult!).toBe(true);
    });
  });

  describe('useRealmUsage', () => {
    it('should fetch realm usage statistics', async () => {
      const realmId = 'realm-123';
      const mockUsage = {
        storage: {
          used: 1024000,
          available: 9216000,
          total: 10240000
        },
        documents: {
          total: 150,
          processed: 140,
          pending: 8,
          failed: 2
        },
        processing: {
          totalJobs: 200,
          successfulJobs: 185,
          failedJobs: 15,
          avgProcessingTime: 2.5
        },
        members: {
          total: 5,
          active: 3,
          lastWeek: 4
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockUsage,
        timestamp: new Date().toISOString(),
        requestId: 'test-13'
      });

      const { result } = renderHook(() => useRealmUsage(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/realms/${realmId}/usage`);
      expect(result.current.data).toEqual(mockUsage);
    });
  });
});