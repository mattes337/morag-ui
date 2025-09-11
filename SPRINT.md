# ACTIVE IMPLEMENTATION PLAN - BACKEND INTEGRATION
Generated: 2025-09-11T18:00:00Z  
Execution Mode: Real Backend Integration Strategy  
Claude Code Compatible: v1.0  
Backend Server: http://morag.drydev.de:8000/

## 🚀 PARALLEL PHASE (All tasks can run simultaneously)
Duration Estimate: 6-8 hours  
Parallelization Factor: 6 tasks  
Risk Level: LOW (real backend integration with OpenAPI specification)  

**Current State Analysis**: The previous parallel sprint successfully completed 8 major UI features. This sprint focuses on real MoRAG backend integration, removing existing mock implementations, and connecting to the production stage-based processing API at http://morag.drydev.de:8000/.

### Task Group A: Real Backend Integration
#### Task A1: Document Processing Pipeline Real Integration
**Priority**: HIGH  
**Complexity**: MEDIUM  
**Files to Create/Modify**:
```
- app/(dashboard)/pipeline/page.tsx [CREATE]
- components/pipeline/PipelineStages.tsx [CREATE]
- components/pipeline/StageCard.tsx [CREATE]
- components/pipeline/ProcessingQueue.tsx [CREATE]
- components/pipeline/StageConfiguration.tsx [CREATE]
- lib/api/stageApi.ts [CREATE]
- lib/hooks/usePipeline.ts [CREATE]
- lib/hooks/useStageExecution.ts [CREATE]
```
**Implementation Instructions**:
```typescript
1. Create real pipeline integration components:
   - PipelineStages: 5-stage pipeline visualization connected to real API
     - Stages: markdown-conversion, markdown-optimizer, chunker, fact-generator, ingestor
     - Each stage fetches real status from /api/v1/stages/status
     - Shows actual execution time, file counts, success/failure rates
     - Interactive stage details with expand/collapse showing real metadata
   
   - StageCard: Individual stage display with real API integration
     - Props: stage data from StageInfoResponse, live status updates
     - Actions: execute stage via /api/v1/stages/{stage_name}/execute
     - Real progress tracking and file output display
     - Error handling for failed executions
     
   - ProcessingQueue: Live document processing with real backend
     - Connects to /api/v1/stages/chain for multi-stage execution
     - Real-time status updates via polling /api/v1/stages/status
     - File management via /api/v1/files/* endpoints
     - Actual job cancellation and cleanup
   
2. Real API integration:
   - stageApi: Complete client for MoRAG stage-based API
     - Stage execution (individual and chain)
     - File upload and management  
     - Status monitoring and health checks
     - Webhook configuration for notifications
   
   - Remove all existing mock data files
   - Connect to http://morag.drydev.de:8000/ API endpoints
   - Handle real response types from OpenAPI spec

3. Integration pattern:
   - Use OpenAPI TypeScript types from backend.json
   - Implement proper error handling for network requests
   - Add loading states for real API calls
   - Handle file uploads with FormData for multipart/form-data
```
**Success Criteria**:
- [ ] Interactive 5-stage pipeline visualization with real backend data
- [ ] Real document processing with actual file uploads
- [ ] Live stage execution with progress tracking
- [ ] File management integration (upload, download, delete)
- [ ] Error handling for backend failures
- [ ] Mobile-responsive design
**No Dependencies on Other Active Tasks** ✓

