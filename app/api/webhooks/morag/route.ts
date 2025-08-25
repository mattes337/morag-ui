import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../../lib/services/documentService';
import { JobService } from '../../../../lib/services/jobService';
import { DocumentState, JobStatus } from '@prisma/client';

// Step-based webhook payload as defined in WEBHOOK_GUIDE.md
export interface StepWebhookPayload {
  task_id: string;              // Background task ID
  document_id?: string;         // Document ID if provided
  step: string;                 // Processing step name
  status: "started" | "completed" | "failed";
  progress_percent: number;     // Overall progress (0-100)
  timestamp: string;            // ISO8601 timestamp
  data?: {                     // Step-specific data
    metadata_file_url?: string;
    metadata?: {
      title?: string;
      author?: string;
      creation_date?: string;
      format?: string;
      language?: string;
      page_count?: number;
      file_size_bytes?: number;
    };
    summary?: string;
    content_length?: number;
    language?: string;
    detected_topics?: string[];
    processing_time_seconds?: number;
    chunks_processed?: number;
    total_text_length?: number;
    database_collection?: string;
    markdown?: string;
    chunks?: number;
    entities?: any[];
    facts?: any[];
  };
  error_message?: string;      // Error message if failed
}

export async function POST(request: NextRequest) {
  try {
    const payload: StepWebhookPayload = await request.json();
    
    // Validate webhook payload
    if (!payload.task_id || !payload.step || !payload.status || typeof payload.progress_percent !== 'number') {
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing required fields (task_id, step, status, progress_percent)' },
        { status: 400 }
      );
    }

    // Validate progress_percent range
    if (payload.progress_percent < 0 || payload.progress_percent > 100) {
      return NextResponse.json(
        { error: 'Invalid progress_percent: must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update job status based on webhook payload
    const job = await JobService.getJobByTaskId(payload.task_id);
    if (!job) {
      console.warn(`Job not found for task_id: ${payload.task_id}`);
      return NextResponse.json({ status: 'job_not_found' }, { status: 200 });
    }

    console.log(`✅ [Step Webhook] Received for job ${job.id}, task ${payload.task_id}, step: ${payload.step}, status: ${payload.status}, progress: ${payload.progress_percent}%`);

    // Update job progress
    await JobService.updateJob(job.id, {
      percentage: payload.progress_percent,
      summary: `${payload.step}: ${payload.progress_percent}%`,
      status: mapWebhookStatusToJobStatus(payload.status),
      ...(payload.status === 'completed' && { endDate: new Date() }),
    });

    // Update document based on webhook status
    if (payload.status === 'completed' && payload.data) {
      // Store markdown content if available
      const updateData: any = {
        state: DocumentState.INGESTED,
      };

      // Store markdown content
      if (payload.data.markdown) {
        updateData.markdown = payload.data.markdown;
      }

      if (payload.data.chunks) {
        updateData.chunks = payload.data.chunks;
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
    } else if (payload.status === 'started') {
      const documentId = payload.document_id || job.documentId;
      if (documentId) {
        await DocumentService.updateDocument(documentId, {
          state: DocumentState.INGESTING,
        });
      }
    }

    // Handle error messages if step failed
    if (payload.status === 'failed' && payload.error_message) {
      console.error(`Step ${payload.step} failed for task ${payload.task_id}: ${payload.error_message}`);
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