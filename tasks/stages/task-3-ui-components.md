# Task 3: UI Components for Stage Visualization

## Overview

Design and implement UI components to visualize document processing stages, provide stage control, and display processing progress. This includes creating reusable components that integrate with the new staged processing architecture.

## Component Architecture

### 1. Stage Progress Indicator

A visual component showing the current processing stage and overall progress.

```typescript
// components/stages/StageProgressIndicator.tsx

interface StageProgressIndicatorProps {
  stages: ProcessingStage[];
  currentStage?: string;
  className?: string;
}

export function StageProgressIndicator({ 
  stages, 
  currentStage, 
  className 
}: StageProgressIndicatorProps) {
  // Implementation with progress bar and stage indicators
}
```

**Features:**
- Horizontal progress bar with stage markers
- Color-coded status indicators (pending, in-progress, completed, failed)
- Tooltips showing stage details and timestamps
- Responsive design for mobile and desktop
- Animation for stage transitions

### 2. Stage Control Panel

Interactive component for manual stage triggering and management.

```typescript
// components/stages/StageControlPanel.tsx

interface StageControlPanelProps {
  documentId: string;
  stages: ProcessingStage[];
  onStageExecute: (stageName: string) => Promise<void>;
  onStageRetry: (stageName: string) => Promise<void>;
  disabled?: boolean;
}

export function StageControlPanel({ 
  documentId, 
  stages, 
  onStageExecute, 
  onStageRetry, 
  disabled 
}: StageControlPanelProps) {
  // Implementation with stage buttons and controls
}
```

**Features:**
- Individual stage execution buttons
- Retry failed stages functionality
- Stage dependency validation
- Loading states during execution
- Error display and handling
- Bulk operations (run all, reset all)

### 3. Stage Details View

Detailed view of individual stage information and outputs.

```typescript
// components/stages/StageDetailsView.tsx

interface StageDetailsViewProps {
  documentId: string;
  stage: ProcessingStage;
  outputFiles: StageOutputFile[];
  onFileDownload: (fileId: string) => void;
  onFilePreview: (fileId: string) => void;
}

export function StageDetailsView({ 
  documentId, 
  stage, 
  outputFiles, 
  onFileDownload, 
  onFilePreview 
}: StageDetailsViewProps) {
  // Implementation with stage details and file management
}
```

**Features:**
- Stage execution timeline
- Output file listing and management
- File preview capabilities
- Error logs and debugging information
- Stage configuration display
- Performance metrics (execution time, file sizes)

### 4. Processing Workflow Manager

High-level component for managing entire document processing workflows.

```typescript
// components/stages/ProcessingWorkflowManager.tsx

interface ProcessingWorkflowManagerProps {
  documentId: string;
  workflow: ProcessingWorkflow;
  onWorkflowStart: () => Promise<void>;
  onWorkflowPause: () => Promise<void>;
  onWorkflowReset: () => Promise<void>;
  mode: 'automatic' | 'manual';
  onModeChange: (mode: 'automatic' | 'manual') => void;
}

export function ProcessingWorkflowManager({ 
  documentId, 
  workflow, 
  onWorkflowStart, 
  onWorkflowPause, 
  onWorkflowReset, 
  mode, 
  onModeChange 
}: ProcessingWorkflowManagerProps) {
  // Implementation with workflow controls
}
```

**Features:**
- Workflow mode selection (automatic vs manual)
- Start/pause/reset workflow controls
- Overall progress tracking
- Estimated completion time
- Workflow configuration options
- Batch processing support

### 5. Stage Output File Viewer

Component for viewing and managing stage output files.

```typescript
// components/stages/StageOutputFileViewer.tsx

interface StageOutputFileViewerProps {
  files: StageOutputFile[];
  selectedFileId?: string;
  onFileSelect: (fileId: string) => void;
  onFileDownload: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
}

export function StageOutputFileViewer({ 
  files, 
  selectedFileId, 
  onFileSelect, 
  onFileDownload, 
  onFileDelete 
}: StageOutputFileViewerProps) {
  // Implementation with file browser and viewer
}
```

**Features:**
- File browser with search and filtering
- File preview for supported formats (markdown, JSON)
- File metadata display (size, type, checksum)
- Download and delete operations
- File comparison between stages
- Syntax highlighting for code files

## Integration Components

### 1. Enhanced Document Detail View

Update existing document detail view to include stage information.

