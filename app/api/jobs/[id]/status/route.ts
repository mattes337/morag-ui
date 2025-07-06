import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { JobService } from '@/lib/services/jobService';
import { DocumentService } from '@/lib/services/documentService';
import { MoragService } from '@/lib/services/moragService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);

        // Get the job
        const job = await JobService.getJobById(params.id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if user has access to this job
        if (job.userId !== user.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // If job has an external job ID, check status with MoRAG
        if (job.externalJobId && (job.status === 'PENDING' || job.status === 'PROCESSING')) {
            try {
                const moragStatus = await MoragService.getJobStatus(job.externalJobId);
                
                // Update local job status based on MoRAG response
                const updatedJob = await JobService.updateJobFromMoragStatus(job.externalJobId, moragStatus);
                
                // If job completed successfully, update document state
                if (moragStatus.status === 'completed' && job.jobType === 'INGESTION') {
                    await DocumentService.updateDocument(job.documentId, {
                        state: 'INGESTED',
                        chunks: moragStatus.result?.chunks_created || 0,
                        quality: moragStatus.result?.metadata?.extraction_quality || 0
                    });
                } else if (moragStatus.status === 'failed' && job.jobType === 'INGESTION') {
                    await DocumentService.updateDocument(job.documentId, {
                        state: 'PENDING'
                    });
                }

                return NextResponse.json({
                    success: true,
                    job: updatedJob,
                    moragStatus,
                    synced: true
                });
            } catch (moragError) {
                console.error('Failed to sync with MoRAG:', moragError);
                // Return local job status if MoRAG sync fails
                return NextResponse.json({
                    success: true,
                    job,
                    moragStatus: null,
                    synced: false,
                    syncError: moragError instanceof Error ? moragError.message : 'Unknown error'
                });
            }
        }

        // Return local job status
        return NextResponse.json({
            success: true,
            job,
            moragStatus: null,
            synced: false
        });

    } catch (error) {
        console.error('Job status check error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        return NextResponse.json(
            { 
                error: 'Failed to check job status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
