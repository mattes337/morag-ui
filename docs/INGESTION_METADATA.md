# Ingestion Metadata Feature

This document describes the ingestion metadata feature that allows storing and displaying detailed information about document processing results.

## Overview

The ingestion metadata feature stores comprehensive information about document processing, including:
- Processing statistics and performance metrics
- Chunk analysis and embeddings data
- Knowledge graph entities and relations
- Database configuration details
- Source information and metadata

## Database Schema

### Document Table Updates

Two new columns have been added to the `Document` table:

```sql
ALTER TABLE Document ADD COLUMN ingestionMetadata JSON;
ALTER TABLE Document ADD COLUMN summary TEXT;
```

- `ingestionMetadata`: Stores the complete ingestion metadata as a JSON object
- `summary`: Stores the textual summary extracted from the ingestion metadata

## API Endpoints

### Update Ingestion Metadata

**PUT** `/api/documents/[id]/ingestion-metadata`

Updates the ingestion metadata for a specific document.

**Request Body:**
```json
{
  "ingestionMetadata": {
    "ingestion_id": "string",
    "timestamp": "ISO 8601 string",
    "source_info": {
      "source_path": "string",
      "content_type": "string",
      "document_id": "string"
    },
    "processing_result": {
      "success": boolean,
      "processing_time": number,
      "content_length": number,
      "metadata": object
    },
    "databases_configured": [
      {
        "type": "string",
        "hostname": "string",
        "port": number,
        "database_name": "string"
      }
    ],
    "embeddings_data": {
      "chunk_count": number,
      "chunk_size": number,
      "chunk_overlap": number,
      "embedding_dimension": number,
      "chunks": [
        {
          "chunk_id": "string",
          "chunk_index": number,
          "chunk_text": "string",
          "chunk_size": number,
          "embedding": number[],
          "metadata": object
        }
      ]
    },
    "knowledge_graph": {
      "entities": [
        {
          "id": "string",
          "type": "string",
          "name": "string",
          "properties": object
        }
      ],
      "relations": [
        {
          "id": "string",
          "source_entity_id": "string",
          "target_entity_id": "string",
          "relation_type": "string",
          "properties": object
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "ingestionMetadata": object,
  // ... other document fields
}
```

### Get Ingestion Metadata

**GET** `/api/documents/[id]/ingestion-metadata`

Retrieves the ingestion metadata for a specific document.

**Response:**
```json
{
  "ingestionMetadata": object | null
}
```

### Update Document Summary

**PUT** `/api/documents/[id]/summary`

Updates the summary for a specific document.

**Request Body:**
```json
{
  "summary": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "summary": "string",
  // ... other document fields
}
```

### Get Document Summary

**GET** `/api/documents/[id]/summary`

Retrieves the summary for a specific document.

**Response:**
```json
{
  "summary": "string" | null
}
```

## UI Components

### IngestionMetadataView

A comprehensive React component that displays ingestion metadata in a tabbed interface:

#### Tabs:
1. **Overview** - Processing stats, embeddings info, knowledge graph summary
2. **Chunks** - Detailed view of text chunks with content preview
3. **Entities** - Knowledge graph entities with type summaries
4. **Relations** - Knowledge graph relations with type summaries

#### Features:
- Interactive chunk selection and content viewing
- Entity and relation type summaries
- Formatted processing times and file sizes
- Database configuration display
- Responsive design with proper loading states

### DocumentDetailView Updates

The document detail view now includes a tabbed interface:

1. **Overview** - Original document stats and actions
2. **Preview** - Document preview/embed
3. **Ingestion Metadata** - New metadata display (only shown if metadata exists)

## TypeScript Types

### IngestionMetadata Interface

```typescript
interface IngestionMetadata {
  ingestion_id: string;
  timestamp: string;
  summary?: string; // Textual summary of the document content
  source_info: {
    source_path: string;
    content_type: string;
    document_id: string;
  };
  processing_result: {
    success: boolean;
    processing_time: number;
    content_length: number;
    metadata: Record<string, any>;
  };
  databases_configured: Array<{
    type: string;
    hostname: string;
    port: number | null;
    database_name: string;
  }>;
  embeddings_data: {
    chunk_count: number;
    chunk_size: number;
    chunk_overlap: number;
    embedding_dimension: number;
    chunks: Array<{
      chunk_id: string;
      chunk_index: number;
      chunk_text: string;
      chunk_size: number;
      embedding: number[];
      metadata: Record<string, any>;
    }>;
  };
  knowledge_graph?: {
    entities: Array<{
      id: string;
      type: string;
      name: string;
      properties: Record<string, any>;
    }>;
    relations: Array<{
      id: string;
      source_entity_id: string;
      target_entity_id: string;
      relation_type: string;
      properties: Record<string, any>;
    }>;
  };
}
```

### Document Interface Updates

```typescript
interface Document {
  // ... existing fields
  ingestionMetadata?: IngestionMetadata;
  summary?: string; // Textual summary extracted from ingestion metadata
}
```

## Service Layer

### DocumentService Updates

New methods added:

```typescript
static async updateIngestionMetadata(id: string, ingestionMetadata: any) {
  // Extract summary from ingestion metadata if available
  const summary = ingestionMetadata?.summary || null;

  return await prisma.document.update({
    where: { id },
    data: {
      ingestionMetadata,
      summary
    },
    include: {
      realm: true,
      jobs: true,
    },
  });
}

static async updateDocumentSummary(id: string, summary: string) {
  return await prisma.document.update({
    where: { id },
    data: { summary },
    include: {
      realm: true,
      jobs: true,
    },
  });
}
```

## Usage Examples

### Updating Ingestion Metadata with Summary

```typescript
// After document processing
const ingestionMetadata = {
  ingestion_id: "c253886e-e7fd-4734-918b-7d2114459099",
  timestamp: "2025-07-06T17:50:38.645173+00:00",
  summary: "This document discusses the implementation of AI-powered document processing...",
  // ... rest of metadata
};

// This will automatically extract and save the summary
await DocumentService.updateIngestionMetadata(documentId, ingestionMetadata);
```

### Updating Summary Separately

```typescript
// Update just the summary
await DocumentService.updateDocumentSummary(documentId, "Updated summary text");
```

### Displaying Metadata in UI

```tsx
import { IngestionMetadataView } from '../components/ingestion/IngestionMetadataView';

function DocumentDetail({ document }) {
  return (
    <div>
      {document.ingestionMetadata && (
        <IngestionMetadataView metadata={document.ingestionMetadata} />
      )}
    </div>
  );
}
```

## Testing

Comprehensive tests are provided for:
- API endpoints (`__tests__/app/api/documents/[id]/ingestion-metadata/route.test.ts`)
- React components (`__tests__/components/ingestion/IngestionMetadataView.test.tsx`)
- Service layer (`__tests__/lib/services/documentService.test.ts`)

## Security Considerations

- Access control: Users can only view/update metadata for documents they own or have realm access to
- Input validation: Ingestion metadata is validated before storage
- Data sanitization: Metadata content is properly escaped in UI display

## Performance Considerations

- JSON storage: Metadata is stored as JSON for flexible querying
- Lazy loading: Metadata is only loaded when the metadata tab is accessed
- Chunked display: Large chunk lists are virtualized for performance

## Migration

To add this feature to an existing installation:

1. Run database migration to add the `ingestionMetadata` column
2. Update application code with new components and API routes
3. Configure document processing pipeline to store metadata after ingestion

## Future Enhancements

- Search within metadata content
- Metadata comparison between document versions
- Export metadata to various formats
- Metadata-based document filtering and sorting
