# Task 6: Legacy Code Removal and Cleanup

## Overview
Remove obsolete, deprecated, and superseded code after implementing the new staged processing system. This task ensures a clean codebase without backwards compatibility code or unused legacy components.

## Legacy Components to Remove

### Document Processing (Legacy)

#### Services to Remove
```typescript
// Remove these legacy services
- LegacyDocumentProcessingService
- OldIngestionService
- DeprecatedFileUploadService
- SingleStepProcessingService
```

#### API Endpoints to Remove
```typescript
// Legacy endpoints to be removed
- /api/documents/process (replaced by staged processing)
- /api/documents/ingest (replaced by /api/v1/stages/ingestor/execute)
- /api/documents/upload-and-process (replaced by staged workflow)
- /api/processing/status (replaced by workflow status)
```

#### Components to Remove
```typescript
// UI components to remove
- ProcessDocumentButton (replaced by StageControlPanel)
- LegacyProcessingStatus (replaced by StageProgressIndicator)
- OldFileUploader (replaced by enhanced file upload with staging)
- DeprecatedProgressBar (replaced by StageProgressIndicator)
```

### File Management (Legacy)

#### File Services to Remove
```typescript
// Legacy file handling
- OldFileService.uploadAndProcess()
- LegacyFileManager.processFile()
- DeprecatedFileValidator.validateForProcessing()
```

#### File Storage Patterns to Remove
```typescript
// Remove old file storage patterns
- Single-file processing results
- Non-staged file metadata
- Legacy file naming conventions
- Old file association patterns
```

### State Management (Legacy)

#### Stores to Remove
```typescript
// Legacy state management
- useOldProcessingStore
- useLegacyDocumentStore
- useDeprecatedFileStore
- processingReducer (old version)
```

#### State Patterns to Remove
```typescript
// Remove legacy state patterns
- Single processing status per document
- Non-workflow-based processing state
- Legacy error handling patterns
- Old progress tracking mechanisms
```

## Database Cleanup

### Tables to Remove/Modify
```sql
-- Remove legacy tables
DROP TABLE IF EXISTS legacy_processing_jobs;
DROP TABLE IF EXISTS old_file_uploads;
DROP TABLE IF EXISTS deprecated_processing_status;

-- Remove legacy columns from existing tables
ALTER TABLE documents DROP COLUMN IF EXISTS old_processing_status;
ALTER TABLE documents DROP COLUMN IF EXISTS legacy_file_path;
ALTER TABLE documents DROP COLUMN IF EXISTS deprecated_metadata;
```

### Data Migration Cleanup
```sql
-- Clean up migration artifacts
DROP TABLE IF EXISTS migration_temp_*;
DROP FUNCTION IF EXISTS legacy_processing_function();
DROP TRIGGER IF EXISTS legacy_processing_trigger;
```

## Configuration Cleanup

### Environment Variables to Remove
```bash
# Remove legacy configuration
LEGACY_PROCESSING_ENDPOINT=
OLD_FILE_STORAGE_PATH=
DEPRECATED_API_KEY=
LEGACY_DATABASE_URL=
```

### Config Files to Update
```typescript
// Remove from config files
- legacyProcessing: { ... }
- oldFileHandling: { ... }
- deprecatedFeatures: { ... }
```

## Code Cleanup Strategy

### Phase 1: Identify Legacy Code
```bash
# Search for legacy patterns
grep -r "legacy\|deprecated\|old\|temp" src/
grep -r "TODO.*remove" src/
grep -r "FIXME.*legacy" src/
```

### Phase 2: Remove Dead Code
```typescript
// Remove unused imports
// Remove commented-out legacy code
// Remove unused utility functions
// Remove deprecated type definitions
```

### Phase 3: Update Documentation
- Remove references to legacy endpoints in API docs
- Update component documentation
- Remove legacy examples from README files
- Update migration guides

## Specific Files to Remove

### Services
```
src/services/legacy-document-processing.ts
src/services/old-ingestion.service.ts
src/services/deprecated-file-upload.ts
src/utils/legacy-helpers.ts
```

### Components
```
src/components/legacy-processing/
src/components/old-file-upload/
src/components/deprecated-progress/
src/components/temp-migration/
```

### Types and Interfaces
```typescript
// Remove legacy type definitions
interface LegacyProcessingRequest { ... }
interface OldFileUploadResponse { ... }
interface DeprecatedDocumentStatus { ... }
type LegacyProcessingState = { ... }
```

### Test Files
```
__tests__/legacy-processing.test.ts
__tests__/old-file-upload.test.ts
__tests__/deprecated-components.test.ts
```

## Migration Cleanup

### Remove Migration Scripts
```
scripts/migrate-to-staged-processing.ts
scripts/legacy-data-cleanup.sql
scripts/temp-migration-helpers.ts
```