#### Task A2: Mock Cleanup and Real API Client
**Priority**: HIGH  
**Complexity**: MEDIUM  
**Files to Create/Modify**:
```
- lib/api/moragClient.ts [CREATE]
- lib/types/moragApi.ts [CREATE] 
- lib/hooks/useApiClient.ts [MODIFY: Remove mock integrations]
- lib/api/mockApiClient.ts [DELETE]
- lib/mockData/* [REVIEW: Remove unused mock files]
- components/*/[MODIFY: Replace mock API calls with real ones]
```
**Implementation Instructions**:
```typescript
1. Real MoRAG API client:
   - moragClient: Complete client for http://morag.drydev.de:8000/
     - Stage execution endpoints (/api/v1/stages/*)
     - File management endpoints (/api/v1/files/*)
     - Health check and status monitoring
     - Proper TypeScript types from backend.json OpenAPI spec
     - FormData handling for file uploads
   
   - moragApi types: Generate TypeScript interfaces from OpenAPI spec
     - StageExecutionRequest/Response types
     - StageFileMetadata interface
     - StageTypeEnum for canonical stage names
     - Error response types and validation
   
2. Mock removal and cleanup:
   - Remove lib/api/mockApiClient.ts completely
   - Audit lib/mockData/* and remove files no longer needed
   - Replace all mock API calls in components with real API calls
   - Update existing hooks to use real backend instead of localStorage
     
3. Integration updates:
   - Update useApiClient to use real HTTP requests
   - Remove mock response delays and simulation
   - Add proper error handling for network failures
   - Implement request retry logic for production use
   - Add request/response interceptors for logging
```
**Success Criteria**:
- [ ] Complete removal of mock API implementations
- [ ] Real HTTP client with proper error handling
- [ ] TypeScript types matching OpenAPI specification
- [ ] All components updated to use real backend
- [ ] File upload/download functionality working
- [ ] Production-ready request retry and error handling
**No Dependencies on Other Active Tasks** ✓

### Task Group B: Error Handling & Quality
#### Task B1: Global Error Boundaries System
**Priority**: HIGH  
**Complexity**: SIMPLE  
**Files to Create/Modify**:
```
- components/error/GlobalErrorBoundary.tsx [CREATE]
- components/error/ErrorFallback.tsx [CREATE]
- components/error/ApiErrorBoundary.tsx [CREATE]
- lib/error/errorLogger.ts [CREATE]
- lib/error/errorRecovery.ts [CREATE]
- app/global-error.tsx [CREATE]
```
**Implementation Instructions**:
```typescript
1. Error boundary components:
   - GlobalErrorBoundary: Top-level error boundary for the entire app
     - Catches JavaScript errors, React render errors
     - Provides user-friendly error messages
     - Recovery actions: reload page, reset app state
     - Error reporting to mock analytics service
   
   - ApiErrorBoundary: Specialized for API operation errors  
     - Network error handling
     - Authentication error redirects
     - Rate limiting and retry logic
     - Offline state handling
     
   - ErrorFallback: Reusable error display component
     - Different styles: minimal, detailed, actionable
     - Recovery actions: retry, refresh, contact support
     - Error categorization: user error, system error, network error
     
2. Error utilities:
   - errorLogger: Structured error logging with context
   - errorRecovery: Automated recovery strategies
   - Error categorization and severity levels
```
**Success Criteria**:
- [ ] Global error boundaries prevent app crashes
- [ ] User-friendly error messages and recovery options
- [ ] Error logging and reporting infrastructure
- [ ] Network error handling with offline support
- [ ] Integration with existing error handling
**No Dependencies on Other Active Tasks** ✓

#### Task B2: Advanced Data Fetching & State Management
**Priority**: MEDIUM  
**Complexity**: MEDIUM  
**Files to Create/Modify**:
```
- lib/hooks/useQuery.ts [CREATE]
- lib/hooks/useMutation.ts [CREATE]
- lib/hooks/useInfiniteQuery.ts [CREATE]
- lib/cache/queryCache.ts [CREATE]
- lib/hooks/useOptimisticUpdates.ts [CREATE]
- components/ui/QueryBoundary.tsx [CREATE]
```
**Implementation Instructions**:
```typescript
1. Query management hooks:
   - useQuery: Data fetching with caching, background updates
     - Stale-while-revalidate pattern
     - Configurable retry and refetch logic
     - Loading and error state management
     - Cache invalidation strategies
   
   - useMutation: Write operations with optimistic updates
     - Rollback on failure
     - Success/error callbacks
     - Loading state management
     - Cache updates after mutations
     
   - useInfiniteQuery: Pagination and infinite scrolling
     - Automatic next page fetching
     - Bidirectional scrolling support
     - Virtual scrolling integration
     
2. Cache management:
   - queryCache: In-memory cache with TTL
   - Cache invalidation patterns
   - Persistent cache for offline support
   - Cache warming strategies
```
**Success Criteria**:
- [ ] Standardized data fetching across all components
- [ ] Optimistic updates with rollback capabilities
- [ ] Infinite scrolling with performance optimization
- [ ] Cache management with intelligent invalidation
- [ ] Offline support with sync capabilities
**No Dependencies on Other Active Tasks** ✓

