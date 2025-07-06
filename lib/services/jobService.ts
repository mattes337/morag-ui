import { Job, JobStatus } from '@prisma/client';
import { prisma } from '../database';
export class JobService {
    static async createJob(data: {
        documentId: string;
        documentName: string;
        documentType: string;
        userId: string;
        realmId: string;
        status?: JobStatus;
        jobType?: string;
        externalJobId?: string;
        metadata?: any;
    }) {
        return await prisma.job.create({ data, include: { document: true, user: true } });
    }
    static async getAllJobs() {
        return await prisma.job.findMany({
            include: { document: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobsByUser(userId: string) {
        return await prisma.job.findMany({
            where: { userId },
            include: { document: true, user: true },
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
            include: { document: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobsByDocument(documentId: string) {
        return await prisma.job.findMany({
            where: { documentId },
            include: { document: true, user: true },
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
            include: { document: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getJobById(id: string) {
        return await prisma.job.findUnique({
            where: { id },
            include: { document: true, user: true },
        });
    }
    static async updateJob(id: string, data: {
        status?: JobStatus;
        percentage?: number;
        summary?: string;
        metadata?: any;
        endDate?: Date;
        jobType?: string;
    }) {
        return await prisma.job.update({
            where: { id },
            data,
            include: { document: true, user: true },
        });
    }
    static async updateJobProgress(id: string, percentage: number, summary: string) {
        return await prisma.job.update({
            where: { id },
            data: { percentage, summary, updatedAt: new Date() },
            include: { document: true, user: true },
        });
    }
    static async updateJobStatus(id: string, status: JobStatus, endDate?: Date, percentage?: number, summary?: string, metadata?: any) {
        const updateData: any = { status, updatedAt: new Date() };
        if (endDate) updateData.endDate = endDate;
        if (percentage !== undefined) updateData.percentage = percentage;
        if (summary !== undefined) updateData.summary = summary;
        if (metadata !== undefined) updateData.metadata = metadata;

        return await prisma.job.update({
            where: { id },
            data: updateData,
            include: { document: true, user: true },
        });
    }
    static async deleteJob(id: string) {
        return await prisma.job.delete({ where: { id } });
    }
    static async getActiveJobs() {
        return await prisma.job.findMany({
            where: { status: { in: ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING'] } },
            include: { document: true, user: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    static async getJobByExternalId(externalJobId: string) {
        return await prisma.job.findFirst({
            where: { externalJobId },
            include: { document: true, user: true }
        });
    }

    static async updateJobFromMoragStatus(externalJobId: string, moragStatus: any) {
        const job = await this.getJobByExternalId(externalJobId);
        if (!job) {
            throw new Error(`Job with external ID ${externalJobId} not found`);
        }

        let status: JobStatus = 'PENDING';
        let percentage = job.percentage;

        switch (moragStatus.status) {
            case 'pending':
                status = 'PENDING';
                percentage = 0;
                break;
            case 'processing':
                status = 'PROCESSING';
                percentage = moragStatus.progress || 50;
                break;
            case 'completed':
                status = 'FINISHED';
                percentage = 100;
                break;
            case 'failed':
                status = 'FAILED';
                percentage = job.percentage; // Keep current percentage
                break;
        }

        const endDate = (status === 'FINISHED' || status === 'FAILED') ? new Date() : undefined;

        return await this.updateJobStatus(
            job.id,
            status,
            endDate,
            percentage,
            moragStatus.message,
            {
                ...(job.metadata && typeof job.metadata === 'object' ? job.metadata : {}),
                moragStatus,
                lastUpdated: new Date().toISOString()
            }
        );
    }
}
