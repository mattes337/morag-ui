#!/usr/bin/env node

/**
 * Test script to verify webhook endpoints work with the correct payload formats
 * from WEBHOOK_GUIDE.md
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test payloads from WEBHOOK_GUIDE.md
const stepWebhookPayload = {
  "task_id": "task-abc-123-def",
  "document_id": "my-document-456",
  "step": "metadata_extraction",
  "status": "completed",
  "progress_percent": 40.0,
  "timestamp": "2024-01-15T10:31:00Z",
  "data": {
    "metadata_file_url": "/api/files/temp/task-abc-123-def/metadata.json",
    "metadata": {
      "title": "Machine Learning Fundamentals",
      "author": "Dr. Jane Smith",
      "creation_date": "2024-01-10",
      "format": "application/pdf",
      "language": "en",
      "page_count": 15,
      "file_size_bytes": 1048576
    }
  }
};

const stageWebhookPayload = {
  "event": "stage_completed",
  "timestamp": "2024-01-01T10:01:00Z",
  "stage": {
    "type": 1,
    "status": "completed",
    "execution_time": 15.5,
    "start_time": "2024-01-01T10:00:30Z",
    "end_time": "2024-01-01T10:01:00Z",
    "error_message": null
  },
  "files": {
    "input_files": ["/path/to/input.pdf"],
    "output_files": ["/tmp/morag/stage_1_output.md"]
  },
  "context": {
    "source_path": "/path/to/input.pdf",
    "output_dir": "/tmp/morag/output",
    "total_stages_completed": 1,
    "total_stages_failed": 0
  },
  "metadata": {
    "config_used": {
      "chunk_size": 4000,
      "overlap": 200
    },
    "metrics": {
      "pages_processed": 15,
      "content_length": 52428
    },
    "warnings": []
  }
};

const pipelineWebhookPayload = {
  "event": "pipeline_completed",
  "timestamp": "2024-01-01T10:05:00Z",
  "pipeline": {
    "success": true,
    "error_message": null,
    "total_execution_time": 45.2,
    "stages_completed": 5,
    "stages_failed": 0,
    "stages_skipped": 0
  },
  "context": {
    "source_path": "/path/to/input.pdf",
    "output_dir": "/tmp/morag/output",
    "intermediate_files": [
      "/tmp/morag/stage_1_output.md",
      "/tmp/morag/stage_2_output.md",
      "/tmp/morag/stage_3_output.json",
      "/tmp/morag/stage_4_output.json"
    ]
  },
  "stages": [
    {
      "type": 1,
      "status": "completed",
      "execution_time": 15.5,
      "output_files": ["/tmp/morag/stage_1_output.md"],
      "error_message": null
    },
    {
      "type": 2,
      "status": "completed",
      "execution_time": 8.3,
      "output_files": ["/tmp/morag/stage_2_output.md"],
      "error_message": null
    },
    {
      "type": 3,
      "status": "completed",
      "execution_time": 12.1,
      "output_files": ["/tmp/morag/stage_3_output.json"],
      "error_message": null
    },
    {
      "type": 4,
      "status": "completed",
      "execution_time": 18.7,
      "output_files": ["/tmp/morag/stage_4_output.json"],
      "error_message": null
    },
    {
      "type": 5,
      "status": "completed",
      "execution_time": 9.4,
      "output_files": [],
      "error_message": null
    }
  ]
};

async function testWebhook(endpoint, payload, description) {
  console.log(`\n🧪 Testing ${description}...`);
  console.log(`📍 Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, responseData);
    } else {
      console.log(`❌ Failed (${response.status}):`, responseData);
    }
  } catch (error) {
    console.log(`💥 Error:`, error.message);
  }
}

async function testWebhookValidation() {
  console.log('🚀 Testing Webhook Endpoints with WEBHOOK_GUIDE.md formats\n');
  console.log(`Base URL: ${BASE_URL}`);

  // Test step-based webhook (morag endpoint)
  await testWebhook(
    '/api/webhooks/morag',
    stepWebhookPayload,
    'Step-based webhook (metadata extraction)'
  );

  // Test stage-based webhook (stages endpoint)
  await testWebhook(
    '/api/webhooks/stages',
    stageWebhookPayload,
    'Stage-based webhook (stage completed)'
  );

  // Test pipeline-based webhook (stages endpoint)
  await testWebhook(
    '/api/webhooks/stages',
    pipelineWebhookPayload,
    'Pipeline-based webhook (pipeline completed)'
  );

  // Test invalid payloads
  console.log('\n🔍 Testing validation with invalid payloads...');

  await testWebhook(
    '/api/webhooks/morag',
    { invalid: 'payload' },
    'Invalid step webhook payload'
  );

  await testWebhook(
    '/api/webhooks/stages',
    { invalid: 'payload' },
    'Invalid stage webhook payload'
  );

  console.log('\n✨ Webhook testing completed!');
}

// Run the tests
if (require.main === module) {
  testWebhookValidation().catch(console.error);
}

module.exports = { testWebhookValidation };