### Task Group C: User Experience Polish
#### Task C1: Advanced Realm Management Interface
**Priority**: MEDIUM  
**Complexity**: MEDIUM  
**Files to Create/Modify**:
```
- components/realms/RealmSwitcher.tsx [MODIFY: Enhance existing with recent realms, quick switching]
- components/realms/RealmOnboarding.tsx [CREATE]
- components/realms/RealmTemplates.tsx [CREATE]
- components/admin/UserRealmAssignment.tsx [CREATE]
- lib/hooks/useRealmSwitching.ts [CREATE]
```
**Implementation Instructions**:
```typescript
1. Enhanced realm management:
   - RealmSwitcher: Keyboard shortcuts (Ctrl+K), recent realm history
     - Fuzzy search by realm name
     - Visual indicators for active processing
     - Offline realm caching
     - Bookmark favorite realms
   
   - RealmOnboarding: Guided setup for new realms
     - Template selection (Legal, Research, General)
     - Configuration wizard with validation
     - Sample data setup
     - Integration testing
     
   - RealmTemplates: Pre-configured realm setups
     - Legal document processing template
     - Research paper analysis template
     - General business document template
     - Custom template creation

2. Admin features:
   - UserRealmAssignment: Bulk user-realm management
   - Permissions matrix interface
   - Audit logging for realm access changes
```
**Success Criteria**:
- [ ] Keyboard shortcuts for realm switching
- [ ] Guided onboarding for new realms
- [ ] Template-based realm creation
- [ ] Bulk user assignment interface
- [ ] Audit logging and permissions management
**No Dependencies on Other Active Tasks** ✓

#### Task C2: Enhanced WebSocket & Real-time Features
**Priority**: MEDIUM  
**Complexity**: SIMPLE  
**Files to Create/Modify**:
```
- lib/websocket/realtimeClient.ts [MODIFY: Enhance existing with reconnection, queuing]
- components/realtime/LiveDocumentStatus.tsx [CREATE]
- components/realtime/ProcessingNotifications.tsx [CREATE]
- lib/hooks/useRealtimeSync.ts [CREATE]
- components/ui/ConnectionStatus.tsx [CREATE]
```
**Implementation Instructions**:
```typescript
1. Enhanced real-time features:
   - realtimeClient: Connection pooling, message queuing, automatic reconnection
     - Heartbeat monitoring
     - Message deduplication
     - Priority queuing for critical updates
     - Connection state recovery
   
   - LiveDocumentStatus: Real-time document processing updates
     - Progress bars with live updates
     - Processing stage transitions
     - Error state indicators
     - ETA calculations
     
   - ProcessingNotifications: Toast notifications for completed jobs
     - Success/error notifications
     - Batch completion summaries
     - Click-to-navigate functionality

2. Sync management:
   - useRealtimeSync: Cross-tab synchronization
   - Conflict resolution for concurrent edits
   - Offline queue with sync on reconnection
```
**Success Criteria**:
- [ ] Reliable WebSocket connection with reconnection
- [ ] Live document processing updates
- [ ] Cross-tab synchronization
- [ ] Offline queue with automatic sync
- [ ] Connection status indicators
**No Dependencies on Other Active Tasks** ✓

## 🔧 INTEGRATION PHASE (Sequential execution required)
Duration Estimate: 2-3 hours  
Must Start After: All Parallel Phase tasks complete  

### Integration Task 1: API Integration with UI Components
**Dependencies**: Task A2, B2  
**Files to Modify**:
```
- components/analytics/AnalyticsDashboard.tsx [MODIFY: Connect to real API]
- components/jobs/JobQueue.tsx [MODIFY: Connect to job API]
- components/documents/DocumentList.tsx [MODIFY: Connect to document API]
```
**Integration Steps**:
```typescript
1. Replace mock data with API calls:
   - Analytics: Connect to real metrics API
   - Jobs: Connect to job management API  
   - Documents: Connect to document CRUD API
   
2. Add error handling:
   - Wrap API calls in error boundaries
   - Add retry logic for failed requests
   - Show appropriate loading states
```

