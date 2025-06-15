// Create mock functions
const mockDocumentCreate = jest.fn();
const mockDocumentFindMany = jest.fn();
const mockDocumentFindUnique = jest.fn();
const mockDocumentUpdate = jest.fn();
const mockDocumentDelete = jest.fn();
const mockDocumentCount = jest.fn();

const mockDatabaseCreate = jest.fn();
const mockDatabaseFindMany = jest.fn();
const mockDatabaseFindUnique = jest.fn();
const mockDatabaseUpdate = jest.fn();
const mockDatabaseDelete = jest.fn();
const mockDatabaseCount = jest.fn();

const mockUserCreate = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserDelete = jest.fn();

const mockServerCreate = jest.fn();
const mockServerFindMany = jest.fn();
const mockServerFindUnique = jest.fn();
const mockServerUpdate = jest.fn();
const mockServerDelete = jest.fn();

const mockApiKeyCreate = jest.fn();
const mockApiKeyFindMany = jest.fn();
const mockApiKeyFindUnique = jest.fn();
const mockApiKeyUpdate = jest.fn();
const mockApiKeyDelete = jest.fn();

const mockJobCreate = jest.fn();
const mockJobFindMany = jest.fn();
const mockJobFindUnique = jest.fn();
const mockJobUpdate = jest.fn();
const mockJobDelete = jest.fn();

export const prisma = {
    document: {
        create: mockDocumentCreate,
        findMany: mockDocumentFindMany,
        findUnique: mockDocumentFindUnique,
        update: mockDocumentUpdate,
        delete: mockDocumentDelete,
        count: mockDocumentCount,
    },
    database: {
        create: mockDatabaseCreate,
        findMany: mockDatabaseFindMany,
        findUnique: mockDatabaseFindUnique,
        update: mockDatabaseUpdate,
        delete: mockDatabaseDelete,
        count: mockDatabaseCount,
    },
    user: {
        create: mockUserCreate,
        findMany: mockUserFindMany,
        findUnique: mockUserFindUnique,
        update: mockUserUpdate,
        delete: mockUserDelete,
    },
    server: {
        create: mockServerCreate,
        findMany: mockServerFindMany,
        findUnique: mockServerFindUnique,
        update: mockServerUpdate,
        delete: mockServerDelete,
    },
    apiKey: {
        create: mockApiKeyCreate,
        findMany: mockApiKeyFindMany,
        findUnique: mockApiKeyFindUnique,
        update: mockApiKeyUpdate,
        delete: mockApiKeyDelete,
    },
    job: {
        create: mockJobCreate,
        findMany: mockJobFindMany,
        findUnique: mockJobFindUnique,
        update: mockJobUpdate,
        delete: mockJobDelete,
    },
};

export const connectDatabase = jest.fn();
export const disconnectDatabase = jest.fn();
export const checkDatabaseHealth = jest.fn();