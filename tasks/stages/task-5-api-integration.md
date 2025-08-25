# Task 5: API Endpoints Implementation and Integration

## Overview
Implement and integrate the new staged processing API endpoints with the UI, replacing legacy document processing calls with the new staged approach.

## New API Endpoints

### Stage Execution Endpoints
- `/api/v1/stages/markdown-conversion/execute`
- `/api/v1/stages/markdown-optimizer/execute`
- `/api/v1/stages/chunker/execute`
- `/api/v1/stages/fact-generator/execute`
- `/api/v1/stages/ingestor/execute`

### Workflow Management
- `/api/v1/stages/chain` - Execute multiple stages in sequence
- `/api/v1/files/*` - File management and retrieval

## API Integration Architecture

### Service Layer Updates

#### StageProcessingService
```typescript
interface StageExecutionRequest {
  documentId: string;
  inputFile?: string;
  parameters?: Record<string, any>;
  realmId: string;
}

interface StageExecutionResponse {
  stageId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  outputFile?: string;
  metadata?: Record<string, any>;
  error?: string;
}

class StageProcessingService {
  async executeStage(stage: string, request: StageExecutionRequest): Promise<StageExecutionResponse>
  async getStageStatus(stageId: string): Promise<StageExecutionResponse>
  async chainStages(stages: string[], request: StageExecutionRequest): Promise<StageExecutionResponse[]>
}
```

#### DocumentProcessingService (Updated)
```typescript
class DocumentProcessingService {
  async processDocument(documentId: string, stages: string[]): Promise<ProcessingWorkflow>
  async getProcessingStatus(workflowId: string): Promise<ProcessingWorkflow>
  async retryStage(workflowId: string, stage: string): Promise<void>
  async cancelProcessing(workflowId: string): Promise<void>
}
```

### API Client Updates

#### Stage-specific API calls
```typescript
// Replace legacy document processing
const executeMarkdownConversion = async (documentId: string, realmId: string) => {
  return apiClient.post('/api/v1/stages/markdown-conversion/execute', {
    documentId,
    realmId
  });
};

const executeChunker = async (documentId: string, inputFile: string, realmId: string) => {
  return apiClient.post('/api/v1/stages/chunker/execute', {
    documentId,
    inputFile,
    realmId
  });
};

// Chain multiple stages
const executeStageChain = async (stages: string[], documentId: string, realmId: string) => {
  return apiClient.post('/api/v1/stages/chain', {
    stages,
    documentId,
    realmId
  });
};
```

### File Management Integration

#### FileService Updates
```typescript
class FileService {
  async getStageOutputFile(documentId: string, stage: string): Promise<Blob>
  async downloadStageOutput(documentId: string, stage: string): Promise<void>
  async getFileMetadata(fileId: string): Promise<FileMetadata>
  async listStageOutputs(documentId: string): Promise<StageOutputFile[]>
}
```

## UI Integration Points

### Document Processing Page
- Replace single "Process" button with stage-specific controls
- Add stage execution buttons for manual triggering
- Integrate with StageProgressIndicator component
- Show stage output files and download options

### Document List/Grid
- Add processing status indicators
- Show current stage for in-progress documents
- Add quick actions for stage management

### Document Details View
- Display complete processing history
- Show stage output files with preview options
- Add stage retry/rerun functionality

## State Management Updates

### Processing State
```typescript
interface ProcessingState {
  workflows: Record<string, ProcessingWorkflow>;
  stageStatuses: Record<string, StageExecutionResponse>;
  activeProcessing: string[];
  errors: Record<string, string>;
}

const useProcessingStore = create<ProcessingState>((set, get) => ({
  // Stage execution actions
  executeStage: async (stage: string, documentId: string) => { /* ... */ },
  updateStageStatus: (stageId: string, status: StageExecutionResponse) => { /* ... */ },
  retryStage: async (workflowId: string, stage: string) => { /* ... */ },
  
  // Workflow management
  startWorkflow: async (documentId: string, stages: string[]) => { /* ... */ },
  cancelWorkflow: async (workflowId: string) => { /* ... */ },
}));
```

### Document State Updates
```typescript
interface DocumentState {
  documents: Record<string, Document>;
  processingStatuses: Record<string, ProcessingWorkflow>;
  stageOutputs: Record<string, StageOutputFile[]>;
}
```

