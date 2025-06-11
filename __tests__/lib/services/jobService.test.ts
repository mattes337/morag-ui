import { JobService } from '../../../lib/services/jobService';
import { prisma } from '../../../lib/database';
import { JobStatus } from '@prisma/client';

// Mock Prisma
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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('JobService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        it('should create a job successfully', async () => {
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
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.create.mockResolvedValue(mockJob as any);

            const result = await JobService.createJob({
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
            });

            expect(mockPrisma.job.create).toHaveBeenCalledWith({
                data: {
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                },
                include: {
                    document: true,
                    user: true,
                },
            });

            expect(result).toEqual(mockJob);
        });

        it('should create a job with custom status', async () => {
            const mockJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PROCESSING' as JobStatus,
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.create.mockResolvedValue(mockJob as any);

            await JobService.createJob({
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PROCESSING',
            });

            expect(mockPrisma.job.create).toHaveBeenCalledWith({
                data: {
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PROCESSING',
                },
                include: {
                    document: true,
                    user: true,
                },
            });
        });
    });

    describe('getAllJobs', () => {
        it('should return all jobs', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    status: 'COMPLETED',
                    document: { id: 'doc1', name: 'Document 1' },
                    user: { id: 'user1', name: 'User 1' },
                },
                {
                    id: '2',
                    documentId: 'doc2',
                    status: 'PENDING',
                    document: { id: 'doc2', name: 'Document 2' },
                    user: { id: 'user2', name: 'User 2' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs as any);

            const result = await JobService.getAllJobs();

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                include: {
                    document: true,
                    user: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobsByUser', () => {
        it('should return jobs for a specific user', async () => {
            const mockJobs = [
                {
                    id: '1',
                    userId: 'user1',
                    status: 'COMPLETED',
                    document: { id: 'doc1', name: 'Document 1' },
                    user: { id: 'user1', name: 'User 1' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs as any);

            const result = await JobService.getJobsByUser('user1');

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                include: {
                    document: true,
                    user: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobsByDocument', () => {
        it('should return jobs for a specific document', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    status: 'COMPLETED',
                    document: { id: 'doc1', name: 'Document 1' },
                    user: { id: 'user1', name: 'User 1' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs as any);

            const result = await JobService.getJobsByDocument('doc1');

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: { documentId: 'doc1' },
                include: {
                    document: true,
                    user: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            expect(result).toEqual(mockJobs);
        });
    });

    describe('updateJobProgress', () => {
        it('should update job progress', async () => {
            const mockUpdatedJob = {
                id: '1',
                percentage: 75,
                summary: 'Processing chunks...',
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Document 1' },
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob as any);

            const result = await JobService.updateJobProgress('1', 75, 'Processing chunks...');

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    percentage: 75,
                    summary: 'Processing chunks...',
                    updatedAt: expect.any(Date),
                },
                include: {
                    document: true,
                    user: true,
                },
            });

            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('updateJobStatus', () => {
        it('should update job status', async () => {
            const endDate = new Date();
            const mockUpdatedJob = {
                id: '1',
                status: 'FINISHED' as JobStatus,
                endDate,
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Document 1' },
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob as any);

            const result = await JobService.updateJobStatus('1', 'FINISHED', endDate);

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    status: 'FINISHED',
                    endDate,
                    updatedAt: expect.any(Date),
                },
                include: {
                    document: true,
                    user: true,
                },
            });

            expect(result).toEqual(mockUpdatedJob);
        });

        it('should update job status without end date', async () => {
            const mockUpdatedJob = {
                id: '1',
                status: 'PROCESSING' as JobStatus,
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Document 1' },
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob as any);

            await JobService.updateJobStatus('1', 'PROCESSING');

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    status: 'PROCESSING',
                    endDate: undefined,
                    updatedAt: expect.any(Date),
                },
                include: {
                    document: true,
                    user: true,
                },
            });
        });
    });

    describe('getActiveJobs', () => {
        it('should return active jobs', async () => {
            const mockActiveJobs = [
                {
                    id: '1',
                    status: 'PENDING' as JobStatus,
                    document: { id: 'doc1', name: 'Document 1' },
                    user: { id: 'user1', name: 'User 1' },
                },
                {
                    id: '2',
                    status: 'PROCESSING' as JobStatus,
                    document: { id: 'doc2', name: 'Document 2' },
                    user: { id: 'user2', name: 'User 2' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockActiveJobs as any);

            const result = await JobService.getActiveJobs();

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING'],
                    },
                },
                include: {
                    document: true,
                    user: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });

            expect(result).toEqual(mockActiveJobs);
        });
    });

    describe('deleteJob', () => {
        it('should delete a job', async () => {
            const mockDeletedJob = { id: '1', documentId: 'doc1' };

            mockPrisma.job.delete.mockResolvedValue(mockDeletedJob as any);

            const result = await JobService.deleteJob('1');

            expect(mockPrisma.job.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });

            expect(result).toEqual(mockDeletedJob);
        });
    });
});
