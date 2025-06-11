import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../../contexts/AppContext';

// Mock data for testing
export const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin' as const,
};

export const mockDatabase = {
    id: '1',
    name: 'Test Database',
    description: 'Test database description',
    documentCount: 5,
    lastUpdated: '2024-01-15',
};

export const mockDocument = {
    id: '1',
    name: 'Test Document.pdf',
    type: 'PDF',
    state: 'ingested' as const,
    version: 1,
    chunks: 10,
    quality: 0.95,
    uploadDate: '2024-01-15',
};

export const mockApiKey = {
    id: '1',
    name: 'Test API Key',
    key: 'test_key_****',
    created: '2024-01-01',
    lastUsed: '2024-01-15',
};

export const mockJob = {
    id: '1',
    documentId: '1',
    documentName: 'Test Document.pdf',
    documentType: 'PDF',
    startDate: '2024-01-15T10:00:00Z',
    status: 'processing' as const,
    progress: {
        percentage: 50,
        summary: 'Processing document...',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
};

export const mockSearchResult = {
    id: '1',
    content: 'Test search result content',
    document: 'Test Document.pdf',
    database: 'Test Database',
    similarity: 0.95,
    chunk: 1,
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <AppProvider>{children}</AppProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper functions for testing
export const createMockFetch = (response: any, ok = true) => {
    return jest.fn().mockResolvedValue({
        ok,
        json: jest.fn().mockResolvedValue(response),
    });
};

export const createMockFetchError = (error: string) => {
    return jest.fn().mockRejectedValue(new Error(error));
};

export const waitForLoadingToFinish = () => {
    return new Promise((resolve) => setTimeout(resolve, 0));
};
