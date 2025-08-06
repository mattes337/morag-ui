# Task 1.1: Realm Domain Configuration

**Phase**: 1 - Realm Domain Configuration
**Status**: ❌ Not Started
**Priority**: High
**Estimated Effort**: 2-3 days

## Overview

Configure realm domains to specialize all database content processing towards that domain. Prompts should be configured at the Realm level (not Database level) to ensure consistent domain specialization across all databases within a realm. This task focuses on adding domain classification and domain-specific content processing to realms.

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

### Step 1: Realm Schema Updates
```prisma
model Realm {
  id                String   @id @default(uuid())
  name              String
  description       String?
  domain            String?  // New: Domain classification
  ingestionPrompt   String?  // ✅ Already implemented for document ingestion
  systemPrompt      String?  // ✅ Already implemented for user queries
  extractionPrompt  String?  // New: Entity extraction prompt
  domainPrompt      String?  // New: Domain context prompt
  // ... existing fields
}
```

### Step 2: Service Layer Updates
- Update `RealmService` to handle enhanced prompt configuration
- Implement domain-specific prompt templates
- Add prompt validation functions
- Create domain template system

### Step 3: API Endpoint Updates
- Update `POST /api/realms` to accept domain and prompt configuration
- Update `PUT /api/realms/[id]` to modify domain and prompts
- Add `GET /api/realms/[id]/prompts` for prompt management
- Add `GET /api/domain-templates` for available domain templates

### Step 4: Frontend Components
- Update `CreateRealmDialog` with domain and prompt configuration
- Create `RealmPromptEditor` component
- Add domain template selector
- Update realm detail view with prompt management

### Step 5: Migration Strategy
- Enhance existing realm prompt system with domain configuration
- Add domain templates for common use cases
- Update realm configuration UI

## Realm Schema Changes

### Enhanced Fields in Realm Model
```typescript
interface RealmPromptConfig {
  domain?: string;
  ingestionPrompt?: string;  // ✅ Already exists
  systemPrompt?: string;     // ✅ Already exists
  extractionPrompt?: string; // New: Entity extraction prompt
  domainPrompt?: string;     // New: Domain context prompt
}
```

### Domain Template System
```typescript
interface DomainTemplate {
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

### Update Realm Creation
```typescript
POST /api/realms
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
}
```

### Realm Prompt Management Endpoints
```typescript
GET /api/realms/[id]/prompts
PUT /api/realms/[id]/prompts
GET /api/domain-templates
GET /api/domain-templates/[domain]
```

## Frontend Components

### RealmPromptEditor Component
```typescript
interface RealmPromptEditorProps {
  realm: Realm;
  onSave: (prompts: RealmPromptConfig) => void;
  onCancel: () => void;
}
```

### DomainTemplateSelector Component
```typescript
interface DomainTemplateSelectorProps {
  domain?: string;
  onSelect: (template: DomainTemplate) => void;
}
```

## Testing Requirements

### Unit Tests
- Realm service prompt handling
- Domain template system
- Prompt validation functions
- Domain configuration functionality

### Integration Tests
- Realm creation with domain and prompts
- Prompt update operations
- Domain template application
- Realm configuration validation

### E2E Tests
- Realm configuration workflow
- Prompt editing interface
- Domain template selection process

## Migration Strategy

### Phase 1: Schema Enhancement
1. Add new domain and prompt fields to Realm model
2. Run Prisma migration
3. Update TypeScript types

### Phase 2: Domain Template System
1. Create domain template system
2. Add predefined domain templates
3. Validate template functionality

### Phase 3: Service Layer Updates
1. Enhance realm service with domain configuration
2. Implement domain template application
3. Update API endpoints

### Phase 4: Frontend Updates
1. Update realm creation/edit forms
2. Add domain configuration interface
3. Implement template selection system

## Acceptance Criteria

- [ ] Realm model includes all required domain and prompt fields
- [ ] Realm creation API accepts domain and prompt configuration
- [ ] Realm update API allows domain and prompt modification
- [ ] Domain templates are available for common use cases
- [ ] Frontend provides intuitive domain and prompt configuration interface
- [ ] All databases within a realm inherit realm-level prompts
- [ ] Domain-specific processing works correctly
- [ ] All tests pass
- [ ] Documentation is updated

## Dependencies

- Prisma schema migration
- Realm service updates
- API endpoint modifications
- Frontend component development

## Risks & Mitigation

### Risk: Breaking Changes to Existing Realm API
**Mitigation**: Maintain backward compatibility, additive changes only

### Risk: Complex Domain Template System
**Mitigation**: Start with simple templates, iterate based on feedback

### Risk: User Interface Complexity
**Mitigation**: Progressive disclosure, sensible defaults

## Success Metrics

- All realms can be configured with domain and custom prompts
- Domain templates provide useful starting points
- Realm configuration is intuitive and functional
- All databases within realm inherit domain specialization
- Performance impact is minimal
