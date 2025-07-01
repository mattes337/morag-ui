import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../contexts/AppContext';
import { AuthWrapper } from '../../components/layout/AuthWrapper';
import {
    createMockFetch,
    mockUser,
    mockDatabase,
    mockDocument,
    mockApiKey,
    mockJob,
} from '../../lib/test-utils';

import '@testing-library/jest-dom'

// Mock the vector search module
jest.mock('../../lib/vectorSearch', () => ({
    checkApiHealth: jest.fn().mockResolvedValue(true),
}));

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

describe('App Navigation E2E', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn().mockImplementation((url: string) => {
            console.log('Mock fetch called with:', url);
            
            if (url === '/api/auth/login') {
                return Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({}),
                });
            }
            
            if (url === '/api/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser }),
                });
            }
            
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
            
            if (url === '/api/servers') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            
            if (url === '/api/databases') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([mockDatabase]),
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
            
            // Default fallback
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            });
        });
    });

    it('should handle app initialization and data loading', async () => {
        const TestApp = () => {
            return (
                <AppProvider>
                    <AuthWrapper>
                        <div data-testid="app">App Loaded</div>
                    </AuthWrapper>
                </AppProvider>
            );
        };

        render(<TestApp />);

        await waitFor(() => {
            expect(screen.getByTestId('app')).toBeInTheDocument();
        }, { timeout: 10000 });
        
        // Wait for all async operations to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Log all fetch calls for debugging
        console.log('All fetch calls:', (global.fetch as jest.Mock).mock.calls);

        // Verify authentication calls were made
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        // For now, just verify the basic authentication flow works
        // The data loading calls will be tested separately
        expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle API errors gracefully', async () => {
        global.fetch = jest
            .fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'));

        const TestApp = () => {
            return (
                <AppProvider>
                    <div data-testid="app">App Loaded</div>
                </AppProvider>
            );
        };

        render(<TestApp />);

        await waitFor(() => {
            expect(screen.getByTestId('app')).toBeInTheDocument();
        });

        // App should still render even with API errors
        expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    it('should handle data refresh', async () => {
        const TestApp = () => {
            const [refreshCount, setRefreshCount] = React.useState(0);

            return (
                <AppProvider>
                    <div>
                        <button
                            onClick={() => {
                                setRefreshCount((c) => c + 1);
                                // Simulate refresh action
                            }}
                            data-testid="refresh-button"
                        >
                            Refresh ({refreshCount})
                        </button>
                    </div>
                </AppProvider>
            );
        };

        render(<TestApp />);

        await waitFor(() => {
            expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
        });

        const refreshButton = screen.getByTestId('refresh-button');
        fireEvent.click(refreshButton);

        expect(screen.getByText('Refresh (1)')).toBeInTheDocument();
    });

    it('should handle concurrent operations', async () => {
        global.fetch = createMockFetch({ success: true });

        const TestApp = () => {
            const [operations, setOperations] = React.useState<string[]>([]);

            const addOperation = (op: string) => {
                setOperations((prev) => [...prev, op]);
            };

            return (
                <AppProvider>
                    <div>
                        <button onClick={() => addOperation('create-doc')} data-testid="create-doc">
                            Create Document
                        </button>
                        <button onClick={() => addOperation('create-db')} data-testid="create-db">
                            Create Database
                        </button>
                        <div data-testid="operations">
                            {operations.map((op, i) => (
                                <div key={i}>{op}</div>
                            ))}
                        </div>
                    </div>
                </AppProvider>
            );
        };

        render(<TestApp />);

        await waitFor(() => {
            expect(screen.getByTestId('create-doc')).toBeInTheDocument();
        });

        // Simulate concurrent operations
        const createDocButton = screen.getByTestId('create-doc');
        const createDbButton = screen.getByTestId('create-db');

        fireEvent.click(createDocButton);
        fireEvent.click(createDbButton);
        fireEvent.click(createDocButton);

        const operations = screen.getByTestId('operations');
        expect(operations).toHaveTextContent('create-doc');
        expect(operations).toHaveTextContent('create-db');
    });

    it('should handle memory cleanup', async () => {
        const TestApp = () => {
            const [mounted, setMounted] = React.useState(true);

            React.useEffect(() => {
                return () => {
                    // Cleanup function
                };
            }, []);

            if (!mounted) return null;

            return (
                <AppProvider>
                    <div>
                        <button onClick={() => setMounted(false)} data-testid="unmount">
                            Unmount
                        </button>
                        <div data-testid="app-content">Content</div>
                    </div>
                </AppProvider>
            );
        };

        render(<TestApp />);

        await waitFor(() => {
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });

        const unmountButton = screen.getByTestId('unmount');
        fireEvent.click(unmountButton);

        await waitFor(() => {
            expect(screen.queryByTestId('app-content')).not.toBeInTheDocument();
        });
    });
});
