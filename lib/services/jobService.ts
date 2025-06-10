import { prisma } from '../database';
import { Job, JobStatus } from '@prisma/client';

export class JobService {
    static async createJob(data: {
        documentId: number;
        documentName: string;
        documentType: string;
        userId: string;
        status?: JobStatus;
    }) {
        return await prisma.job.create({
            data,
            include: {
                document: true,
                user: true,
            },
        });
    }

    static async getAllJobs() {
        return await prisma.job.findMany({
            include: {
                document: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getJobsByUser(userId: string) {
        return await prisma.job.findMany({
            where: { userId },
            include: {
                document: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getJobsByDocument(documentId: number) {
        return await prisma.job.findMany({
            where: { documentId },
            include: {
                document: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getJobById(id: number) {
        return await prisma.job.findUnique({
            where: { id },
            include: {
                document: true,
                user: true,
            },
        });
    }

    static async updateJob(id: number, data: Partial<Job>) {
        return await prisma.job.update({
            where: { id },
            data,
            include: {
                document: true,
                user: true,
            },
        });
    }

    static async updateJobProgress(id: number, percentage: number, summary: string) {
        return await prisma.job.update({
            where: { id },
            data: {
                percentage,
                summary,
                updatedAt: new Date(),
            },
            include: {
                document: true,
                user: true,
            },
        });
    }

    static async updateJobStatus(id: number, status: JobStatus, endDate?: Date) {
        return await prisma.job.update({
            where: { id },
            data: {
                status,
                endDate,
                updatedAt: new Date(),
            },
            include: {
                document: true,
                user: true,
            },
        });
    }

    static async deleteJob(id: number) {
        return await prisma.job.delete({
            where: { id },
        });
    }

    static async getActiveJobs() {
        return await prisma.job.findMany({
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
    }
}
