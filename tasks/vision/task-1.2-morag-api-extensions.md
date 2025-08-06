# Task 1.2: MoRAG API Extensions

**Phase**: 1 - Realm Domain Configuration
**Status**: ❌ Not Started
**Priority**: High
**Estimated Effort**: 1-2 days

## Overview

Define the required MoRAG backend API functionality for document operations. The MoRAG backend is responsible for talking to the actual vector/graph databases, performing ingestion, retrieval, and querying operations. The UI backend stores metadata and coordinates with MoRAG for actual document operations.

## MoRAG Backend Architecture

The MoRAG backend:
- Connects directly to vector/graph databases (Qdrant, Neo4j, Pinecone, etc.)
- Handles document ingestion and processing
- Performs entity extraction and fact generation
- Executes queries and retrieval operations
- Stores entities, facts, and chunks in the databases
- Returns processed results to the UI backend

## Required MoRAG API Endpoints

### 1. Document Ingestion

#### Add Documents to Databases
```typescript
// Ingest document into specified databases
POST /api/morag/documents/ingest
Request: {
  document: {
    id: string;
    name: string;
    content: string; // Full document content
    type: string; // pdf, docx, txt, etc.
    metadata?: Record<string, any>;
  };
  databases: Array<{
    type: "qdrant" | "neo4j" | "pinecone" | "weaviate" | "chroma";
    connectionString: string;
    collection?: string; // For vector databases
    database?: string; // For graph databases
    apiKey?: string;
    additionalConfig?: Record<string, any>;
  }>;
  processingConfig: {
    domain?: string; // Domain for specialized processing
    ingestionPrompt?: string; // Custom prompt for processing
    extractEntities: boolean;
    generateFacts: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
  };
  webhook?: {
    url: string; // Webhook URL for progress updates
    headers?: Record<string, string>; // Optional headers for authentication
    secret?: string; // Optional secret for webhook verification
  };
}
Response: {
  success: boolean;
  documentId: string;
  jobId: string; // Unique job ID for tracking progress
  results: Array<{
    databaseType: string;
    success: boolean;
    chunksCreated: number;
    entitiesExtracted: number;
    factsGenerated: number;
    error?: string;
  }>;
  processingTime: number;
}
```

#### Batch Document Ingestion
```typescript
// Ingest multiple documents in batch
POST /api/morag/documents/batch-ingest
Request: {
  documents: Array<{
    id: string;
    name: string;
    content: string;
    type: string;
    metadata?: Record<string, any>;
  }>;
  databases: Array<DatabaseConfig>; // Same as above
  processingConfig: ProcessingConfig; // Same as above
  webhook?: {
    url: string; // Webhook URL for progress updates
    headers?: Record<string, string>;
    secret?: string;
  };
}
Response: {
  success: boolean;
  batchJobId: string; // Unique batch job ID for tracking
  results: Array<{
    documentId: string;
    jobId: string; // Individual document job ID
    success: boolean;
    databaseResults: Array<DatabaseResult>;
    error?: string;
  }>;
  totalProcessingTime: number;
}
```

### 2. Document Deletion

#### Delete Documents from Databases
```typescript
// Delete document from specified databases with entity preservation
POST /api/morag/documents/delete
Request: {
  documentId: string;
  databases: Array<{
    type: "qdrant" | "neo4j" | "pinecone" | "weaviate" | "chroma";
    connectionString: string;
    collection?: string;
    database?: string;
    apiKey?: string;
  }>;
  deletionConfig: {
    preserveEntities: boolean; // Keep entities even if orphaned
    deleteChunks: boolean; // Delete document chunks
    deleteFacts: boolean; // Delete facts derived from document
    createAuditLog: boolean;
  };
}
Response: {
  success: boolean;
  documentId: string;
  results: Array<{
    databaseType: string;
    success: boolean;
    chunksDeleted: number;
    factsDeleted: number;
    entitiesPreserved: number;
    entitiesOrphaned: number;
    error?: string;
  }>;
  auditLogId?: string;
}
```

#### Analyze Deletion Impact
```typescript
// Analyze what will be deleted before actual deletion
POST /api/morag/documents/deletion-impact
Request: {
  documentIds: string[];
  databases: Array<DatabaseConfig>;
}
Response: {
  impact: {
    documentsToDelete: number;
    totalChunks: number;
    totalFacts: number;
    affectedEntities: number;
    orphanedEntities: number;
    estimatedTime: number; // seconds
    warnings: string[];
    databaseBreakdown: Array<{
      databaseType: string;
      chunks: number;
      facts: number;
      entities: number;
    }>;
  };
}
```

### 3. Query and Retrieval