```typescript
// components/views/DocumentDetailView.tsx (updated)

export function DocumentDetailView({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<DocumentWithStages | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'stages' | 'files'>('content');
  
  return (
    <div className="document-detail-view">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="stages">Processing Stages</TabsTrigger>
          <TabsTrigger value="files">Output Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          {/* Existing content view */}
        </TabsContent>
        
        <TabsContent value="stages">
          <ProcessingWorkflowManager 
            documentId={documentId}
            workflow={document?.processingWorkflow}
            // ... other props
          />
          <StageProgressIndicator 
            stages={document?.stages || []}
            currentStage={document?.processingWorkflow?.currentStage}
          />
          <StageControlPanel 
            documentId={documentId}
            stages={document?.stages || []}
            // ... other props
          />
        </TabsContent>
        
        <TabsContent value="files">
          <StageOutputFileViewer 
            files={document?.outputFiles || []}
            // ... other props
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 2. Documents List with Stage Status

Update documents list to show processing status.

```typescript
// components/views/DocumentsView.tsx (updated)

interface DocumentListItemProps {
  document: DocumentWithStages;
  onSelect: (id: string) => void;
}

function DocumentListItem({ document, onSelect }: DocumentListItemProps) {
  const completedStages = document.stages?.filter(s => s.status === 'completed').length || 0;
  const totalStages = document.stages?.length || 0;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
  
  return (
    <div className="document-list-item">
      <div className="document-info">
        <h3>{document.title}</h3>
        <p>{document.realm?.name}</p>
      </div>
      
      <div className="processing-status">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="progress-text">
          {completedStages}/{totalStages} stages
        </span>
      </div>
      
      <StageStatusBadge 
        status={document.processingWorkflow?.currentStage}
      />
    </div>
  );
}
```

## Shared Components and Utilities

### 1. Stage Status Badge

```typescript
// components/ui/StageStatusBadge.tsx

interface StageStatusBadgeProps {
  status: StageStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StageStatusBadge({ status, size = 'md' }: StageStatusBadgeProps) {
  const statusConfig = {
    pending: { color: 'gray', icon: Clock },
    in_progress: { color: 'blue', icon: Loader },
    completed: { color: 'green', icon: CheckCircle },
    failed: { color: 'red', icon: XCircle },
    skipped: { color: 'yellow', icon: SkipForward }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.color} size={size}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ')}
    </Badge>
  );
}
```

### 2. Stage Timeline Component

```typescript
// components/stages/StageTimeline.tsx

interface StageTimelineProps {
  stages: ProcessingStage[];
  showDetails?: boolean;
}

