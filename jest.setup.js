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
        json: jest.fn().mockImplementation((data, init) => {
            const cookieStore = new Map();
            const response = {
                json: jest.fn().mockResolvedValue(data),
                status: init?.status || 200,
                headers: {
                    getSetCookie: jest.fn().mockImplementation(() => Array.from(cookieStore.values())),
                },
                cookies: {
                    set: jest.fn().mockImplementation((name, value, options) => {
                        let cookieString = `${name}=${value}`;
                        if (options?.maxAge !== undefined) {
                            cookieString += `; max-age=${options.maxAge}`;
                        }
                        if (options?.httpOnly) {
                            cookieString += '; HttpOnly';
                        }
                        if (options?.secure) {
                            cookieString += '; Secure';
                        }
                        if (options?.sameSite) {
                            cookieString += `; SameSite=${options.sameSite}`;
                        }
                        cookieStore.set(name, cookieString);
                    }),
                },
            };
            return response;
        }),
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

// Mock Prisma
jest.mock('./lib/database', () => ({
    prisma: {
        apiKey: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        database: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        document: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        user: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        server: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        job: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn(),
    },
}));

// Mock Auth
jest.mock('./lib/auth', () => ({
    requireAuth: jest.fn(),
}));

// Mock Services
jest.mock('./lib/services/apiKeyService', () => ({
    ApiKeyService: {
        createApiKey: jest.fn(),
        getAllApiKeys: jest.fn(),
        getApiKeysByUser: jest.fn(),
        getApiKeyById: jest.fn(),
        getApiKeyByKey: jest.fn(),
        updateApiKey: jest.fn(),
        updateLastUsed: jest.fn(),
        deleteApiKey: jest.fn(),
    },
}));

jest.mock('./lib/services/databaseService', () => ({
    DatabaseService: {
        createDatabase: jest.fn(),
        getAllDatabases: jest.fn(),
        getDatabasesByUser: jest.fn(),
        getDatabaseById: jest.fn(),
        updateDatabase: jest.fn(),
        deleteDatabase: jest.fn(),
    },
}));

jest.mock('./lib/services/documentService', () => ({
    DocumentService: {
        createDocument: jest.fn(),
        getAllDocuments: jest.fn(),
        getDocumentsByUser: jest.fn(),
        getDocumentsByDatabase: jest.fn(),
        getDocumentById: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
    },
}));

jest.mock('./lib/services/userService', () => ({
    UserService: {
        createUser: jest.fn(),
        getAllUsers: jest.fn(),
        getUserById: jest.fn(),
        getUserByEmail: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
    },
}));

jest.mock('./lib/services/jobService', () => ({
    JobService: {
        createJob: jest.fn(),
        getAllJobs: jest.fn(),
        getJobsByUser: jest.fn(),
        getJobById: jest.fn(),
        updateJob: jest.fn(),
        deleteJob: jest.fn(),
    },
}));

jest.mock('./lib/services/databaseServerService', () => ({
    DatabaseServerService: {
        createServer: jest.fn(),
        getAllServers: jest.fn(),
        getServersByUser: jest.fn(),
        getServerById: jest.fn(),
        updateServer: jest.fn(),
        deleteServer: jest.fn(),
        testConnection: jest.fn(),
    },
}));

// Setup test environment
beforeEach(() => {
    jest.clearAllMocks();
});
