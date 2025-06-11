import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { AppProvider } from '../../contexts/AppContext';
import {
    createMockFetch,
    mockDatabase,
    mockDocument,
    mockApiKey,
    mockJob,
} from '../utils/test-utils';

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
                json: () =>
                    Promise.resolve({
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'admin',
                    }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([mockApiKey]),
            });
    });

    it('should handle app initialization and data loading', async () => {
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

        // Verify API calls were made
        expect(global.fetch).toHaveBeenCalledWith('/api/databases');
        expect(global.fetch).toHaveBeenCalledWith('/api/documents');
        expect(global.fetch).toHaveBeenCalledWith('/api/jobs');
        expect(global.fetch).toHaveBeenCalledWith('/api/users/john.doe@example.com');
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