### Remove Migration Components
```typescript
// Remove temporary migration UI
- MigrationProgressDialog
- LegacyDataCleanupPanel
- TempMigrationStatus
```

## Testing Cleanup

### Remove Legacy Tests
```typescript
// Remove tests for removed functionality
describe('Legacy Document Processing', () => { ... }); // REMOVE
describe('Old File Upload', () => { ... }); // REMOVE
describe('Deprecated Components', () => { ... }); // REMOVE
```

### Update Test Utilities
```typescript
// Remove legacy test helpers
- createLegacyDocument()
- mockOldProcessingService()
- setupDeprecatedState()
```

## Implementation Tasks

### Phase 1: Code Analysis and Planning (High Priority)
- [ ] Audit codebase for legacy code patterns
- [ ] Create comprehensive list of files/functions to remove
- [ ] Identify dependencies and potential breaking changes
- [ ] Plan removal order to avoid breaking dependencies

### Phase 2: Service Layer Cleanup (High Priority)
- [ ] Remove legacy document processing services
- [ ] Remove old file upload and management services
- [ ] Remove deprecated API endpoint handlers
- [ ] Update service registrations and dependency injection

### Phase 3: Component Cleanup (Medium Priority)
- [ ] Remove legacy UI components
- [ ] Remove old processing status components
- [ ] Remove deprecated file upload components
- [ ] Update component exports and imports

### Phase 4: State Management Cleanup (Medium Priority)
- [ ] Remove legacy stores and reducers
- [ ] Remove old state management patterns
- [ ] Update state type definitions
- [ ] Remove deprecated hooks and utilities

### Phase 5: Database and Configuration Cleanup (Low Priority)
- [ ] Remove legacy database tables and columns
- [ ] Clean up migration artifacts
- [ ] Remove deprecated configuration options
- [ ] Update environment variable documentation

### Phase 6: Documentation and Testing Cleanup (Low Priority)
- [ ] Remove legacy test files and test cases
- [ ] Update API documentation
- [ ] Remove legacy examples and guides
- [ ] Update component documentation

## Validation Checklist

### Code Quality
- [ ] No unused imports remain
- [ ] No commented-out legacy code
- [ ] No TODO/FIXME comments about legacy code
- [ ] No deprecated function calls
- [ ] No legacy type definitions

### Functionality
- [ ] All new staged processing features work correctly
- [ ] No broken imports or missing dependencies
- [ ] All tests pass after cleanup
- [ ] No runtime errors from removed code

### Performance
- [ ] Bundle size reduced after removing legacy code
- [ ] No memory leaks from unreferenced objects
- [ ] Faster build times without legacy code
- [ ] Improved application startup time

## Risk Mitigation

### Backup Strategy
- Create git branch before major cleanup
- Tag current version before removal
- Document removed functionality for reference
- Keep removal commits atomic and well-documented

### Testing Strategy
- Run full test suite before and after each cleanup phase
- Test all critical user workflows
- Verify no regression in existing functionality
- Test error scenarios and edge cases

### Rollback Plan
- Maintain ability to revert cleanup commits
- Keep documentation of removed functionality
- Plan for potential hotfixes if issues arise
- Monitor application after cleanup deployment

## Success Criteria

### Code Quality Metrics
- [ ] 0 references to legacy processing patterns
- [ ] 0 unused imports or dead code
- [ ] 0 deprecated function calls
- [ ] Reduced bundle size by at least 10%

### Functionality Metrics
- [ ] All staged processing features operational
- [ ] 100% test coverage maintained
- [ ] No runtime errors in production
- [ ] All user workflows function correctly

### Maintenance Metrics
- [ ] Reduced codebase complexity
- [ ] Improved code maintainability scores
- [ ] Faster development iteration cycles
- [ ] Cleaner architecture and dependencies

## Dependencies

### Internal Dependencies
- All previous tasks (1-5) must be completed and tested
- New staged processing system fully operational
- Database migration completed successfully
- UI components working correctly

### External Dependencies
- Backend legacy endpoints can be safely removed
- No external systems depend on legacy API endpoints
- All users migrated to new processing workflow

## Timeline

### Week 1: Analysis and Planning
- Complete code audit
- Create detailed removal plan
- Set up backup and rollback procedures

### Week 2-3: Core Cleanup
- Remove legacy services and components
- Update state management
- Clean up database and configuration

### Week 4: Testing and Validation
- Comprehensive testing of cleaned codebase
- Performance validation
- Documentation updates

## Notes

- **No Backwards Compatibility**: As per requirements, do not create any backwards compatibility code
- **Complete Removal**: Remove all traces of legacy functionality
- **Documentation**: Update all documentation to reflect new architecture
- **Monitoring**: Monitor application closely after cleanup deployment
- **Team Communication**: Ensure all team members are aware of removed functionality