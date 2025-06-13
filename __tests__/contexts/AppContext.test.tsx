import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../../contexts/AppContext';
import {
    createMockFetch,
    mockUser,
    mockDatabase,
    mockDocument,
    mockApiKey,
    mockJob,
} from '../utils/test-utils';

// Mock the vector search module
jest.mock('../../lib/vectorSearch', () => ({
    checkApiHealth: jest.fn().mockResolvedValue(true),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider data-oid="qnvycg.">{children}</AppProvider>
);

describe('AppContext', () => {
    beforeEach(() => {
        global.fetch = createMockFetch({});
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
        expect(result.current.isDataLoading).toBe(true);
    });

    it('should load initial data on mount', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ user: mockUser }) }) // /api/auth/me
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDatabase]),
            }) // /api/databases
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDocument]),
            }) // /api/documents
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockApiKey]),
            }) // /api/api-keys
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockJob]),
            }); // /api/jobs

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
            expect(result.current.isDataLoading).toBe(false);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/databases');
        expect(global.fetch).toHaveBeenCalledWith('/api/documents');
        expect(global.fetch).toHaveBeenCalledWith('/api/api-keys');
        expect(global.fetch).toHaveBeenCalledWith('/api/jobs');
    });

    it('should create a new database', async () => {
        // Mock all fetch calls for initialization and database creation
        const mockFetch = jest.fn();

        // Mock all initialization calls
        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser }),
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
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Wait for initial data loading to complete
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
            }),
        });
    });

    it('should create a new document', async () => {
        // Mock all fetch calls for initialization and document creation
        const mockFetch = jest.fn();

        mockFetch.mockImplementation((url, options) => {
            if (url === '/api/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser }),
                });
            }
            if (url === '/api/databases') {
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
            if (url === '/api/documents' && !options?.method) {
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
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Wait for initial data loading to complete
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
        global.fetch = createMockFetch({});

        const { result } = renderHook(() => useApp(), { wrapper });

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
            if (url === '/api/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser }),
                });
            }
            if (url === '/api/databases') {
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
            if (url === '/api/api-keys' && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockApiKey),
                });
            }
            if (url === '/api/api-keys' && !options?.method) {
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
            // Default response
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        global.fetch = mockFetch;

        const { result } = renderHook(() => useApp(), { wrapper });

        // Wait for initial data loading to complete
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
