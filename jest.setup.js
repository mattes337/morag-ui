import '@testing-library/jest-dom';

// Mock Next.js server components
jest.mock('next/server', () => ({
    NextRequest: jest.fn().mockImplementation((url, init) => {
        const request = {
            url,
            method: init?.method || 'GET',
            headers: new Map(Object.entries(init?.headers || {})),
            json: jest.fn().mockResolvedValue(JSON.parse(init?.body || '{}')),
            text: jest.fn().mockResolvedValue(init?.body || ''),
        };
        return request;
    }),
    NextResponse: {
        json: jest.fn().mockImplementation((data, init) => ({
            json: jest.fn().mockResolvedValue(data),
            status: init?.status || 200,
            headers: new Map(),
        })),
    },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        };
    },
    useSearchParams() {
        return new URLSearchParams();
    },
    usePathname() {
        return '/';
    },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Setup test environment
beforeEach(() => {
    jest.clearAllMocks();
});
