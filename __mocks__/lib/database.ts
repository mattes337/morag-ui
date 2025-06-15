export const prisma = {
    job: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

export const connectDatabase = jest.fn();
export const disconnectDatabase = jest.fn();
export const checkDatabaseHealth = jest.fn();