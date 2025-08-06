# Task 1.2: Realm Domain Configuration Implementation

**Phase**: 1 - Realm Domain Configuration
**Status**: ❌ Not Started
**Priority**: High
**Estimated Effort**: 3-4 days

## Overview

Implement realm-level domain configuration that specializes all database content processing towards that domain. This enables intelligent content filtering and processing based on the realm's intended purpose, with all databases within the realm inheriting the domain specialization.

## Current State Analysis

### Existing Implementation
- Realms have basic configuration (name, description, prompts)
- Realm-level ingestion and system prompts are correctly implemented
- All databases within a realm share the realm's configuration
- No domain classification or domain-specific processing

### Gap Analysis
- ❌ No domain classification system for realms
- ❌ No domain-specific content filtering
- ❌ No domain-based processing rules
- ❌ No domain templates for realm configuration

## Requirements

### Functional Requirements
1. **Realm Domain Classification**: Assign domains to realms for specialized processing
2. **Domain-Specific Processing**: All databases in realm process content according to domain
3. **Content Filtering**: Filter documents and content based on realm domain relevance
4. **Domain Templates**: Pre-configured templates for common realm domains
5. **Enhanced Prompts**: Enhance existing realm prompts with domain-specific context
6. **Domain Analytics**: Track domain-specific content processing metrics

### Technical Requirements
1. **Realm Model Extension**: Add domain field to existing Realm model
2. **Domain Processing**: Enhance content processing with domain awareness
3. **Template System**: Domain template management for realm configuration
4. **API Updates**: Update realm endpoints for domain configuration
5. **UI Components**: Domain selection and configuration interface
6. **Analytics**: Domain-specific processing metrics and insights

## Domain Categories

### Predefined Domains
1. **Legal**: Contracts, legal documents, compliance materials
2. **Medical**: Medical records, research papers, clinical data
3. **Financial**: Financial reports, market analysis, investment data
4. **Technical**: Documentation, code, technical specifications
5. **Academic**: Research papers, educational content, academic materials
6. **Marketing**: Marketing materials, campaigns, customer data
7. **HR**: Employee documents, policies, training materials
8. **General**: Catch-all for mixed content

### Domain Configuration Schema
```typescript
interface DomainConfig {
  id: string;
  name: string;
  description: string;
  category: DomainCategory;
  relevanceRules: RelevanceRule[];
  extractionRules: ExtractionRule[];
  processingRules: ProcessingRule[];
  keywords: string[];
  excludeKeywords: string[];
  contentTypes: string[];
  isCustom: boolean;
  isActive: boolean;
}

interface RelevanceRule {
  type: 'keyword' | 'content_type' | 'metadata' | 'custom';
  condition: string;
  weight: number;
  action: 'include' | 'exclude' | 'boost' | 'demote';
}
```

## Implementation Plan

### Step 1: Database Schema Design
```prisma
model Domain {
  id              String   @id @default(uuid())
  name            String   @unique
  description     String?
  category        DomainCategory
  relevanceRules  Json     // Stored as JSON for flexibility
  extractionRules Json
  processingRules Json
  keywords        String[] // Array of relevant keywords
  excludeKeywords String[] // Array of keywords to exclude
  contentTypes    String[] // Relevant content types
  isCustom        Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  databases       Database[]
  
  @@map("domains")
}

model Database {
  // ... existing fields
  domainId        String?
  domain          Domain?  @relation(fields: [domainId], references: [id])
  customDomainConfig Json? // Override domain config for this database
}

enum DomainCategory {
  LEGAL
  MEDICAL
  FINANCIAL
  TECHNICAL
  ACADEMIC
  MARKETING
  HR
  GENERAL
  CUSTOM
}
```

### Step 2: Domain Service Implementation
```typescript
export class DomainService {
  static async createDomain(data: CreateDomainData): Promise<Domain>
  static async getDomainById(id: string): Promise<Domain | null>
  static async getDomainsByCategory(category: DomainCategory): Promise<Domain[]>
  static async getActiveDomains(): Promise<Domain[]>
  static async updateDomain(id: string, data: UpdateDomainData): Promise<Domain>
  static async deleteDomain(id: string): Promise<void>
  static async evaluateContentRelevance(content: string, domainId: string): Promise<RelevanceScore>
  static async getRecommendedDomain(content: string): Promise<Domain[]>
}
```

### Step 3: Content Filtering Engine
```typescript
export class ContentFilteringEngine {
  static async filterByDomain(content: string, domain: Domain): Promise<FilterResult>
  static async calculateRelevanceScore(content: string, rules: RelevanceRule[]): Promise<number>
  static async extractRelevantSections(content: string, domain: Domain): Promise<string[]>
  static async applyProcessingRules(content: string, rules: ProcessingRule[]): Promise<string>
}
```

