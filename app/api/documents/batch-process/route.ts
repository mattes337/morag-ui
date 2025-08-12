import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { DocumentService } from '../../../../lib/services/documentService';
import { JobService } from '../../../../lib/services/jobService';
import { ServerService } from '../../../../lib/services/serverService';
import { moragService } from '../../../../lib/services/moragService';
import { DocumentState, JobStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const realmId = formData.get('realmId') as string;
    
    if (!files.length || !realmId) {
      return NextResponse.json(
        { error: 'Files and realmId are required' },
        { status: 400 }
      );
    }

    // Get database servers for the realm
    const servers = await ServerService.getServersByRealm(realmId);
    if (servers.length === 0) {
      return NextResponse.json(
        { error: 'No database servers configured for this realm' },
        { status: 400 }
      );
    }

    // Create document records for all files
    const documents = await Promise.all(
      files.map(file => 
        DocumentService.createDocument({
          name: file.name,
          type: file.type || 'application/octet-stream',
          userId: user.userId,
          realmId: realmId,
          state: DocumentState.INGESTING,
        })
      )
    );

    // Create a batch job
    const batchJob = await JobService.createJob({
      documentName: `Batch processing (${files.length} files)`,
      documentType: 'batch',
      documentId: documents[0].id, // Use first document as reference
      userId: user.userId,
      realmId: realmId,
      status: JobStatus.PROCESSING,
    });

    // Construct webhook URL
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const webhookUrl = `${baseUrl}/api/webhooks/morag`;

    try {
      // Prepare batch items with document IDs
      const batchItems = files.map((file, index) => ({
        file,
        metadata: {
          documentId: documents[index].id,
          userId: user.userId,
          realmId: realmId,
          jobId: batchJob.id,
        }
      }));

      // Process batch
      const result = await moragService.processBatch(
        batchItems,
        'ingest',
        webhookUrl,
        servers
      );

      // Update job with task ID if available
      if (result.task_id) {
        await JobService.updateJob(batchJob.id, {
          taskId: result.task_id,
          summary: `Batch processing started - Task ID: ${result.task_id} (${files.length} files)`,
        });
      }

      // Handle synchronous completion
      if (result.success && !result.task_id) {
        await JobService.updateJob(batchJob.id, {
          status: JobStatus.FINISHED,
          percentage: 100,
          summary: `Batch processing completed for ${files.length} documents`,
          endDate: new Date(),
        });

        // Update all documents to ingested state
        await Promise.all(
          documents.map(doc => 
            DocumentService.updateDocument(doc.id, {
              state: DocumentState.INGESTED,
            })
          )
        );

        return NextResponse.json({
          batchJobId: batchJob.id,
          documentIds: documents.map(doc => doc.id),
          status: 'completed',
          message: `Batch processing completed for ${files.length} documents.`,
        });
      }

      return NextResponse.json({
        batchJobId: batchJob.id,
        documentIds: documents.map(doc => doc.id),
        taskId: result.task_id,
        status: 'processing',
        message: result.task_id 
          ? `Batch processing started for ${files.length} documents. You will receive updates via webhooks.`
          : `Batch processing completed for ${files.length} documents.`,
      });

    } catch (error) {
      console.error('Batch processing failed:', error);
      
      // Update job status on failure
      await JobService.updateJob(batchJob.id, {
        status: JobStatus.FAILED,
        summary: `Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        endDate: new Date(),
      });

      // Update all document states on failure
      await Promise.all(
        documents.map(doc => 
          DocumentService.updateDocument(doc.id, {
            state: DocumentState.PENDING,
          })
        )
      );

      return NextResponse.json(
        { error: 'Failed to process batch' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Batch processing endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}