export function StageTimeline({ stages, showDetails = false }: StageTimelineProps) {
  return (
    <div className="stage-timeline">
      {stages.map((stage, index) => (
        <div key={stage.id} className="timeline-item">
          <div className="timeline-marker">
            <StageStatusBadge status={stage.status} size="sm" />
          </div>
          
          <div className="timeline-content">
            <h4>{stage.stageName.replace('-', ' ')}</h4>
            
            {showDetails && (
              <div className="stage-details">
                {stage.startedAt && (
                  <p>Started: {formatDateTime(stage.startedAt)}</p>
                )}
                {stage.completedAt && (
                  <p>Completed: {formatDateTime(stage.completedAt)}</p>
                )}
                {stage.errorMessage && (
                  <p className="error-message">{stage.errorMessage}</p>
                )}
              </div>
            )}
          </div>
          
          {index < stages.length - 1 && (
            <div className="timeline-connector" />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. File Preview Modal

```typescript
// components/stages/FilePreviewModal.tsx

interface FilePreviewModalProps {
  file: StageOutputFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (file && isOpen) {
      loadFileContent(file.id);
    }
  }, [file, isOpen]);
  
  const loadFileContent = async (fileId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/${fileId}/content`);
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error('Failed to load file content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{file?.fileName}</DialogTitle>
        </DialogHeader>
        
        <div className="file-preview-content">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <pre className="whitespace-pre-wrap">
              <code>{content}</code>
            </pre>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => downloadFile(file?.id)}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Styling and Theming

### 1. Stage-specific Colors

```css
/* globals.css additions */

:root {
  --stage-pending: #6b7280;
  --stage-in-progress: #3b82f6;
  --stage-completed: #10b981;
  --stage-failed: #ef4444;
  --stage-skipped: #f59e0b;
  
  --stage-markdown-conversion: #8b5cf6;
  --stage-markdown-optimizer: #06b6d4;
  --stage-chunker: #10b981;
  --stage-fact-generator: #f59e0b;
  --stage-ingestor: #ef4444;
}

.stage-progress-indicator {
  @apply flex items-center space-x-2 p-4 bg-white rounded-lg shadow;
}

.stage-control-panel {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4;
}

.stage-details-view {
  @apply space-y-6 p-6 bg-gray-50 rounded-lg;
}

.stage-timeline {
  @apply relative space-y-4;
}

.timeline-item {
  @apply flex items-start space-x-4;
}

.timeline-marker {
  @apply flex-shrink-0;
}

.timeline-content {
  @apply flex-1 min-w-0;
}

.timeline-connector {
  @apply absolute left-4 top-8 bottom-0 w-px bg-gray-300;
}
```

### 2. Responsive Design

```css
/* Mobile-first responsive design */

@media (max-width: 768px) {
  .stage-control-panel {
    @apply grid-cols-1;
  }
  
  .stage-progress-indicator {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .document-list-item {
    @apply flex-col space-y-2;
  }
}

@media (min-width: 1024px) {
  .stage-details-view {
    @apply grid grid-cols-2 gap-6;
  }
}
```

## State Management

### 1. Stage Context Provider

```typescript
// contexts/StageContext.tsx

interface StageContextValue {
  stages: ProcessingStage[];
  workflow: ProcessingWorkflow | null;
  outputFiles: StageOutputFile[];
  loading: boolean;
  error: string | null;
  
  executeStage: (stageName: string) => Promise<void>;
  retryStage: (stageName: string) => Promise<void>;
  refreshStages: () => Promise<void>;
  updateWorkflowMode: (mode: 'automatic' | 'manual') => Promise<void>;
}

export function StageProvider({ 
  documentId, 
  children 
}: { 
  documentId: string; 
  children: React.ReactNode; 
}) {
  const [stages, setStages] = useState<ProcessingStage[]>([]);
  const [workflow, setWorkflow] = useState<ProcessingWorkflow | null>(null);
  const [outputFiles, setOutputFiles] = useState<StageOutputFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation of context methods
  
  return (
    <StageContext.Provider value={{
      stages,
      workflow,
      outputFiles,
      loading,
      error,
      executeStage,
      retryStage,
      refreshStages,
      updateWorkflowMode
    }}>
      {children}
    </StageContext.Provider>
  );
}
```

### 2. Custom Hooks

```typescript
// hooks/useStages.ts

export function useStages(documentId: string) {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStages must be used within StageProvider');
  }
  return context;
}

export function useStageExecution() {
  const [executing, setExecuting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const executeStage = async (documentId: string, stageName: string) => {
    setExecuting(stageName);
    setProgress(0);
    
    try {
      // Implementation with progress tracking
      const result = await stageService.executeStage(documentId, stageName);
      return result;
    } finally {
      setExecuting(null);
      setProgress(0);
    }
  };
  
  return { executing, progress, executeStage };
}
```

## Implementation Tasks

### Phase 1: Core Components
- [ ] Create StageProgressIndicator component
- [ ] Implement StageStatusBadge component
- [ ] Build StageTimeline component
- [ ] Add basic styling and theming

### Phase 2: Interactive Components
- [ ] Develop StageControlPanel component
- [ ] Create ProcessingWorkflowManager component
- [ ] Implement StageDetailsView component
- [ ] Add file preview functionality

### Phase 3: Integration
- [ ] Update DocumentDetailView with stage tabs
- [ ] Enhance DocumentsView with stage status
- [ ] Create StageContext and providers
- [ ] Implement custom hooks

### Phase 4: Advanced Features
- [ ] Add StageOutputFileViewer component
- [ ] Implement FilePreviewModal
- [ ] Add batch operations support
- [ ] Create responsive design optimizations

### Phase 5: Testing and Polish
- [ ] Unit tests for all components
- [ ] Integration tests with mock data
- [ ] Accessibility improvements
- [ ] Performance optimizations

## Success Criteria

1. **Visual Clarity**: Users can easily understand current processing status
2. **Interactive Control**: Users can trigger and manage individual stages
3. **File Management**: Users can view and download stage output files
4. **Responsive Design**: Components work well on all device sizes
5. **Performance**: Components render quickly with large numbers of stages
6. **Accessibility**: Components are accessible to users with disabilities

## Testing Strategy

### 1. Component Testing

```typescript
// __tests__/components/stages/StageProgressIndicator.test.tsx

describe('StageProgressIndicator', () => {
  it('displays correct progress for completed stages', () => {
    const stages = [
      { stageName: 'markdown-conversion', status: 'completed' },
      { stageName: 'chunker', status: 'in_progress' },
      { stageName: 'ingestor', status: 'pending' }
    ];
    
    render(<StageProgressIndicator stages={stages} />);
    
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

```typescript
// __tests__/integration/stage-workflow.test.tsx

describe('Stage Workflow Integration', () => {
  it('executes stages in correct order', async () => {
    const mockDocument = createMockDocumentWithStages();
    
    render(
      <StageProvider documentId={mockDocument.id}>
        <ProcessingWorkflowManager />
      </StageProvider>
    );
    
    // Test stage execution flow
  });
});
```

## Next Steps

1. **Design Review**: Get approval for component designs and user flows
2. **Component Library**: Set up component development environment
3. **Mock Data**: Create comprehensive mock data for testing
4. **Implementation**: Begin with core components (Phase 1)
5. **Integration**: Connect components with backend services

---

**Status**: Planning  
**Priority**: Medium  
**Estimated Effort**: 3-4 weeks  
**Dependencies**: Database schema, API endpoints, design system