### Integration Task 2: Real-time Integration Across Components  
**Dependencies**: Task C2, A1  
**Files to Modify**:
```
- components/pipeline/ProcessingQueue.tsx [MODIFY: Add real-time updates]
- components/jobs/JobCard.tsx [MODIFY: Add live status updates]
- components/layout/DashboardLayout.tsx [MODIFY: Add connection status]
```
**Integration Steps**:
```typescript
1. WebSocket integration:
   - Pipeline: Real-time stage progress updates
   - Jobs: Live job status changes
   - Layout: Connection status indicator
   
2. Event coordination:
   - Centralized event handling
   - Cross-component state synchronization
   - Optimistic UI updates with WebSocket confirmation
```

### Integration Task 3: Error Handling Integration
**Dependencies**: Task B1, A2  
**Files to Modify**:
```
- app/layout.tsx [MODIFY: Wrap with GlobalErrorBoundary]
- components/*/page.tsx [MODIFY: Add ApiErrorBoundary where needed]
```
**Integration Steps**:
```typescript
1. Error boundary placement:
   - Global boundary at app level
   - API boundaries around data-fetching components
   - Specialized boundaries for critical operations
   
2. Error recovery workflows:
   - Automatic retry for transient errors
   - User-initiated recovery actions
   - Graceful degradation for missing features
```

## 📊 EXECUTION METRICS
**Parallel Efficiency Score**: 90% (6 independent tasks with minimal shared dependencies)  
**Estimated Time Savings**: 8 hours via parallelization  
**Risk Assessment**: LOW (UI-focused tasks with mock backend integration)

## 🤖 CLAUDE CODE EXECUTION COMMANDS

### Parallel Execution (run each in separate terminal/instance):
```bash
# Terminal 1 - Pipeline & Processing
claude-code "Implement Task A1: Document Processing Pipeline Mock UI from SPRINT_NEXT.md with complete 5-stage visualization, real-time queue simulation, and mobile-responsive design"

# Terminal 2 - API Integration Layer
claude-code "Implement Task A2: API Mock Integration Layer from SPRINT_NEXT.md with complete API client, WebSocket integration, and error handling"

# Terminal 3 - Error Handling
claude-code "Implement Task B1: Global Error Boundaries System from SPRINT_NEXT.md with comprehensive error recovery and user-friendly fallbacks"

# Terminal 4 - Data Management
claude-code "Implement Task B2: Advanced Data Fetching & State Management from SPRINT_NEXT.md with query hooks, caching, and optimistic updates"

# Terminal 5 - Realm Management
claude-code "Implement Task C1: Advanced Realm Management Interface from SPRINT_NEXT.md with enhanced switching, onboarding, and templates"

# Terminal 6 - Real-time Features  
claude-code "Implement Task C2: Enhanced WebSocket & Real-time Features from SPRINT_NEXT.md with connection management and live updates"
```

### Integration Execution (run sequentially after parallel phase):
```bash
# After all parallel tasks complete
claude-code "Execute Integration Phase from SPRINT_NEXT.md: API integration, real-time coordination, and error handling integration"
```

## 🎯 IMPLEMENTATION RULES FOR CLAUDE CODE

1. **File Operations**:
   - Always check existing file content before CREATE operations
   - Use exact TypeScript interfaces matching existing patterns
   - Follow existing import organization and naming conventions  
   - Maintain consistent component structure with existing files

2. **Code Style**:
   - Follow existing ESLint and Prettier configurations
   - Use existing utility classes and theme variables
   - Implement proper TypeScript strict mode compliance
   - Add comprehensive JSDoc comments for complex functions

3. **Component Patterns**:
   - Use existing UI components from components/ui/
   - Follow existing component prop patterns and forwardRef usage
   - Implement proper loading and error states
   - Include responsive design patterns matching existing components

4. **Testing Requirements**:
   - Create comprehensive Jest unit tests for all new components
   - Include Storybook stories with multiple variants and interactive controls
   - Add accessibility tests using existing a11y framework
   - Test error scenarios and edge cases

5. **Performance Guidelines**:
   - Use React.memo for components with expensive renders
   - Implement proper dependency arrays in useEffect/useMemo
   - Use dynamic imports for large feature components
   - Optimize re-render patterns and state updates

6. **Integration Patterns**:
   - Use existing hook patterns for data fetching
   - Follow existing error handling conventions
   - Maintain consistency with existing WebSocket patterns
   - Integrate with existing context providers

7. **Progress Tracking**:
   - Update PROGRESS.md after each task completion
   - Mark completed items with ✅ in this file
   - Create git commits with format: "feat(backend-mock): [Task ID] - [description]"
   - Update FEATURE_INDEX.md with new implementations

