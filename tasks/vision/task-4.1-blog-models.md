# Task 3.1: Blog Data Models

**Phase**: 3 - Blog Authoring System
**Status**: ❌ Not Started
**Priority**: Medium
**Estimated Effort**: 2-3 days

## Overview

Design and implement the core data models for the blog authoring system, including blog ideas, articles, drafts, and the approval workflow. This forms the foundation for the automated blog creation functionality described in the vision.

## Current State Analysis

### Existing Implementation
- No blog-related data models exist
- No content creation or publishing workflow
- No idea management system
- No article drafting capabilities

### Gap Analysis
- ❌ No blog data models
- ❌ No idea management system
- ❌ No article drafting workflow
- ❌ No approval process
- ❌ No publication management

## Requirements

### Functional Requirements
1. **Idea Management**: Store and manage blog ideas with approval workflow
2. **Article Drafting**: Create and manage article drafts
3. **Approval Workflow**: Multi-stage approval process for ideas and articles
4. **Publication Management**: Track publication status and metadata
5. **Content Versioning**: Version control for article drafts
6. **Source Tracking**: Link articles back to source databases and documents
7. **Metadata Management**: Rich metadata for SEO and organization

### Technical Requirements
1. **Database Schema**: Comprehensive blog data models
2. **Relationships**: Proper relationships between ideas, articles, and source data
3. **State Management**: Clear state transitions for workflow
4. **Audit Trail**: Track changes and approvals
5. **Performance**: Efficient queries for blog management
6. **Extensibility**: Flexible schema for future enhancements

## Data Model Design

### Core Models Overview
```typescript
interface BlogIdea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  priority: Priority;
  sourceData: SourceReference[];
  generatedBy: 'user' | 'auto';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  tags: string[];
  estimatedReadTime?: number;
  targetAudience?: string;
  seoKeywords?: string[];
}

interface BlogArticle {
  id: string;
  ideaId: string;
  title: string;
  slug: string;
  content: string;
  status: ArticleStatus;
  version: number;
  publishedAt?: Date;
  scheduledFor?: Date;
  metadata: ArticleMetadata;
  sourceReferences: SourceReference[];
}

interface BlogDraft {
  id: string;
  articleId: string;
  version: number;
  content: string;
  title: string;
  summary?: string;
  status: DraftStatus;
  createdBy: string;
  lastEditedBy: string;
  changeLog: string;
}
```

## Database Schema

