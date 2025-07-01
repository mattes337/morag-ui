import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../../contexts/AppContext';
import {
    createMockFetch,
    mockUser,
    mockDocument,
    mockApiKey,
    mockJob,
} from '../../lib/test-utils';

const mockDatabase = {
    id: '1',
    name: 'Test Database',
    description: 'Test database description',
    _count: { documents: 5 },
    updatedAt: '2024-01-15T10:00:00.000Z',
    ingestionPrompt: null,
    systemPrompt: null,
    databaseServers: []
};

// Mock the vector search module
jest.mock('../../lib/vectorSearch', () => ({
    checkApiHealth: jest.fn().mockResolvedValue(true),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider data-oid="qnvycg.">{children}</AppProvider>
);

describe('AppContext', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation((url: string) => {
            const responses: Record<string, any> = {
                '/api/servers': [],
                '/api/databases': [],
                '/api/documents': [],
                '/api/api-keys': [],
                '/api/jobs': [],
                '/api/auth/me': { id: 'user1', name: 'Test User', email: 'test@example.com' }
            };
            
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(responses[url] || {})
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should provide initial context values', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        expect(result.current.user).toBeNull();
        expect(result.current.databases).toEqual([]); // No initial mock data
        expect(result.current.documents).toEqual([]); // No initial mock data
        expect(result.current.apiKeys).toEqual([]); // No initial mock data
        expect(result.current.servers).toEqual([]); // No initial mock data
        expect(result.current.jobs).toEqual([]);
        expect(result.current.isDataLoading).toBe(false);
    });

    it('should load initial data when user is set', async () => {
        // Mock API responses for data loading
        const mockFetch = jest.fn();
        
        mockFetch.mockImplementation((url, options) => {
            console.log('Mock fetch called with:', url, options);
            
            if (url === '/api/realms/current') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ currentRealm: { id: '1', name: 'Test Realm' } })
                });
            }
            if (url === '/api/realms') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ realms: [] })
                });
            }
            if (url === '/api/servers' || url === '/api/servers?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([])
                });
            }
            if (url === '/api/databases' || url === '/api/databases?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockDatabase])
                });
            }
            if (url === '/api/documents' || url === '/api/documents?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockDocument])
                });
            }
            if (url === '/api/api-keys' || url === '/api/api-keys?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockApiKey])
                });
            }
            if (url === '/api/jobs' || url === '/api/jobs?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockJob])
                });
            }
            
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
        
        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Manually set the user to trigger data loading
        await act(async () => {
            result.current.setUser(mockUser);
        });

        await waitFor(() => {
            expect(result.current.isDataLoading).toBe(false);
        });

        expect(result.current.databases).toEqual([{
            id: '1',
            name: 'Test Database',
            description: 'Test database description',
            documentCount: 5,
            lastUpdated: '2024-01-15',
            ingestionPrompt: null,
            systemPrompt: null,
            servers: []
        }]);
        expect(result.current.documents).toEqual([{
            id: '1',
            name: 'Test Document.pdf',
            type: 'PDF',
            state: 'ingested',
            version: 1,
            chunks: 10,
            quality: 0.95,
            uploadDate: '2024-01-15'
        }]);
        expect(result.current.apiKeys).toEqual([mockApiKey]);
        expect(result.current.jobs).toEqual([{
            id: '1',
            documentId: '1',
            documentName: 'Test Document.pdf',
            documentType: 'PDF',
            startDate: '2024-01-15T10:00:00.000Z',
            endDate: undefined,
            status: 'processing',
            progress: {
                percentage: undefined,
                summary: undefined
            },
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
        }]);

        // Verify fetch calls - realm loading and data loading
        expect(global.fetch).toHaveBeenCalledWith('/api/realms/current', {
            credentials: 'include'
        });
        expect(global.fetch).toHaveBeenCalledWith('/api/realms', {
            credentials: 'include'
        });
        expect(global.fetch).toHaveBeenCalledWith('/api/servers', {
            credentials: 'include'
        });
        
        // Check that we have the expected number of calls
        console.log('Total fetch calls:', global.fetch.mock.calls.length);
        global.fetch.mock.calls.forEach((call, index) => {
            console.log(`Call ${index + 1}:`, call[0], call[1]);
        });
    });

    it('should create a new database', async () => {
        // Mock all fetch calls for initialization and database creation
        const mockFetch = jest.fn();

        // Mock all initialization calls
        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/realms/current') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ currentRealm: { id: '1', name: 'Test Realm' } }),
                });
            }
            if (url === '/api/realms') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ realms: [] }),
                });
            }
            if (url === '/api/databases' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDatabase),
                });
            }
            if (url === '/api/databases' && !options?.method) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/documents') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/api-keys') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/jobs') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/servers') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Manually set the user to simulate AuthWrapper setting it
        await act(async () => {
            result.current.setUser(mockUser);
        });

        // Wait for data loading to complete
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
            await result.current.createDatabase({
                name: 'New Database',
                description: 'New database description',
                serverId: '1',
            });
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/databases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'New Database',
                description: 'New database description',
                serverId: '1',
                realmId: '1',
            }),
        });
    });

    it('should create a new document', async () => {
        // Mock all fetch calls for initialization and document creation
        const mockFetch = jest.fn();

        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/realms/current') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ currentRealm: { id: '1', name: 'Test Realm' } }),
                });
            }
            if (url === '/api/realms') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ realms: [] }),
                });
            }
            if (url === '/api/databases?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/documents' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocument),
                });
            }
            if (url === '/api/documents?realmId=1' && !options?.method) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/api-keys?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/jobs?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/servers?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Manually set the user to simulate AuthWrapper setting it
        await act(async () => {
            result.current.setUser(mockUser);
        });

        // Wait for data loading to complete
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
            await result.current.createDocument({
                name: 'New Document.pdf',
                type: 'PDF',
                databaseId: '1',
            });
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'New Document.pdf',
                type: 'PDF',
                databaseId: '1',
            }),
        });
    });

    it('should delete a document', async () => {
        // Mock all fetch calls for initialization and document deletion
        const mockFetch = jest.fn();

        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/realms/current') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ currentRealm: { id: '1', name: 'Test Realm' } }),
                });
            }
            if (url === '/api/realms') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ realms: [] }),
                });
            }
            if (url === '/api/databases?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/documents/1' && options?.method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                });
            }
            if (url === '/api/documents?realmId=1' && !options?.method) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/api-keys?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/jobs?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/servers?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Manually set the user to simulate AuthWrapper setting it
        await act(async () => {
            result.current.setUser(mockUser);
        });

        // Wait for data loading to complete
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
            await result.current.deleteDocument('1');
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/documents/1', {
            method: 'DELETE',
        });
    });

    it('should create an API key', async () => {
        // Mock all fetch calls for initialization and API key creation
        const mockFetch = jest.fn();

        // Mock all initialization calls
        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/realms/current') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ currentRealm: { id: '1', name: 'Test Realm' } }),
                });
            }
            if (url === '/api/realms') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ realms: [] }),
                });
            }
            if (url === '/api/databases?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/documents?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/api-keys' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockApiKey),
                });
            }
            if (url === '/api/api-keys?realmId=1' && !options?.method) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/jobs?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            if (url === '/api/servers?realmId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Manually set the user to simulate AuthWrapper setting it
        await act(async () => {
            result.current.setUser(mockUser);
        });

        // Wait for data loading to complete
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
            await result.current.createApiKey({
                name: 'New API Key',
                key: 'new_api_key',
            });
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'New API Key',
                key: 'new_api_key',
            }),
        });
    });

    it('should handle dialog state changes', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        act(() => {
            result.current.setShowAddDocumentDialog(true);
        });

        expect(result.current.showAddDocumentDialog).toBe(true);

        act(() => {
            result.current.setShowCreateDatabaseDialog(true);
        });

        expect(result.current.showCreateDatabaseDialog).toBe(true);
    });

    it('should handle prompt state changes', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        act(() => {
            result.current.setPromptText('Test prompt');
        });

        expect(result.current.promptText).toBe('Test prompt');

        act(() => {
            result.current.setNumDocuments(10);
        });

        expect(result.current.numDocuments).toBe(10);
    });

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test since we expect an error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useApp());
        }).toThrow('useApp must be used within an AppProvider');

        consoleSpy.mockRestore();
    });
});
