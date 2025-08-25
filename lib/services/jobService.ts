import { Job, JobStatus } from '@prisma/client';
import { prisma } from '../database';
import { MoragService } from './moragService';

export class JobService {
    static async createJob(data: {
        documentId: string;
        documentName: string;
        documentType: string;
        userId: string;
        realmId: string;
        status?: JobStatus;
    }) {
        return await prisma.job.create({ data, include: { document: true, user: true, realm: true } });
    }
    static async getAllJobs() {
        return await prisma.job.findMany({
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobsByUser(userId: string) {
        return await prisma.job.findMany({
            where: { userId },
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async getJobsByUserId(userId: string, realmId?: string | null) {
        const whereClause: any = { userId };
        if (realmId) {
            whereClause.document = {
                realmId: realmId,
            };
        }
        
        return await prisma.job.findMany({
            where: whereClause,
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobsByDocument(documentId: string) {
        return await prisma.job.findMany({
            where: { documentId },
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async getJobsByRealm(realmId: string) {
        return await prisma.job.findMany({
            where: {
                document: {
                    realmId: realmId,
                },
            },
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobById(id: string) {
        return await prisma.job.findUnique({
            where: { id },
            include: { document: true, user: true, realm: true },
        });
    }

    /**
     * Get job by ID with fresh status check
     * If the job's updatedAt is older than 1 hour and has a taskId, 
     * fetch the latest status from the backend
     */
    static async getJobWithFreshStatus(id: string) {
        const job = await this.getJobById(id);
        if (!job) {
            return null;
        }

        // Check if job status is older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const isStale = job.updatedAt < oneHourAgo;
        
        // Only refresh if job is stale, has a taskId, and is in an active state
        if (isStale && job.taskId && ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING'].includes(job.status)) {
            try {
                const moragService = new MoragService();
                const backendStatus = await moragService.getTaskStatus(job.taskId);
                
                // Map backend status to our job status
                let newStatus: JobStatus = job.status;
                let endDate: Date | undefined;
                
                switch (backendStatus.status?.toLowerCase()) {
                    case 'completed':
                        newStatus = JobStatus.FINISHED;
                        endDate = new Date();
                        break;
                    case 'failed':
                        newStatus = JobStatus.FAILED;
                        endDate = new Date();
                        break;
                    case 'cancelled':
                        newStatus = JobStatus.CANCELLED;
                        endDate = new Date();
                        break;
                    case 'processing':
                    case 'in_progress':
                        newStatus = JobStatus.PROCESSING;
                        break;
                    case 'pending':
                    case 'waiting':
                        newStatus = JobStatus.WAITING_FOR_REMOTE_WORKER;
                        break;
                }
                
                // Update job with fresh status if it changed
                if (newStatus !== job.status) {
                    const updatedJob = await this.updateJobStatus(id, newStatus, endDate);
                    return updatedJob;
                }
                
                // Update the updatedAt timestamp even if status didn't change
                const refreshedJob = await this.updateJob(id, { updatedAt: new Date() });
                return refreshedJob;
                
            } catch (error) {
                console.warn(`Failed to refresh job status for job ${id}:`, error);
                // Return the job as-is if backend is unavailable
                return job;
            }
        }
        
        return job;
    }

    static async updateJob(id: string, data: Partial<Job>) {
        return await prisma.job.update({
            where: { id },
            data,
            include: { document: true, user: true, realm: true },
        });
    }

    static async getJobByTaskId(taskId: string) {
        return await prisma.job.findFirst({
            where: {
                taskId: taskId,
            },
            include: {
                document: true,
                user: true,
                realm: true,
            },
        });
    }
    static async updateJobProgress(id: string, percentage: number, summary: string) {
        return await prisma.job.update({
            where: { id },
            data: { percentage, summary, updatedAt: new Date() },
            include: { document: true, user: true, realm: true },
        });
    }
    static async updateJobStatus(id: string, status: JobStatus, endDate?: Date) {
        return await prisma.job.update({
            where: { id },
            data: { status, endDate, updatedAt: new Date() },
            include: { document: true, user: true, realm: true },
        });
    }
    static async deleteJob(id: string) {
        return await prisma.job.delete({ where: { id } });
    }
    static async getActiveJobs() {
        return await prisma.job.findMany({
            where: { status: { in: ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING'] } },
            include: { document: true, user: true, realm: true },
            orderBy: { createdAt: 'asc' },
        });
    }
}