## Error Handling and Retry Logic

### Stage Execution Error Handling
```typescript
const executeStageWithRetry = async (stage: string, request: StageExecutionRequest, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await stageProcessingService.executeStage(stage, request);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### User-facing Error Messages
- Stage-specific error messages
- Retry suggestions and actions
- Progress preservation on failures
- Clear error reporting in UI

## Testing Strategy

### API Integration Tests
```typescript
describe('Stage Processing API Integration', () => {
  test('should execute markdown conversion stage', async () => {
    const response = await executeMarkdownConversion('doc-123', 'realm-456');
    expect(response.status).toBe('completed');
    expect(response.outputFile).toBeDefined();
  });

  test('should handle stage execution errors', async () => {
    // Test error scenarios and retry logic
  });

  test('should chain multiple stages successfully', async () => {
    // Test stage chaining functionality
  });
});
```

### UI Integration Tests
- Stage button interactions
- Progress indicator updates
- Error state handling
- File download functionality

## Implementation Tasks

### Phase 1: Core API Integration (High Priority)
- [ ] Create StageProcessingService with all endpoint methods
- [ ] Update DocumentProcessingService for staged approach
- [ ] Implement FileService updates for stage outputs
- [ ] Add error handling and retry logic
- [ ] Update API client with new endpoints

### Phase 2: State Management (High Priority)
- [ ] Update processing state management
- [ ] Add stage status tracking
- [ ] Implement workflow state management
- [ ] Add real-time status updates

### Phase 3: UI Integration (Medium Priority)
- [ ] Update document processing page
- [ ] Integrate stage controls with UI components
- [ ] Add stage output file management
- [ ] Implement progress visualization

### Phase 4: Testing and Validation (Medium Priority)
- [ ] Write comprehensive API integration tests
- [ ] Add UI interaction tests
- [ ] Test error scenarios and recovery
- [ ] Validate file handling and downloads

### Phase 5: Performance and Optimization (Low Priority)
- [ ] Implement request caching where appropriate
- [ ] Add request debouncing for rapid interactions
- [ ] Optimize file transfer and storage
- [ ] Add performance monitoring

## Success Criteria

### Functional Requirements
- [ ] All stage endpoints successfully integrated
- [ ] Manual stage execution works correctly
- [ ] Stage chaining functionality operational
- [ ] File management and downloads working
- [ ] Error handling provides clear user feedback

### Performance Requirements
- [ ] Stage execution requests complete within 30 seconds
- [ ] File downloads start within 5 seconds
- [ ] UI remains responsive during processing
- [ ] No memory leaks in long-running processes

### User Experience Requirements
- [ ] Clear visual feedback for all stage operations
- [ ] Intuitive error messages and recovery options
- [ ] Consistent behavior across all processing scenarios
- [ ] Accessible stage management controls

## Dependencies

### Internal Dependencies
- Task 2: Database schema changes (for storing stage outputs)
- Task 3: UI components (for stage visualization)
- Task 4: Document migration (for cross-realm processing)

### External Dependencies
- Backend API implementation and deployment
- Updated Swagger documentation
- Authentication and authorization for new endpoints

## Risks and Mitigation

### Technical Risks
- **API endpoint changes**: Maintain backward compatibility during transition
- **File handling complexity**: Implement robust error handling and validation
- **State synchronization**: Use proper state management patterns

### User Experience Risks
- **Processing confusion**: Provide clear stage explanations and help text
- **Performance degradation**: Implement proper loading states and optimization
- **Data loss**: Ensure proper error recovery and state persistence

## Next Steps

1. **API Documentation Review**: Analyze final Swagger documentation when available
2. **Service Implementation**: Start with StageProcessingService implementation
3. **Integration Testing**: Set up comprehensive test suite for API integration
4. **UI Updates**: Begin integrating new services with existing UI components
5. **User Testing**: Validate new workflow with stakeholders

## Notes

- Prioritize manual stage triggering over webhook implementation initially
- Ensure all API calls include proper error handling and user feedback
- Consider implementing optimistic UI updates for better user experience
- Plan for gradual rollout with feature flags if needed