import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { DocumentService } from '../../../../lib/services/documentService';
import { JobService } from '../../../../lib/services/jobService';
import { DatabaseServerService } from '../../../../lib/services/databaseServerService';
import { moragService } from '../../../../lib/services/moragService';
import { DocumentState, JobStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const realmId = formData.get('realmId') as string;
    const mode = formData.get('mode') as 'convert' | 'process' | 'ingest' || 'ingest';
    
    if (!file || !realmId) {
      return NextResponse.json(
        { error: 'File and realmId are required' },
        { status: 400 }
      );
    }

    // Create document record
    const document = await DocumentService.createDocument({
      name: file.name,
      type: file.type || 'application/octet-stream',
      userId: user.id,
      realmId: realmId,
      state: mode === 'convert' ? DocumentState.PENDING : DocumentState.INGESTING,
    });

    // Construct webhook URL for all modes
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const webhookUrl = `${baseUrl}/api/webhooks/morag`;

    // If only converting to markdown, use convert mode
    if (mode === 'convert') {
      try {
        const result = await moragService.convertToMarkdown(file, document.id, webhookUrl);
        
        // Handle synchronous response
        if (result.success && result.content) {
          await DocumentService.updateDocument(document.id, {
            markdown: result.content,
            state: DocumentState.INGESTED,
          });

          return NextResponse.json({
            documentId: document.id,
            markdown: result.content,
            status: 'completed',
          });
        }

        // Handle asynchronous response
        if (result.task_id) {
          // Create job for tracking
          const job = await JobService.createJob({
            documentName: file.name,
            documentType: file.type || 'application/octet-stream',
            documentId: document.id,
            userId: user.id,
            realmId: realmId,
            status: JobStatus.PROCESSING,
            taskId: result.task_id,
          });

          return NextResponse.json({
            documentId: document.id,
            jobId: job.id,
            taskId: result.task_id,
            status: 'processing',
            message: 'Document conversion started. You will receive updates via webhooks.',
          });
        }

        throw new Error('Unexpected response from MoRAG service');

      } catch (error) {
        console.error('Markdown conversion failed:', error);
        await DocumentService.updateDocument(document.id, {
          state: DocumentState.PENDING,
        });
        
        return NextResponse.json(
          { error: 'Failed to convert document to markdown' },
          { status: 500 }
        );
      }
    }

    // For process or ingest modes, get database servers for the realm
    const servers = await DatabaseServerService.getServersByRealm(realmId);
    if (servers.length === 0) {
      return NextResponse.json(
        { error: 'No database servers configured for this realm' },
        { status: 400 }
      );
    }

    // Create job record
    const job = await JobService.createJob({
      documentName: file.name,
      documentType: file.type || 'application/octet-stream',
      documentId: document.id,
      userId: user.id,
      realmId: realmId,
      status: JobStatus.PROCESSING,
    });

    try {
      // Process and ingest document
      const result = await moragService.processAndIngest(
        file,
        document.id,
        webhookUrl,
        servers,
        {
          userId: user.id,
          realmId: realmId,
          jobId: job.id,
        }
      );

      // Update job with task ID if available
      if (result.task_id) {
        await JobService.updateJob(job.id, {
          taskId: result.task_id,
          summary: `Processing started - Task ID: ${result.task_id}`,
        });
      }

      // Handle synchronous completion
      if (result.success && !result.task_id) {
        await DocumentService.updateDocument(document.id, {
          state: DocumentState.INGESTED,
          markdown: result.content || '',
        });

        await JobService.updateJob(job.id, {
          status: JobStatus.FINISHED,
          percentage: 100,
          summary: 'Processing completed',
          endDate: new Date(),
        });

        return NextResponse.json({
          documentId: document.id,
          jobId: job.id,
          status: 'completed',
          message: 'Document processing completed.',
        });
      }

      // Handle asynchronous processing
      return NextResponse.json({
        documentId: document.id,
        jobId: job.id,
        taskId: result.task_id,
        status: 'processing',
        message: result.task_id 
          ? 'Document processing started. You will receive updates via webhooks.'
          : 'Document processing completed.',
      });

    } catch (error) {
      console.error('Document processing failed:', error);
      
      // Update job and document status on failure
      await JobService.updateJob(job.id, {
        status: JobStatus.FAILED,
        summary: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        endDate: new Date(),
      });

      await DocumentService.updateDocument(document.id, {
        state: DocumentState.PENDING,
      });

      return NextResponse.json(
        { error: 'Failed to process document' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Document processing endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}