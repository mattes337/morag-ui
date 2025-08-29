# Staged Processing Implementation Plan

## Overview

This document outlines the implementation plan for migrating the Morag UI to support the new staged processing backend architecture. The backend is being rewritten to use a staged processing approach, and we need to reflect this in the UI while supporting each step individually and visualizing the processing stages for each document.

## Background

The current system processes documents in a monolithic way. The new staged approach breaks document processing into discrete, manageable stages that can be executed independently, monitored, and debugged more effectively.

## Processing Stages

### 1. markdown-conversion Stage
- **Purpose**: Convert input files to unified markdown format
- **Input**: Video/Audio/Document files, URLs, or text
- **Output**: `{filename}.md` with metadata header
- **Services**: VideoService, AudioService, DocumentService, WebService

### 2. markdown-optimizer Stage (Optional)
- **Purpose**: LLM-based text improvement and transcription error correction
- **Input**: `{filename}.md` from markdown-conversion
- **Output**: `{filename}.opt.md` (optimized markdown)

### 3. chunker Stage
- **Purpose**: Create summary, chunks, and contextual embeddings
- **Input**: `{filename}.opt.md` (preferred) or `{filename}.md` (fallback)
- **Output**: `{filename}.chunks.json`
- **Note**: Always prioritizes optimized markdown over converted markdown

### 4. fact-generator Stage
- **Purpose**: Extract facts, entities, relations, and keywords
- **Input**: `{filename}.chunks.json` (REQUIRED - only accepts chunk files)
- **Output**: `{filename}.facts.json`
- **Note**: Will fail if chunk files are not available

### 5. ingestor Stage
- **Purpose**: Database ingestion and storage
- **Input**: `{filename}.facts.json` (REQUIRED - only accepts fact files)
- **Output**: Database records and `{filename}.ingestion.json`
- **Note**: Will fail if fact files are not available

## Key Invariants

### Error Handling
- **No Automatic Retries**: When any stage fails, it is immediately marked as failed with error message/code stored
- **Manual Retry Only**: Jobs can only be retried by explicit user action
- **Mode Degradation**: Documents in AUTOMATIC processing mode are degraded to MANUAL when any stage fails

### File Type Requirements
- **Chunker**: Prioritizes `.opt.md` files over `.md` files when both are available
- **Fact-Generator**: Only accepts `.chunks.json` files - will fail if chunk files are missing
- **Ingestor**: Only accepts `.facts.json` files - will fail if fact files are missing

### Processing Flow
- Each stage validates its required input file types before processing
- Missing required files cause immediate failure with descriptive error messages
- Optimized files are always preferred over non-optimized versions when available

1. **Output File Management**: We will receive output files for each stage via webhooks (alternative: manual REST calls)
2. **Database Storage**: Each output file for documents must be stored in the database
3. **Document Migration**: Support migrating documents between realms/databases
4. **No Backwards Compatibility**: Remove legacy code, no backwards compatibility
5. **Swagger Integration**: New swagger file will be provided when backend is implemented

## Advised Endpoints

- `/api/v1/stages/markdown-conversion/execute`
- `/api/v1/stages/markdown-optimizer/execute`
- `/api/v1/stages/chunker/execute`
- `/api/v1/stages/fact-generator/execute`
- `/api/v1/stages/ingestor/execute`
- `/api/v1/stages/chain`
- `/api/v1/files/*`

## Implementation Tasks

### High Priority
- [ ] **Task 1**: [Webhook vs Manual Trigger Evaluation](./task-1-webhook-evaluation.md)
- [ ] **Task 2**: [Database Schema Changes](./task-2-database-schema.md)

### Medium Priority
- [ ] **Task 3**: [UI Components for Stage Visualization](./task-3-ui-components.md)
- [ ] **Task 4**: [Document Migration Between Realms](./task-4-document-migration.md)
- [ ] **Task 5**: [API Endpoints Implementation](./task-5-api-integration.md)

### Low Priority
- [ ] **Task 6**: [Legacy Code Removal](./task-6-legacy-cleanup.md)

## Progress Tracking

### Completed Tasks
- [x] Project structure setup
- [x] Implementation plan documentation

### In Progress
- [ ] Task breakdown and detailed specifications

### Pending
- [ ] Backend API integration
- [ ] UI component development
- [ ] Database schema updates
- [ ] Testing and validation

## Success Criteria

1. **Stage Visualization**: Users can see the current processing stage for each document
2. **Individual Stage Control**: Users can trigger individual stages manually if needed
3. **Migration Support**: Documents can be migrated between realms seamlessly
4. **File Management**: All stage output files are properly stored and accessible
5. **Clean Architecture**: Legacy code is removed, new architecture is maintainable

## Dependencies

- Backend staged processing implementation
- New Swagger API documentation
- Database schema updates
- Webhook infrastructure (if chosen over manual triggers)

## Risk Mitigation

- **API Changes**: Plan for potential changes in backend API during development
- **Data Migration**: Ensure existing documents can be processed through new stages
- **Performance**: Monitor performance impact of storing multiple files per document
- **User Experience**: Maintain intuitive UI while adding complexity

## Next Steps

1. Review and approve this implementation plan
2. Begin with high-priority tasks (webhook evaluation and database schema)
3. Implement tasks iteratively with regular testing
4. Update progress tracking as tasks are completed

---

*Last Updated: [Current Date]*
*Status: Planning Phase*