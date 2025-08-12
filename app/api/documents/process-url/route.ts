import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { DocumentService } from '../../../../lib/services/documentService';
import { JobService } from '../../../../lib/services/jobService';
import { ServerService } from '../../../../lib/services/serverService';
import { moragService } from '../../../../lib/services/moragService';
import { detectDocumentType } from '../../../../lib/utils/documentTypeDetection';
import { DocumentState, JobStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, realmId, mode = 'ingest' } = body;
    
    if (!url || !realmId) {
      return NextResponse.json(
        { error: 'URL and realmId are required' },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop() || 'web-content';

    // Detect document type and subtype
    const { type, subType } = detectDocumentType({ url, filename });

    // Create document record
    const document = await DocumentService.createDocument({
      name: filename,
      type,
      subType,
      userId: user.userId,
      realmId: realmId,
      state: mode === 'convert' ? DocumentState.PENDING : DocumentState.INGESTING,
    });

    // Construct webhook URL for all modes
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const webhookUrl = `${baseUrl}/api/webhooks/morag`;

    // If only converting to markdown, use convert mode
    if (mode === 'convert') {
      try {
        const result = await moragService.processUrl(
          url,
          document.id,
          'convert',
          webhookUrl,
          undefined,
          {
            userId: user.userId,
            realmId: realmId,
          }
        );
        
        // Handle synchronous response
        if (result.success && result.markdown) {
          await DocumentService.updateDocument(document.id, {
            markdown: result.markdown,
            state: DocumentState.INGESTED,
          });

          return NextResponse.json({
            documentId: document.id,
            markdown: result.markdown,
            status: 'completed',
          });
        }

        // Handle asynchronous response
        if (result.task_id) {
          // Create job for tracking
          const job = await JobService.createJob({
            documentName: filename,
            documentType: type,
            documentId: document.id,
            userId: user.userId,
            realmId: realmId,
            status: JobStatus.PROCESSING,
          });

          return NextResponse.json({
            documentId: document.id,
            jobId: job.id,
            taskId: result.task_id,
            status: 'processing',
            message: 'URL conversion started. You will receive updates via webhooks.',
          });
        }

        throw new Error('Unexpected response from MoRAG service');

      } catch (error) {
        console.error('URL conversion failed:', error);
        await DocumentService.updateDocument(document.id, {
          state: DocumentState.PENDING,
        });
        
        return NextResponse.json(
          { error: 'Failed to convert URL to markdown' },
          { status: 500 }
        );
      }
    }

    // For process or ingest modes, get database servers for the realm
    const servers = await ServerService.getServersByRealm(realmId);
    if (servers.length === 0) {
      return NextResponse.json(
        { error: 'No database servers configured for this realm' },
        { status: 400 }
      );
    }

    // Create job record
    const job = await JobService.createJob({
      documentName: filename,
      documentType: type,
      documentId: document.id,
      userId: user.userId,
      realmId: realmId,
      status: JobStatus.PROCESSING,
    });

    try {
      // Process URL
      const result = await moragService.processUrl(
        url,
        document.id,
        mode as 'process' | 'ingest',
        webhookUrl,
        servers,
        {
          userId: user.userId,
          realmId: realmId,
          jobId: job.id,
        }
      );

      // Update job with task ID if available
      if (result.task_id) {
        await JobService.updateJob(job.id, {
          taskId: result.task_id,
          summary: `Processing URL started - Task ID: ${result.task_id}`,
        });
      }

      // Handle synchronous completion
      if (result.success && !result.task_id) {
        await DocumentService.updateDocument(document.id, {
          state: DocumentState.INGESTED,
          markdown: result.markdown || '',
        });

        await JobService.updateJob(job.id, {
          status: JobStatus.FINISHED,
          percentage: 100,
          summary: 'URL processing completed',
          endDate: new Date(),
        });

        return NextResponse.json({
          documentId: document.id,
          jobId: job.id,
          status: 'completed',
          message: 'URL processing completed.',
        });
      }

      return NextResponse.json({
        documentId: document.id,
        jobId: job.id,
        taskId: result.task_id,
        status: 'processing',
        message: result.task_id 
          ? 'URL processing started. You will receive updates via webhooks.'
          : 'URL processing completed.',
      });

    } catch (error) {
      console.error('URL processing failed:', error);
      
      // Update job and document status on failure
      await JobService.updateJob(job.id, {
        status: JobStatus.FAILED,
        summary: `URL processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        endDate: new Date(),
      });

      await DocumentService.updateDocument(document.id, {
        state: DocumentState.PENDING,
      });

      return NextResponse.json(
        { error: 'Failed to process URL' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('URL processing endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}