### Prisma Schema Implementation
```prisma
model BlogIdea {
  id                String      @id @default(uuid())
  title             String
  description       String
  status            IdeaStatus  @default(PENDING)
  priority          Priority    @default(MEDIUM)
  generatedBy       GenerationSource @default(USER)
  targetAudience    String?
  estimatedReadTime Int?        // in minutes
  seoKeywords       String[]    // Array of SEO keywords
  tags              String[]    // Array of tags
  rejectedReason    String?
  approvedAt        DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Foreign keys
  userId            String
  realmId           String
  approvedById      String?
  
  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm             Realm       @relation(fields: [realmId], references: [id], onDelete: Cascade)
  approvedBy        User?       @relation("IdeaApprover", fields: [approvedById], references: [id])
  articles          BlogArticle[]
  sourceReferences  IdeaSourceReference[]
  
  @@map("blog_ideas")
}

model BlogArticle {
  id              String        @id @default(uuid())
  title           String
  slug            String        @unique
  summary         String?
  content         String        @db.LongText
  status          ArticleStatus @default(DRAFT)
  version         Int           @default(1)
  readTime        Int?          // Calculated read time in minutes
  wordCount       Int?          // Word count
  seoTitle        String?
  seoDescription  String?
  featuredImage   String?       // URL to featured image
  publishedAt     DateTime?
  scheduledFor    DateTime?
  lastEditedAt    DateTime      @default(now())
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Foreign keys
  ideaId          String
  userId          String
  realmId         String
  lastEditedById  String
  
  // Relations
  idea            BlogIdea      @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm           Realm         @relation(fields: [realmId], references: [id], onDelete: Cascade)
  lastEditedBy    User          @relation("ArticleEditor", fields: [lastEditedById], references: [id])
  drafts          BlogDraft[]
  sourceReferences ArticleSourceReference[]
  tags            ArticleTag[]
  
  @@map("blog_articles")
}

model BlogDraft {
  id              String      @id @default(uuid())
  version         Int
  title           String
  content         String      @db.LongText
  summary         String?
  status          DraftStatus @default(EDITING)
  changeLog       String?     // Description of changes in this version
  autoSaved       Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Foreign keys
  articleId       String
  createdById     String
  lastEditedById  String
  
  // Relations
  article         BlogArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  createdBy       User        @relation("DraftCreator", fields: [createdById], references: [id])
  lastEditedBy    User        @relation("DraftEditor", fields: [lastEditedById], references: [id])
  
  @@unique([articleId, version])
  @@map("blog_drafts")
}

model IdeaSourceReference {
  id           String   @id @default(uuid())
  ideaId       String
  sourceType   SourceType
  sourceId     String   // Database ID, Document ID, etc.
  sourceName   String   // Human readable name
  relevance    Float    @default(1.0) // 0.0 to 1.0
  extractedContent String? @db.Text
  createdAt    DateTime @default(now())
  
  // Relations
  idea         BlogIdea @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  
  @@map("idea_source_references")
}

model ArticleSourceReference {
  id           String      @id @default(uuid())
  articleId    String
  sourceType   SourceType
  sourceId     String
  sourceName   String
  relevance    Float       @default(1.0)
  citationText String?     // How this source is cited in the article
  usedInSection String?    // Which section of the article uses this source
  createdAt    DateTime    @default(now())
  
  // Relations
  article      BlogArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  @@map("article_source_references")
}

model ArticleTag {
  id        String   @id @default(uuid())
  articleId String
  tag       String
  createdAt DateTime @default(now())
  
  // Relations
  article   BlogArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  @@unique([articleId, tag])
  @@map("article_tags")
}

// Enums
enum IdeaStatus {
  PENDING
  APPROVED
  REJECTED
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum ArticleStatus {
  DRAFT
  REVIEW
  APPROVED
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

enum DraftStatus {
  EDITING
  REVIEW
  APPROVED
  REJECTED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum GenerationSource {
  USER
  AUTO
  HYBRID
}

enum SourceType {
  DATABASE
  DOCUMENT
  REALM
  EXTERNAL_URL
  MANUAL
}
```

## Model Relationships

### Relationship Diagram
```
User (1) -----> (N) BlogIdea
User (1) -----> (N) BlogArticle
User (1) -----> (N) BlogDraft

Realm (1) -----> (N) BlogIdea
Realm (1) -----> (N) BlogArticle

BlogIdea (1) -----> (N) BlogArticle
BlogIdea (1) -----> (N) IdeaSourceReference

BlogArticle (1) -----> (N) BlogDraft
BlogArticle (1) -----> (N) ArticleSourceReference
BlogArticle (1) -----> (N) ArticleTag

Database -----> IdeaSourceReference (via sourceId)
Document -----> IdeaSourceReference (via sourceId)
Database -----> ArticleSourceReference (via sourceId)
Document -----> ArticleSourceReference (via sourceId)
```

## State Transitions

### Idea Workflow
```
PENDING -> APPROVED -> IN_PROGRESS -> COMPLETED
       -> REJECTED
       -> ARCHIVED (from any state)
```

### Article Workflow
```
DRAFT -> REVIEW -> APPROVED -> PUBLISHED
      -> REJECTED -> DRAFT
      -> SCHEDULED -> PUBLISHED
      -> ARCHIVED (from any state)
```

### Draft Workflow
```
EDITING -> REVIEW -> APPROVED -> (becomes article version)
        -> REJECTED -> EDITING
```

## Service Layer Design