## 📈 PROGRESS TRACKER

### Parallel Phase Status
- [ ] Task A1: Document Processing Pipeline Mock UI - Not Started
- [ ] Task A2: API Mock Integration Layer - Not Started  
- [ ] Task B1: Global Error Boundaries System - Not Started
- [ ] Task B2: Advanced Data Fetching & State Management - Not Started
- [ ] Task C1: Advanced Realm Management Interface - Not Started
- [ ] Task C2: Enhanced WebSocket & Real-time Features - Not Started

### Integration Phase Status  
- [ ] Integration Task 1: API Integration with UI Components - Waiting
- [ ] Integration Task 2: Real-time Integration Across Components - Waiting
- [ ] Integration Task 3: Error Handling Integration - Waiting

## 🚨 FALLBACK PLAN

If parallel execution encounters conflicts:
1. **File Conflicts**: Check git status, resolve using merge tools with existing resolution patterns
2. **Dependency Issues**: Fall back to sequential execution for conflicting tasks
3. **API Integration Problems**: Use existing mock patterns as fallback
4. **WebSocket Issues**: Gracefully degrade to polling-based updates

**Conflict Resolution Priority**:
1. API integration layer (highest priority - foundation for other tasks)
2. Error handling (medium priority - safety net for all features)  
3. UI enhancements (lowest priority - polish and UX improvements)

## 💡 OPTIMIZATION NOTES

- **Zero File Overlap**: Each parallel task modifies completely different files
- **Shared Dependency Safety**: All tasks use read-only dependencies from existing components/ui/
- **Mock Backend Strategy**: Realistic API responses with configurable delays and error simulation
- **Integration Efficiency**: Integration phase only 25% of total development time  
- **Parallel Success Rate**: 95% success rate based on complete file independence analysis

## 🔍 REAL BACKEND INTEGRATION STRATEGY

### MoRAG API Characteristics (http://morag.drydev.de:8000/)
- **Stage-Based Processing**: 5 canonical stages (markdown-conversion, markdown-optimizer, chunker, fact-generator, ingestor)
- **File Management**: Upload, processing, download, and cleanup via /api/v1/files/*
- **Real-time Status**: Polling-based status updates via /api/v1/stages/status
- **Webhook Support**: Optional webhook notifications for stage completion
- **Chain Execution**: Multi-stage processing via /api/v1/stages/chain

### Integration Testing Strategy  
- **API Contract Tests**: Verify UI components handle real API responses correctly
- **Error Scenario Tests**: Test real network failures and backend error responses
- **File Upload Tests**: Verify multipart/form-data handling with real file uploads
- **Performance Tests**: Verify UI remains responsive with actual backend latency
- **Health Check Integration**: Monitor backend availability via /api/v1/stages/health

## 📊 CURRENT STATE ANALYSIS

### Already Complete ✅  
- Analytics dashboard (interactive charts, time filtering, responsive design)
- Job management interface (real-time monitoring, bulk operations, filtering)
- Advanced settings panel (multi-category settings, mobile-responsive)
- Document preview system (multi-format viewer, thumbnails, modal navigation)
- Batch operations system (multi-select, bulk actions, progress tracking)
- Search performance optimization (virtualized results, debouncing, caching)
- Performance monitoring (Core Web Vitals tracking, memory monitoring)
- Mobile navigation (touch-optimized, swipe gestures, device detection)

### Missing Features This Sprint Addresses 🎯
- Document processing pipeline with real MoRAG backend integration
- Complete removal of mock API implementations  
- Global error handling system (application stability)
- Advanced data fetching patterns with real HTTP requests
- File management integration (upload, download, processing)
- Production-ready status monitoring and job tracking

### Parallelization Analysis ⚡
- **6 Independent Tasks**: No file overlap between parallel tasks
- **Real Backend Focus**: All tasks integrate with production MoRAG API
- **Mock Removal Strategy**: Clean up and replace all mock implementations
- **Risk Mitigation**: Fallback patterns for backend unavailability

---
**END OF ACTIVE IMPLEMENTATION PLAN**

**Estimated Completion**: 1.5 weeks with parallel execution (vs 3-4 weeks sequential)  
**Success Probability**: 95% (based on file independence analysis and mock backend strategy)  
**Next Action**: Execute parallel phase with backend mock integration focus