### Step 4: API Endpoints
```typescript
// Domain management
GET    /api/domains
POST   /api/domains
GET    /api/domains/[id]
PUT    /api/domains/[id]
DELETE /api/domains/[id]

// Domain categories and templates
GET    /api/domains/categories
GET    /api/domains/templates
GET    /api/domains/templates/[category]

// Content analysis
POST   /api/domains/analyze-content
POST   /api/domains/recommend
```

### Step 5: Frontend Components
- `DomainSelector` - Select domain for database
- `DomainConfigEditor` - Edit domain configuration
- `DomainTemplateSelector` - Choose from predefined templates
- `RelevanceRuleEditor` - Configure relevance rules
- `ContentAnalyzer` - Analyze content for domain fit

## Domain Templates

### Legal Domain Template
```json
{
  "name": "Legal",
  "category": "LEGAL",
  "keywords": ["contract", "agreement", "legal", "clause", "liability", "compliance"],
  "excludeKeywords": ["medical", "technical", "marketing"],
  "contentTypes": ["pdf", "docx", "txt"],
  "relevanceRules": [
    {
      "type": "keyword",
      "condition": "contains legal terminology",
      "weight": 0.8,
      "action": "boost"
    }
  ]
}
```

### Technical Domain Template
```json
{
  "name": "Technical Documentation",
  "category": "TECHNICAL",
  "keywords": ["API", "documentation", "code", "technical", "specification", "architecture"],
  "excludeKeywords": ["legal", "financial", "medical"],
  "contentTypes": ["md", "txt", "pdf", "html"],
  "relevanceRules": [
    {
      "type": "content_type",
      "condition": "markdown or code files",
      "weight": 0.9,
      "action": "include"
    }
  ]
}
```

## Content Relevance Algorithm

### Relevance Scoring
1. **Keyword Matching**: Score based on domain keywords presence
2. **Content Type**: Score based on expected file types
3. **Metadata Analysis**: Score based on document metadata
4. **Custom Rules**: Apply domain-specific custom rules
5. **Exclusion Rules**: Apply negative scoring for excluded content

### Scoring Formula
```typescript
relevanceScore = (
  keywordScore * keywordWeight +
  contentTypeScore * contentTypeWeight +
  metadataScore * metadataWeight +
  customRuleScore * customRuleWeight
) - exclusionPenalty
```

## Frontend Implementation

### Domain Configuration UI
```typescript
interface DomainConfigProps {
  database: Database;
  onSave: (domainConfig: DomainConfig) => void;
}

const DomainConfigEditor: React.FC<DomainConfigProps> = ({ database, onSave }) => {
  // Domain selection
  // Relevance rule configuration
  // Keyword management
  // Content type selection
  // Preview and testing
};
```

### Content Analysis Interface
```typescript
interface ContentAnalysisProps {
  content: string;
  domains: Domain[];
  onDomainRecommendation: (domains: Domain[]) => void;
}
```

## Testing Strategy

### Unit Tests
- Domain service CRUD operations
- Content filtering algorithms
- Relevance scoring functions
- Rule evaluation logic

### Integration Tests
- Database-domain association
- Content filtering pipeline
- API endpoint functionality
- Domain template system

### E2E Tests
- Domain configuration workflow
- Content analysis and recommendation
- Database creation with domain selection

## Migration Strategy

### Phase 1: Schema and Core Services
1. Create Domain model and migrations
2. Implement DomainService
3. Create domain templates

### Phase 2: Content Filtering
1. Implement ContentFilteringEngine
2. Add relevance scoring algorithms
3. Create content analysis tools

### Phase 3: API and Frontend
1. Implement domain management APIs
2. Create frontend components
3. Integrate with database configuration

### Phase 4: Integration and Testing
1. Integrate domain filtering with document processing
2. Add domain-based content recommendations
3. Comprehensive testing and optimization

## Acceptance Criteria

- [ ] Domain model and schema are implemented
- [ ] Predefined domain templates are available
- [ ] Custom domain creation is functional
- [ ] Content relevance filtering works accurately
- [ ] Database-domain association is working
- [ ] Domain configuration UI is intuitive
- [ ] Content analysis provides useful recommendations
- [ ] All tests pass
- [ ] Performance is acceptable for large content volumes

## Dependencies

- Task 1.1 (Database-Level Prompt Configuration) - for domain-specific prompts
- Content processing pipeline
- Document ingestion system
- Vector search functionality

## Risks & Mitigation

### Risk: Complex Relevance Algorithm
**Mitigation**: Start with simple keyword-based matching, iterate and improve

### Risk: Performance Impact on Large Documents
**Mitigation**: Implement efficient text processing and caching

### Risk: Domain Configuration Complexity
**Mitigation**: Provide good defaults and templates, progressive disclosure

## Success Metrics

- Accurate content relevance scoring (>80% accuracy)
- Improved content organization and searchability
- Reduced irrelevant content in domain-specific databases
- User adoption of domain configuration features
- Performance within acceptable limits (<2s for content analysis)