### BlogIdeaService
```typescript
export class BlogIdeaService {
  static async createIdea(data: CreateIdeaData): Promise<BlogIdea>
  static async getIdeasByUser(userId: string, realmId?: string): Promise<BlogIdea[]>
  static async getIdeasByStatus(status: IdeaStatus, realmId?: string): Promise<BlogIdea[]>
  static async approveIdea(ideaId: string, approverId: string): Promise<BlogIdea>
  static async rejectIdea(ideaId: string, reason: string): Promise<BlogIdea>
  static async updateIdea(ideaId: string, data: UpdateIdeaData): Promise<BlogIdea>
  static async deleteIdea(ideaId: string): Promise<void>
  static async addSourceReference(ideaId: string, reference: SourceReference): Promise<void>
}
```

### BlogArticleService
```typescript
export class BlogArticleService {
  static async createArticle(ideaId: string, data: CreateArticleData): Promise<BlogArticle>
  static async getArticlesByUser(userId: string, realmId?: string): Promise<BlogArticle[]>
  static async getArticlesByStatus(status: ArticleStatus): Promise<BlogArticle[]>
  static async updateArticle(articleId: string, data: UpdateArticleData): Promise<BlogArticle>
  static async publishArticle(articleId: string): Promise<BlogArticle>
  static async scheduleArticle(articleId: string, publishAt: Date): Promise<BlogArticle>
  static async archiveArticle(articleId: string): Promise<BlogArticle>
  static async generateSlug(title: string): Promise<string>
  static async calculateReadTime(content: string): Promise<number>
}
```

### BlogDraftService
```typescript
export class BlogDraftService {
  static async createDraft(articleId: string, data: CreateDraftData): Promise<BlogDraft>
  static async getDraftsByArticle(articleId: string): Promise<BlogDraft[]>
  static async getLatestDraft(articleId: string): Promise<BlogDraft | null>
  static async updateDraft(draftId: string, data: UpdateDraftData): Promise<BlogDraft>
  static async approveDraft(draftId: string): Promise<BlogDraft>
  static async rejectDraft(draftId: string, reason: string): Promise<BlogDraft>
  static async autoSaveDraft(draftId: string, content: string): Promise<BlogDraft>
}
```

## Validation Rules

### Idea Validation
- Title: Required, 5-200 characters
- Description: Required, 10-1000 characters
- Tags: Maximum 10 tags, each 2-50 characters
- SEO Keywords: Maximum 20 keywords

### Article Validation
- Title: Required, 5-200 characters
- Slug: Required, unique, URL-safe
- Content: Required, minimum 100 characters
- SEO Title: Maximum 60 characters
- SEO Description: Maximum 160 characters

### Draft Validation
- Content: Required
- Change Log: Required for version > 1
- Version: Must be sequential

## Migration Strategy

### Phase 1: Core Models
1. Create blog-related tables
2. Add foreign key relationships
3. Create indexes for performance

### Phase 2: Service Layer
1. Implement CRUD services
2. Add validation logic
3. Create state transition methods

### Phase 3: Integration
1. Connect with existing user/realm system
2. Add source reference tracking
3. Implement audit trails

## Testing Requirements

### Unit Tests
- Model validation
- Service CRUD operations
- State transition logic
- Relationship integrity

### Integration Tests
- Cross-model operations
- Source reference tracking
- Workflow state management

## Acceptance Criteria

- [ ] All blog data models are implemented
- [ ] Proper relationships between models exist
- [ ] State transitions work correctly
- [ ] Service layer provides full CRUD functionality
- [ ] Validation rules are enforced
- [ ] Source tracking is functional
- [ ] Performance is acceptable
- [ ] All tests pass

## Dependencies

- User and Realm models (existing)
- Database and Document models (existing)
- Authentication system (existing)

## Success Metrics

- Models support all required blog functionality
- Database queries perform efficiently
- State transitions are reliable
- Source tracking provides useful links
- Validation prevents data corruption
