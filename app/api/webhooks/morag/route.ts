import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../../lib/services/documentService';
import { JobService } from '../../../../lib/services/jobService';
import { WebhookPayload } from '../../../../lib/services/moragService';
import { DocumentState, JobStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    
    // Validate webhook payload
    if (!payload.task_id) {
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing task_id' },
        { status: 400 }
      );
    }

    // Update job status based on webhook payload
    const job = await JobService.getJobByTaskId(payload.task_id);
    if (!job) {
      console.warn(`Job not found for task_id: ${payload.task_id}`);
      return NextResponse.json({ status: 'job_not_found' }, { status: 200 });
    }

    // Update job progress
    await JobService.updateJob(job.id, {
      percentage: payload.progress.percentage,
      summary: `${payload.progress.current_step}: ${payload.progress.percentage}%`,
      status: mapWebhookStatusToJobStatus(payload.status),
      ...(payload.status === 'completed' && { endDate: new Date() }),
    });

    // Update document based on webhook status
    if (payload.status === 'completed' && payload.result) {
      // Store markdown content if available
      const updateData: any = {
        state: DocumentState.INGESTED,
      };

      // Handle both markdown and content fields for backward compatibility
      if (payload.result.markdown) {
        updateData.markdown = payload.result.markdown;
      } else if (payload.result.content) {
        updateData.markdown = payload.result.content;
      }

      if (payload.result.chunks) {
        updateData.chunks = payload.result.chunks;
      }

      // Update document with the document_id from payload or job
      const documentId = payload.document_id || job.documentId;
      if (documentId) {
        await DocumentService.updateDocument(documentId, updateData);
      }
    } else if (payload.status === 'failed') {
      const documentId = payload.document_id || job.documentId;
      if (documentId) {
        await DocumentService.updateDocument(documentId, {
          state: DocumentState.PENDING, // Reset to pending for retry
        });
      }
    } else if (payload.status === 'in_progress') {
      const documentId = payload.document_id || job.documentId;
      if (documentId) {
        await DocumentService.updateDocument(documentId, {
          state: DocumentState.INGESTING,
        });
      }
    }

    // Handle batch job updates if batch_job_id is present
    if (payload.batch_job_id) {
      // For batch operations, we might need to update multiple documents
      // This would be handled based on the specific batch job logic
      console.log(`Batch job update received for batch_job_id: ${payload.batch_job_id}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function mapWebhookStatusToJobStatus(webhookStatus: string): JobStatus {
  switch (webhookStatus) {
    case 'started':
    case 'in_progress':
      return JobStatus.PROCESSING;
    case 'completed':
      return JobStatus.FINISHED;
    case 'failed':
      return JobStatus.FAILED;
    default:
      return JobStatus.PROCESSING;
  }
}