/**
 * @jest-environment node
 */
// Mock the database module
jest.mock('../../../lib/database', () => ({
    prisma: {
        job: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

// Import AFTER mocking
import { JobService } from '../../../lib/services/jobService';
import { JobStatus } from '@prisma/client';

// Mock the JobService class
jest.mock('../../../lib/services/jobService', () => ({
    JobService: {
        createJob: jest.fn(),
        getAllJobs: jest.fn(),
        getJobsByUser: jest.fn(),
        getJobsByDocument: jest.fn(),
        getJobById: jest.fn(),
        updateJob: jest.fn(),
        updateJobProgress: jest.fn(),
        updateJobStatus: jest.fn(),
        deleteJob: jest.fn(),
        getActiveJobs: jest.fn(),
    },
}));

const mockedJobService = JobService as jest.Mocked<typeof JobService>;

describe('JobService', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        test('createJob should create a new job', async () => {
            const mockData = {
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING' as JobStatus,
            };

            const mockResult = {
                id: '1',
                ...mockData,
                percentage: 0,
                summary: '',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: {
                    id: 'doc1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'PENDING' as const,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    databaseId: null,
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
            };

            mockedJobService.createJob.mockResolvedValue(mockResult);

            const result = await JobService.createJob(mockData);

            expect(mockedJobService.createJob).toHaveBeenCalledWith(mockData);
            expect(result).toEqual(mockResult);
        });
    });

    describe('getAllJobs', () => {
        test('getAllJobs should return all jobs', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: '',
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: {
                        id: 'doc1',
                        name: 'Test Document.pdf',
                        type: 'PDF',
                        state: 'PENDING' as const,
                        version: 1,
                        chunks: 0,
                        quality: 0.0,
                        uploadDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: 'user1',
                        databaseId: null,
                    },
                    user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                },
            ];

            mockedJobService.getAllJobs.mockResolvedValue(mockJobs);

            const result = await JobService.getAllJobs();

            expect(mockedJobService.getAllJobs).toHaveBeenCalled();
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobsByUser', () => {
        test('getJobsByUser should return jobs for a specific user', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: '',
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: {
                        id: 'doc1',
                        name: 'Test Document.pdf',
                        type: 'PDF',
                        state: 'PENDING' as const,
                        version: 1,
                        chunks: 0,
                        quality: 0.0,
                        uploadDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: 'user1',
                        databaseId: null,
                    },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                },
            ];

            mockedJobService.getJobsByUser.mockResolvedValue(mockJobs);

            const result = await JobService.getJobsByUser('user1');

            expect(mockedJobService.getJobsByUser).toHaveBeenCalledWith('user1');
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobsByDocument', () => {
        test('getJobsByDocument should return jobs for a specific document', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: '',
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: {
                        id: 'doc1',
                        name: 'Test Document.pdf',
                        type: 'PDF',
                        state: 'PENDING' as const,
                        version: 1,
                        chunks: 0,
                        quality: 0.0,
                        uploadDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: 'user1',
                        databaseId: null,
                    },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                },
            ];

            mockedJobService.getJobsByDocument.mockResolvedValue(mockJobs);

            const result = await JobService.getJobsByDocument('doc1');

            expect(mockedJobService.getJobsByDocument).toHaveBeenCalledWith('doc1');
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobById', () => {
        test('getJobById should return a specific job', async () => {
            const mockJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING' as JobStatus,
                percentage: 0,
                summary: '',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: {
                    id: 'doc1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'PENDING' as const,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    databaseId: null,
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
            };

            mockedJobService.getAllJobs.mockResolvedValue([mockJob]);

            const result = await JobService.getAllJobs();

            expect(mockedJobService.getAllJobs).toHaveBeenCalled();
            expect(result).toEqual([mockJob]);
        });
    });

    describe('updateJob', () => {
        test('updateJob should update a job', async () => {
            const updateData = {
                status: 'FINISHED' as JobStatus,
                percentage: 100,
            };

            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'FINISHED' as JobStatus,
                percentage: 100,
                summary: '',
                startDate: new Date(),
                endDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                document: {
                    id: 'doc1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'PENDING' as const,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    databaseId: null,
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
            };

            mockedJobService.updateJob.mockResolvedValue(mockUpdatedJob);

            const result = await JobService.updateJob('1', updateData);

            expect(mockedJobService.updateJob).toHaveBeenCalledWith('1', updateData);
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('updateJobProgress', () => {
        test('updateJobProgress should update job progress', async () => {
            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PROCESSING' as JobStatus,
                percentage: 50,
                summary: 'Processing document...',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: {
                    id: 'doc1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'PENDING' as const,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    databaseId: null,
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
            };

            mockedJobService.updateJobProgress.mockResolvedValue(mockUpdatedJob);

            const result = await JobService.updateJobProgress('1', 50, 'Processing document...');

            expect(mockedJobService.updateJobProgress).toHaveBeenCalledWith('1', 50, 'Processing document...');
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('updateJobStatus', () => {
        test('updateJobStatus should update job status', async () => {
            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'FINISHED' as JobStatus,
                percentage: 100,
                summary: '',
                startDate: new Date(),
                endDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                document: {
                    id: 'doc1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'PENDING' as const,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    databaseId: null,
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
            };

            mockedJobService.updateJobStatus.mockResolvedValue(mockUpdatedJob);

            const result = await JobService.updateJobStatus('1', 'FINISHED', new Date());

            expect(mockedJobService.updateJobStatus).toHaveBeenCalledWith('1', 'FINISHED', expect.any(Date));
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('deleteJob', () => {
        test('deleteJob should delete a job', async () => {
            const mockDeletedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING' as JobStatus,
                percentage: 0,
                summary: '',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockedJobService.deleteJob.mockResolvedValue(mockDeletedJob);

            const result = await JobService.deleteJob('1');

            expect(mockedJobService.deleteJob).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedJob);
        });
    });

    describe('getActiveJobs', () => {
        test('getActiveJobs should return active jobs', async () => {
            const mockActiveJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PROCESSING' as JobStatus,
                    percentage: 50,
                    summary: '',
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: {
                        id: 'doc1',
                        name: 'Test Document.pdf',
                        type: 'PDF',
                        state: 'PENDING' as const,
                        version: 1,
                        chunks: 0,
                        quality: 0.0,
                        uploadDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        userId: 'user1',
                        databaseId: null,
                    },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                },
            ];

            mockedJobService.getActiveJobs.mockResolvedValue(mockActiveJobs);

            const result = await JobService.getActiveJobs();

            expect(mockedJobService.getActiveJobs).toHaveBeenCalled();
            expect(result).toEqual(mockActiveJobs);
        });
    });
});