#### Perform Queries Across Databases
```typescript
// Execute query across specified databases
POST /api/morag/query
Request: {
  query: string;
  databases: Array<{
    type: "qdrant" | "neo4j" | "pinecone" | "weaviate" | "chroma";
    connectionString: string;
    collection?: string;
    database?: string;
    apiKey?: string;
  }>;
  queryConfig: {
    maxResults: number;
    similarityThreshold?: number;
    systemPrompt?: string; // Custom prompt for query processing
    includeMetadata: boolean;
    includeChunks: boolean;
    includeEntities: boolean;
    includeFacts: boolean;
  };
}
Response: {
  success: boolean;
  query: string;
  results: Array<{
    databaseType: string;
    results: Array<{
      id: string;
      content: string;
      score: number;
      metadata?: Record<string, any>;
      chunks?: Array<{
        id: string;
        content: string;
        score: number;
      }>;
      entities?: Array<{
        name: string;
        type: string;
        confidence: number;
      }>;
      facts?: Array<{
        subject: string;
        predicate: string;
        object: string;
        confidence: number;
      }>;
    }>;
    executionTime: number;
    error?: string;
  }>;
  totalExecutionTime: number;
}
```

#### Retrieve Specific Content
```typescript
// Get document chunks from databases
POST /api/morag/documents/chunks
Request: {
  documentId: string;
  databases: Array<DatabaseConfig>;
  filters?: {
    minScore?: number;
    maxResults?: number;
    includeMetadata?: boolean;
  };
}
Response: {
  documentId: string;
  chunks: Array<{
    id: string;
    content: string;
    chunkIndex: number;
    metadata?: Record<string, any>;
    databaseSource: string;
  }>;
}

// Get entities for document
POST /api/morag/documents/entities
Request: {
  documentId: string;
  databases: Array<DatabaseConfig>;
  entityTypes?: string[]; // Filter by entity types
}
Response: {
  documentId: string;
  entities: Array<{
    name: string;
    type: string;
    confidence: number;
    mentions: number;
    databaseSource: string;
  }>;
}
```

### 4. Webhook Progress Updates

#### Webhook Payload Specification
```typescript
// Webhook payload sent by MoRAG backend during processing
POST {webhook.url}
Headers: {
  "Content-Type": "application/json",
  "X-MoRAG-Signature": "sha256=..." // HMAC signature if secret provided
  ...webhook.headers // Additional headers from request
}
Request: {
  jobId: string; // Job ID from original request
  documentId: string; // Document being processed
  batchJobId?: string; // Present if part of batch operation
  timestamp: string; // ISO timestamp
  status: "started" | "in_progress" | "completed" | "failed";
  progress: {
    percentage: number; // 0-100 completion percentage
    currentStep: string; // Current processing step
    totalSteps: number; // Total number of steps
    stepIndex: number; // Current step index (0-based)
  };
  stepDetails: {
    step: "parsing" | "chunking" | "embedding" | "extracting_entities" | "generating_facts" | "storing" | "indexing";
    description: string; // Human-readable step description
    startedAt: string; // ISO timestamp when step started
    completedAt?: string; // ISO timestamp when step completed (if finished)
    metadata?: Record<string, any>; // Step-specific metadata
  };
  results?: {
    // Present when status is "completed"
    chunksCreated: number;
    entitiesExtracted: number;
    factsGenerated: number;
    databaseResults: Array<{
      databaseType: string;
      success: boolean;
      error?: string;
    }>;
  };
  error?: {
    // Present when status is "failed"
    code: string;
    message: string;
    step: string; // Step where error occurred
    details?: Record<string, any>;
  };
}
```

#### Processing Steps
The MoRAG backend will send webhook updates for these processing steps:

1. **parsing** - "Parsing document content"
2. **chunking** - "Splitting document into chunks"
3. **embedding** - "Generating vector embeddings"
4. **extracting_entities** - "Extracting entities from content"
5. **generating_facts** - "Generating facts and relationships"
6. **storing** - "Storing data in databases"
7. **indexing** - "Creating database indexes"

