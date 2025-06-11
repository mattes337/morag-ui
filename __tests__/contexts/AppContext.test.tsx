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
    <AppProvider>{children}</AppProvider>
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

        expect(result.current.user).toBeTruthy();
        expect(result.current.databases).toEqual([]);
        expect(result.current.documents).toEqual([]);
        expect(result.current.apiKeys).toEqual([]);
        expect(result.current.jobs).toEqual([]);
        expect(result.current.isDataLoading).toBe(true);
    });

    it('should load initial data on mount', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDatabase]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockDocument]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockJob]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockApiKey]),
            });

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
            expect(result.current.isDataLoading).toBe(false);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/databases');
        expect(global.fetch).toHaveBeenCalledWith('/api/documents');
        expect(global.fetch).toHaveBeenCalledWith('/api/jobs');
    });

    it('should create a new database', async () => {
        global.fetch = createMockFetch(mockDatabase);

        const { result } = renderHook(() => useApp(), { wrapper });

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
                userId: result.current.user?.id,
            }),
        });
    });

    it('should create a new document', async () => {
        global.fetch = createMockFetch(mockDocument);

        const { result } = renderHook(() => useApp(), { wrapper });

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
                userId: result.current.user?.id,
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
        global.fetch = createMockFetch(mockApiKey);

        const { result } = renderHook(() => useApp(), { wrapper });

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
                userId: result.current.user?.id,
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
        const { result } = renderHook(() => useApp());

        expect(result.error).toEqual(Error('useApp must be used within an AppProvider'));
    });
});
