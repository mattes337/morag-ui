# Task 1.1: Realm Domain Configuration

**Phase**: 1 - Realm Domain Configuration
**Status**: ❌ Not Started
**Priority**: High
**Estimated Effort**: 2-3 days

## Overview

Configure realm domains to specialize all database content processing towards that domain. The current realm-level prompt system is already correctly implemented - this task focuses on adding domain classification and domain-specific content processing to realms.

## Current State Analysis

### Existing Implementation
- Prompts are correctly stored in the `Realm` model:
  ```prisma
  model Realm {
    ingestionPrompt String?  // ✅ Correctly implemented for document ingestion
    systemPrompt    String?  // ✅ Correctly implemented for user queries
    // ...
  }
  ```
- Realm-level prompts work correctly for domain specialization
- All databases within a realm inherit the realm's domain focus

### Gap Analysis
- ❌ No domain classification for realms
- ❌ No domain-specific content filtering
- ❌ No domain-based processing rules
- ❌ No domain templates for realm configuration

## Requirements

### Functional Requirements
1. **Realm Domain Classification**: Assign domains to realms for specialized processing
2. **Domain-Specific Processing**: All databases in a realm process content according to the realm's domain
3. **Domain Templates**: Provide predefined domain configurations for common use cases
4. **Content Filtering**: Filter and prioritize content based on realm domain relevance
5. **Domain-Aware Prompts**: Enhance existing realm prompts with domain-specific context

### Technical Requirements
1. **Realm Schema**: Extend Realm model with domain classification
2. **API Updates**: Update realm creation/update endpoints for domain configuration
3. **Service Layer**: Implement domain-specific content processing
4. **Frontend**: Update realm configuration UI with domain selection
5. **Content Processing**: Enhance document processing with domain awareness

## Implementation Plan

### Step 1: Database Schema Updates
```prisma
model Database {
  id                String   @id @default(uuid())
  name              String
  description       String?
  domain            String?  // New: Domain classification
  ingestionPrompt   String?  // New: Database-specific ingestion prompt
  systemPrompt      String?  // New: Database-specific system prompt
  extractionPrompt  String?  // New: Entity extraction prompt
  domainPrompt      String?  // New: Domain context prompt
  // ... existing fields
}
```

### Step 2: Service Layer Updates
- Update `DatabaseService` to handle prompt configuration
- Implement prompt fallback logic (database → realm → default)
- Add prompt validation functions
- Create prompt template system

### Step 3: API Endpoint Updates
- Update `POST /api/databases` to accept prompt configuration
- Update `PUT /api/databases/[id]` to modify prompts
- Add `GET /api/databases/[id]/prompts` for prompt management
- Add `GET /api/prompt-templates` for available templates

### Step 4: Frontend Components
- Update `CreateDatabaseDialog` with prompt configuration
- Create `DatabasePromptEditor` component
- Add prompt template selector
- Update database detail view with prompt management

### Step 5: Migration Strategy
- Create migration script to move realm prompts to databases
- Ensure backward compatibility during transition
- Update existing databases with realm-level prompts

## Database Schema Changes

### New Fields in Database Model
```typescript
interface DatabasePromptConfig {
  domain?: string;
  ingestionPrompt?: string;
  systemPrompt?: string;
  extractionPrompt?: string;
  domainPrompt?: string;
}
```

### Prompt Template System
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  domain: string;
  description: string;
  ingestionPrompt: string;
  systemPrompt: string;
  extractionPrompt: string;
  domainPrompt: string;
}
```

## API Specifications

### Update Database Creation
```typescript
POST /api/databases
{
  name: string;
  description?: string;
  domain?: string;
  prompts?: {
    ingestionPrompt?: string;
    systemPrompt?: string;
    extractionPrompt?: string;
    domainPrompt?: string;
  };
  serverIds: string[];
}
```

### Prompt Management Endpoints
```typescript
GET /api/databases/[id]/prompts
PUT /api/databases/[id]/prompts
GET /api/prompt-templates
GET /api/prompt-templates/[domain]
```

## Frontend Components

### DatabasePromptEditor Component
```typescript
interface DatabasePromptEditorProps {
  database: Database;
  onSave: (prompts: DatabasePromptConfig) => void;
  onCancel: () => void;
}
```

### PromptTemplateSelector Component
```typescript
interface PromptTemplateSelectorProps {
  domain?: string;
  onSelect: (template: PromptTemplate) => void;
}
```

## Testing Requirements

### Unit Tests
- Database service prompt handling
- Prompt fallback logic
- Prompt validation functions
- Template system functionality

### Integration Tests
- Database creation with prompts
- Prompt update operations
- Fallback mechanism testing
- Migration script validation

### E2E Tests
- Database configuration workflow
- Prompt editing interface
- Template selection process

## Migration Strategy

### Phase 1: Schema Migration
1. Add new prompt fields to Database model
2. Run Prisma migration
3. Update TypeScript types

### Phase 2: Data Migration
1. Create migration script to copy realm prompts to databases
2. Set database prompts from parent realm
3. Validate data integrity

### Phase 3: Code Updates
1. Update service layer to use database prompts
2. Implement fallback logic
3. Update API endpoints

### Phase 4: Frontend Updates
1. Update database creation/edit forms
2. Add prompt management interface
3. Implement template system

## Acceptance Criteria

- [ ] Database model includes all required prompt fields
- [ ] Database creation API accepts prompt configuration
- [ ] Database update API allows prompt modification
- [ ] Prompt fallback logic works correctly (database → realm → default)
- [ ] Frontend provides intuitive prompt configuration interface
- [ ] Prompt templates are available for common domains
- [ ] Migration script successfully moves existing prompts
- [ ] All tests pass
- [ ] Documentation is updated

## Dependencies

- Prisma schema migration
- Database service updates
- API endpoint modifications
- Frontend component development

## Risks & Mitigation

### Risk: Data Loss During Migration
**Mitigation**: Comprehensive backup and rollback strategy

### Risk: Breaking Changes to Existing API
**Mitigation**: Maintain backward compatibility, gradual migration

### Risk: Complex Fallback Logic
**Mitigation**: Thorough testing of all fallback scenarios

## Success Metrics

- All databases can be configured with custom prompts
- Prompt fallback mechanism works reliably
- Migration completes without data loss
- User interface is intuitive and functional
- Performance impact is minimal