#### Webhook Examples
```typescript
// Step 1: Job started
{
  "jobId": "job_123",
  "documentId": "doc_456",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "started",
  "progress": { "percentage": 0, "currentStep": "parsing", "totalSteps": 7, "stepIndex": 0 },
  "stepDetails": {
    "step": "parsing",
    "description": "Parsing document content",
    "startedAt": "2024-01-15T10:30:00Z"
  }
}

// Step 3: Embedding in progress
{
  "jobId": "job_123",
  "documentId": "doc_456",
  "timestamp": "2024-01-15T10:31:30Z",
  "status": "in_progress",
  "progress": { "percentage": 43, "currentStep": "embedding", "totalSteps": 7, "stepIndex": 2 },
  "stepDetails": {
    "step": "embedding",
    "description": "Generating vector embeddings",
    "startedAt": "2024-01-15T10:31:15Z",
    "metadata": { "chunksProcessed": 15, "totalChunks": 35 }
  }
}

// Final: Job completed
{
  "jobId": "job_123",
  "documentId": "doc_456",
  "timestamp": "2024-01-15T10:35:00Z",
  "status": "completed",
  "progress": { "percentage": 100, "currentStep": "indexing", "totalSteps": 7, "stepIndex": 6 },
  "stepDetails": {
    "step": "indexing",
    "description": "Creating database indexes",
    "startedAt": "2024-01-15T10:34:45Z",
    "completedAt": "2024-01-15T10:35:00Z"
  },
  "results": {
    "chunksCreated": 35,
    "entitiesExtracted": 127,
    "factsGenerated": 89,
    "databaseResults": [
      { "databaseType": "qdrant", "success": true },
      { "databaseType": "neo4j", "success": true }
    ]
  }
}
```

### 5. Database Management

#### Database Health and Statistics
```typescript
// Check database connectivity and health
POST /api/morag/databases/health-check
Request: {
  databases: Array<DatabaseConfig>;
}
Response: {
  results: Array<{
    databaseType: string;
    healthy: boolean;
    responseTime: number;
    documentCount?: number;
    chunkCount?: number;
    entityCount?: number;
    error?: string;
  }>;
}

// Get database statistics
POST /api/morag/databases/statistics
Request: {
  databases: Array<DatabaseConfig>;
}
Response: {
  statistics: Array<{
    databaseType: string;
    totalDocuments: number;
    totalChunks: number;
    totalEntities: number;
    totalFacts: number;
    storageSize: string;
    lastUpdated: string;
  }>;
}
```

## Implementation Notes for MoRAG Backend Team

### Architecture Overview
The MoRAG backend serves as the bridge between the UI backend and the actual vector/graph databases:

```
UI Backend → MoRAG Backend → Vector/Graph Databases
     ↑              ↑              ↑
  Metadata      Processing     Actual Data
   Storage      & Routing      Storage
```

### Priority Order
1. **Document Ingestion** - Core functionality for adding documents to databases
2. **Query and Retrieval** - Essential for search and content discovery
3. **Document Deletion** - Important for data management and compliance
4. **Database Management** - Health checks and statistics for monitoring

### Key Implementation Considerations

#### Database Connections
- Support multiple database types simultaneously
- Handle connection pooling and management
- Validate connection strings and credentials
- Graceful handling of database unavailability

#### Processing Pipeline
- Chunking strategies for different document types
- Entity extraction using NLP models
- Fact generation from extracted entities
- Vector embedding generation for semantic search
- Progress tracking and webhook notifications at each step

#### Error Handling
- Partial success scenarios (some databases succeed, others fail)
- Retry mechanisms for transient failures
- Detailed error reporting for debugging
- Rollback capabilities for failed operations

#### Performance Optimization
- Async processing for large documents
- Batch operations for multiple documents
- Caching for frequently accessed data
- Progress tracking for long-running operations
- Webhook delivery with retry mechanisms and failure handling

#### Security
- Secure handling of database credentials
- Input validation and sanitization
- Rate limiting for API endpoints
- Audit logging for all operations
- Webhook signature verification using HMAC
- Secure webhook URL validation and HTTPS enforcement

### Data Flow Examples

#### Document Ingestion Flow
1. UI Backend sends document + database configs + webhook URL to MoRAG
2. MoRAG starts processing and sends "started" webhook
3. MoRAG processes document with progress webhooks for each step:
   - "parsing" → "chunking" → "embedding" → "extracting_entities" → "generating_facts" → "storing" → "indexing"
4. MoRAG stores chunks/entities in specified databases
5. MoRAG sends "completed" webhook with final results
6. MoRAG returns processing results to UI Backend
7. UI Backend updates metadata and job status

#### Query Flow
1. UI Backend sends query + database configs to MoRAG
2. MoRAG executes query across specified databases
3. MoRAG aggregates and ranks results
4. MoRAG returns unified results to UI Backend
5. UI Backend presents results to user

#### Deletion Flow
1. UI Backend requests deletion impact analysis
2. MoRAG analyzes what will be deleted across databases
3. UI Backend shows impact to user for confirmation
4. UI Backend requests actual deletion
5. MoRAG performs selective deletion preserving entities
6. MoRAG returns deletion summary

This API specification focuses on the functional requirements. The MoRAG backend team can implement the appropriate database adapters, processing pipelines, and service layers to support these operations.
