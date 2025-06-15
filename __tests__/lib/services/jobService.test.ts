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

import { JobService } from '../../../lib/services/jobService';
import { prisma } from '../../../lib/database';
import { Job, JobStatus } from '@prisma/client';

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
                summary: null,
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.create.mockResolvedValue(mockJob);

            const result = await JobService.createJob({
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING',
            });

            expect(mockPrisma.job.create).toHaveBeenCalledWith({
                data: {
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING',
                },
                include: { document: true, user: true }
            });
            expect(result).toEqual(mockJob);
        });
    });

    describe('getAllJobs', () => {
        it('should return all jobs', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: null,
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: { id: 'doc1', name: 'Test Document.pdf' },
                    user: { id: 'user1', name: 'Test User' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs);

            const result = await JobService.getAllJobs();

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                include: { document: true, user: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobsByUser', () => {
        it('should return jobs for a specific user', async () => {
            const mockJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: null,
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: { id: 'doc1', name: 'Test Document.pdf' },
                    user: { id: 'user1', name: 'Test User' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs);

            const result = await JobService.getJobsByUser('user1');

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                include: { document: true, user: true },
                orderBy: { createdAt: 'desc' },
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
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PENDING' as JobStatus,
                    percentage: 0,
                    summary: null,
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: { id: 'doc1', name: 'Test Document.pdf' },
                    user: { id: 'user1', name: 'Test User' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockJobs);

            const result = await JobService.getJobsByDocument('doc1');

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: { documentId: 'doc1' },
                include: { document: true, user: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobById', () => {
        it('should return a job by id', async () => {
            const mockJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING' as JobStatus,
                percentage: 0,
                summary: null,
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.findUnique.mockResolvedValue(mockJob);

            const result = await JobService.getJobById('1');

            expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: { document: true, user: true },
            });
            expect(result).toEqual(mockJob);
        });

        it('should return null if job not found', async () => {
            mockPrisma.job.findUnique.mockResolvedValue(null);

            const result = await JobService.getJobById('999');

            expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
                where: { id: '999' },
                include: { document: true, user: true },
            });
            expect(result).toBeNull();
        });
    });

    describe('updateJob', () => {
        it('should update a job successfully', async () => {
            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PROCESSING' as JobStatus,
                percentage: 50,
                summary: 'Processing...',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob);

            const result = await JobService.updateJob('1', {
                status: 'PROCESSING',
                percentage: 50,
                summary: 'Processing...',
            });

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    status: 'PROCESSING',
                    percentage: 50,
                    summary: 'Processing...',
                },
                include: { document: true, user: true },
            });
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('updateJobProgress', () => {
        it('should update job progress', async () => {
            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PROCESSING' as JobStatus,
                percentage: 75,
                summary: 'Processing...',
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob);

            const result = await JobService.updateJobProgress('1', 75, 'Processing...');

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { percentage: 75, summary: 'Processing...', updatedAt: expect.any(Date) },
                include: { document: true, user: true },
            });
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('updateJobStatus', () => {
        it('should update job status', async () => {
            const mockUpdatedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'COMPLETED' as JobStatus,
                percentage: 100,
                summary: 'Completed',
                startDate: new Date(),
                endDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                document: { id: 'doc1', name: 'Test Document.pdf' },
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.job.update.mockResolvedValue(mockUpdatedJob);

            const endDate = new Date();
            const result = await JobService.updateJobStatus('1', 'COMPLETED', endDate);

            expect(mockPrisma.job.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { status: 'COMPLETED', endDate, updatedAt: expect.any(Date) },
                include: { document: true, user: true },
            });
            expect(result).toEqual(mockUpdatedJob);
        });
    });

    describe('getActiveJobs', () => {
        it('should return active jobs', async () => {
            const mockActiveJobs = [
                {
                    id: '1',
                    documentId: 'doc1',
                    documentName: 'Test Document.pdf',
                    documentType: 'PDF',
                    userId: 'user1',
                    status: 'PROCESSING' as JobStatus,
                    percentage: 50,
                    summary: 'Processing...',
                    startDate: new Date(),
                    endDate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    document: { id: 'doc1', name: 'Test Document.pdf' },
                    user: { id: 'user1', name: 'Test User' },
                },
            ];

            mockPrisma.job.findMany.mockResolvedValue(mockActiveJobs);

            const result = await JobService.getActiveJobs();

            expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING']
                    }
                },
                include: { document: true, user: true },
                orderBy: { createdAt: 'asc' },
            });
            expect(result).toEqual(mockActiveJobs);
        });
    });

    describe('deleteJob', () => {
        it('should delete a job successfully', async () => {
            const mockDeletedJob = {
                id: '1',
                documentId: 'doc1',
                documentName: 'Test Document.pdf',
                documentType: 'PDF',
                userId: 'user1',
                status: 'PENDING' as JobStatus,
                percentage: 0,
                summary: null,
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.job.delete.mockResolvedValue(mockDeletedJob);

            const result = await JobService.deleteJob('1');

            expect(mockPrisma.job.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual(mockDeletedJob);
        });
    });
});
