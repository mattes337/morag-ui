# Architecture Documentation
# MoRAG - Modular Retrieval-Augmented Generation System

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Architecture](#component-architecture)
5. [Data Architecture](#data-architecture)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Integration Architecture](#integration-architecture)
9. [Performance Architecture](#performance-architecture)
10. [Monitoring and Observability](#monitoring-and-observability)

## System Overview

### Architecture Vision
MoRAG is built as a modern, cloud-native application following microservices-ready architecture patterns. The system is designed to be scalable, maintainable, and extensible while providing enterprise-grade reliability and security.

### Technology Stack

#### Frontend
- **Framework**: Next.js 14.2.23 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4.1
- **Component Library**: Radix UI
- **State Management**: React Context API
- **Type Safety**: TypeScript 5
- **Icons**: Lucide React, Heroicons
- **Forms**: Native React with Zod validation

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **ORM**: Prisma 5.7.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs
- **Validation**: Zod

#### Database
- **Primary Database**: MySQL 8.0 / PostgreSQL 14+
- **ORM**: Prisma with migrations
- **Vector Databases**:
  - Qdrant
  - Pinecone
  - Weaviate
  - ChromaDB
- **Graph Database**: Neo4j (optional)

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Message Queue**: Redis/RabbitMQ

## Architecture Principles

### 1. Domain-Driven Design (DDD)
- Clear domain boundaries with realms as aggregate roots
- Ubiquitous language throughout the codebase
- Rich domain models with business logic encapsulation

### 2. Separation of Concerns
- Presentation layer (React components)
- Application layer (Controllers, Services)
- Domain layer (Business logic, Entities)
- Infrastructure layer (Database, External APIs)

### 3. SOLID Principles
- **Single Responsibility**: Each component/service has one reason to change
- **Open/Closed**: Extensible through interfaces, closed for modification
- **Liskov Substitution**: Derived classes substitutable for base classes
- **Interface Segregation**: Specific interfaces rather than general-purpose
- **Dependency Inversion**: Depend on abstractions, not concretions

### 4. Event-Driven Architecture
- Asynchronous processing for long-running tasks
- Event sourcing for audit trails
- CQRS for read/write optimization

### 5. Security by Design
- Zero-trust architecture
- Defense in depth
- Principle of least privilege
- Data encryption at rest and in transit

## High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                      Next.js Application                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend (React)                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │  Pages   │  │Components│  │ Contexts │              │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  API Routes (Backend)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │   Auth   │  │   CRUD   │  │Processing│              │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                        Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Document   │  │     Job      │  │    Realm     │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pipeline   │  │   MoRAG      │  │    Auth      │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    MySQL/    │  │   Vector     │  │    Redis     │         │
│  │  PostgreSQL  │  │   Database   │  │    Cache     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Load Balancer
2. **Load Balancer** → Next.js Application
3. **Next.js Router** → Page Component or API Route
4. **API Route** → Authentication Middleware
5. **Middleware** → Service Layer
6. **Service Layer** → Data Access Layer
7. **Data Layer** → Database/Cache
8. **Response** → Client (with caching headers)

## Component Architecture

### Frontend Components

#### 1. Page Components (`/app`)
```
app/
├── (auth)/
│   └── login/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx (Realms)
│   ├── documents/
│   ├── jobs/
│   ├── users/
│   └── settings/
└── api/
```

#### 2. UI Components (`/components`)
```
components/
├── ui/                    # Atomic UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── views/                 # Page-specific views
│   ├── DocumentsView.tsx
│   ├── RealmsView.tsx
│   └── ...
├── dialogs/              # Modal dialogs
│   ├── CreateRealmDialog.tsx
│   └── ...
└── layout/               # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

#### 3. Context Architecture
```
contexts/
├── AppContext.tsx        # Global app state
├── AuthContext.tsx       # Authentication state
├── RealmContext.tsx      # Current realm state
└── ThemeContext.tsx      # Theme preferences
```

### Backend Services

#### 1. Core Services
```typescript
interface IDocumentService {
  createDocument(data: CreateDocumentDTO): Promise<Document>
  getDocument(id: string): Promise<Document>
  updateDocument(id: string, data: UpdateDocumentDTO): Promise<Document>
  deleteDocument(id: string): Promise<void>
  processDocument(id: string): Promise<Job>
}

interface IRealmService {
  createRealm(data: CreateRealmDTO): Promise<Realm>
  switchRealm(userId: string, realmId: string): Promise<void>
  getRealms(userId: string): Promise<Realm[]>
  updateRealmConfig(id: string, config: RealmConfig): Promise<Realm>
}

interface IJobService {
  createJob(data: CreateJobDTO): Promise<Job>
  updateJobStatus(id: string, status: JobStatus): Promise<Job>
  getActiveJobs(): Promise<Job[]>
  processNextJob(): Promise<void>
}
```

#### 2. Processing Pipeline Services
```typescript
interface IPipelineService {
  executePipeline(documentId: string): Promise<void>
  executeStage(documentId: string, stage: ProcessingStage): Promise<void>
  retryStage(executionId: string): Promise<void>
}

interface IStageExecutor {
  execute(document: Document, config: StageConfig): Promise<StageResult>
  validate(input: StageInput): boolean
  rollback(executionId: string): Promise<void>
}
```

#### 3. Integration Services
```typescript
interface IVectorDatabaseService {
  connect(config: DatabaseConfig): Promise<void>
  store(embeddings: Embedding[]): Promise<void>
  search(query: string, limit: number): Promise<SearchResult[]>
  delete(ids: string[]): Promise<void>
}

interface ILLMService {
  generateCompletion(prompt: string, config: LLMConfig): Promise<string>
  generateEmbedding(text: string): Promise<number[]>
  extractEntities(text: string): Promise<Entity[]>
}
```

## Data Architecture

### Database Schema

#### Core Entities
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│  UserRealm  │>────│    Realm    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                        │
       │                                        │
       ▼                                        ▼
┌─────────────┐                        ┌─────────────┐
│   ApiKey    │                        │  Document   │
└─────────────┘                        └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────┐
                    │                          │                      │
                    ▼                          ▼                      ▼
            ┌─────────────┐           ┌─────────────┐       ┌─────────────┐
            │DocumentChunk│           │     Job     │       │DocumentFile │
            └─────────────┘           └─────────────┘       └─────────────┘
                    │                          │
                    ▼                          ▼
            ┌─────────────┐           ┌─────────────┐
            │    Fact     │           │ProcessingJob│
            └─────────────┘           └─────────────┘
```

### Data Flow Patterns

#### 1. Document Processing Flow
```
Document Upload → Validation → Storage → Job Creation → Processing Pipeline → Vector Storage
                                   │
                                   ▼
                            File Storage (S3/Local)
```

#### 2. Query Flow
```
User Query → Query Parser → Vector Search → Result Ranking → Response Formation
                  │                │
                  ▼                ▼
           Query Cache      Vector Database
```

#### 3. Realm Isolation
```
Realm A                    Realm B
   │                          │
   ├── Documents              ├── Documents
   ├── Users                  ├── Users
   ├── Configuration          ├── Configuration
   └── Vector Space           └── Vector Space
   
   (Complete Isolation)
```

### Data Models

#### Document Lifecycle States
```
PENDING → INGESTING → INGESTED → DEPRECATED → DELETED
           │     ▲
           ▼     │
         FAILED ─┘
```

#### Processing Stage Dependencies
```
MARKDOWN_CONVERSION
        │
        ▼
MARKDOWN_OPTIMIZER
        │
        ▼
    CHUNKER
        │
        ├─────────┐
        ▼         ▼
FACT_GENERATOR  ENTITY_EXTRACTOR
        │         │
        └────┬────┘
             ▼
         INGESTOR
```

## Security Architecture

### Authentication & Authorization

#### 1. Authentication Flow
```
┌──────┐      ┌──────────┐      ┌────────┐      ┌──────────┐
│Client│─────>│  Login   │─────>│Validate│─────>│Generate  │
└──────┘      │  Request │      │ Creds  │      │   JWT    │
              └──────────┘      └────────┘      └──────────┘
                                                      │
              ┌──────────┐      ┌────────┐           │
│Client│<─────│   JWT    │<─────│  Store │<──────────┘
└──────┘      │ Response │      │Session │
              └──────────┘      └────────┘
```

#### 2. Authorization Matrix
```
Resource        Admin   User    Viewer  Guest
─────────────────────────────────────────────
System Config    RW      -       -       -
User Mgmt        RW      -       -       -
Realm Create     RW      RW      -       -
Document Upload  RW      RW      -       -
Document View    RW      RW      R       -
Search           RW      RW      R       -
API Keys         RW      RW      -       -
```

#### 3. Realm-Level Permissions
```
Role        Create  Read    Update  Delete  Admin
─────────────────────────────────────────────────
Owner         ✓      ✓        ✓       ✓       ✓
Admin         ✓      ✓        ✓       ✓       ✓
Member        ✓      ✓        ✓       -       -
Viewer        -      ✓        -       -       -
```

### Data Security

#### 1. Encryption
- **At Rest**: AES-256 encryption for database
- **In Transit**: TLS 1.3 for all communications
- **Secrets**: Encrypted with KMS
- **PII**: Field-level encryption for sensitive data

#### 2. Access Control
```
┌─────────────────────────────────────┐
│          API Gateway                 │
│    (Rate Limiting, API Keys)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Authentication Layer          │
│    (JWT, SSO, Session Mgmt)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Authorization Layer            │
│    (RBAC, Realm Permissions)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Business Logic               │
│    (Services, Validation)           │
└─────────────────────────────────────┘
```

### Security Best Practices

#### 1. Input Validation
- Zod schema validation for all inputs
- SQL injection prevention via Prisma
- XSS protection with React
- CSRF tokens for state-changing operations

#### 2. Audit Logging
```typescript
interface AuditLog {
  userId: string
  action: AuditAction
  resource: string
  resourceId: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure'
  metadata?: Record<string, any>
}
```

#### 3. Rate Limiting
```
Public API: 100 requests/minute
Authenticated API: 1000 requests/minute
Search API: 30 requests/minute
Upload API: 10 requests/minute
```

## Deployment Architecture

### Container Architecture

#### 1. Docker Composition
```yaml
services:
  app:
    image: morag-app:latest
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL
      - JWT_SECRET
    depends_on:
      - db
      - redis
      
  worker:
    image: morag-worker:latest
    environment:
      - DATABASE_URL
      - REDIS_URL
    depends_on:
      - db
      - redis
      
  db:
    image: mysql:8
    volumes:
      - db_data:/var/lib/mysql
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

#### 2. Kubernetes Architecture
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: morag-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: morag
  template:
    metadata:
      labels:
        app: morag
    spec:
      containers:
      - name: app
        image: morag-app:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Scaling Strategy

#### 1. Horizontal Scaling
```
┌──────────────────────────────────────┐
│         Load Balancer                 │
└────┬──────────┬──────────┬───────────┘
     │          │          │
┌────▼────┐┌───▼────┐┌────▼────┐
│  App 1  ││  App 2  ││  App 3  │  (Auto-scaling 3-10 pods)
└─────────┘└─────────┘└─────────┘
     │          │          │
┌────▼──────────▼──────────▼────┐
│      Shared Services           │
└────────────────────────────────┘
```

#### 2. Database Scaling
```
Primary Database (Write)
        │
        ├── Read Replica 1
        ├── Read Replica 2
        └── Read Replica 3
        
Vector Database Cluster
        ├── Shard 1
        ├── Shard 2
        └── Shard 3
```

### Environment Configuration

#### 1. Development
```env
NODE_ENV=development
DATABASE_URL=mysql://localhost:3306/morag_dev
REDIS_URL=redis://localhost:6379
ENABLE_AUTO_LOGIN=true
LOG_LEVEL=debug
```

#### 2. Staging
```env
NODE_ENV=staging
DATABASE_URL=mysql://staging-db:3306/morag_staging
REDIS_URL=redis://staging-redis:6379
ENABLE_AUTO_LOGIN=false
LOG_LEVEL=info
```

#### 3. Production
```env
NODE_ENV=production
DATABASE_URL=mysql://prod-db:3306/morag_prod
REDIS_URL=redis://prod-redis:6379
ENABLE_AUTO_LOGIN=false
LOG_LEVEL=error
```

## Integration Architecture

### External Service Integration

#### 1. Vector Database Adapters
```typescript
interface VectorDatabaseAdapter {
  connect(config: ConnectionConfig): Promise<void>
  disconnect(): Promise<void>
  createCollection(name: string, config: CollectionConfig): Promise<void>
  upsert(vectors: Vector[]): Promise<void>
  search(query: Vector, limit: number): Promise<SearchResult[]>
  delete(ids: string[]): Promise<void>
}

class QdrantAdapter implements VectorDatabaseAdapter { }
class PineconeAdapter implements VectorDatabaseAdapter { }
class WeaviateAdapter implements VectorDatabaseAdapter { }
class ChromaAdapter implements VectorDatabaseAdapter { }
```

#### 2. LLM Integration
```typescript
interface LLMProvider {
  generateCompletion(prompt: string, options: CompletionOptions): Promise<string>
  generateEmbedding(text: string): Promise<number[]>
  streamCompletion(prompt: string, onChunk: (chunk: string) => void): Promise<void>
}

class OpenAIProvider implements LLMProvider { }
class AnthropicProvider implements LLMProvider { }
class LocalLLMProvider implements LLMProvider { }
```

### API Architecture

#### 1. RESTful API Design
```
GET    /api/realms              # List realms
POST   /api/realms              # Create realm
GET    /api/realms/:id          # Get realm
PUT    /api/realms/:id          # Update realm
DELETE /api/realms/:id          # Delete realm

GET    /api/documents           # List documents
POST   /api/documents           # Create document
GET    /api/documents/:id       # Get document
PUT    /api/documents/:id       # Update document
DELETE /api/documents/:id       # Delete document

POST   /api/documents/:id/process  # Process document
GET    /api/documents/:id/status   # Get processing status
POST   /api/search                 # Search documents
```

#### 2. WebSocket Events
```typescript
enum WebSocketEvent {
  JOB_CREATED = 'job.created',
  JOB_UPDATED = 'job.updated',
  JOB_COMPLETED = 'job.completed',
  JOB_FAILED = 'job.failed',
  DOCUMENT_PROCESSED = 'document.processed',
  REALM_UPDATED = 'realm.updated'
}
```

#### 3. Webhook System
```typescript
interface WebhookConfig {
  url: string
  events: WebhookEvent[]
  secret: string
  retryPolicy: RetryPolicy
}

interface WebhookPayload {
  event: string
  timestamp: Date
  data: any
  signature: string
}
```

## Performance Architecture

### Caching Strategy

#### 1. Multi-Layer Caching
```
┌─────────────┐
│   Browser   │  (Local Storage, Session Storage)
│    Cache    │
└──────┬──────┘
       │
┌──────▼──────┐
│     CDN     │  (Static Assets, Images)
│    Cache    │
└──────┬──────┘
       │
┌──────▼──────┐
│Application  │  (In-Memory Cache)
│    Cache    │
└──────┬──────┘
       │
┌──────▼──────┐
│    Redis    │  (Session, Query Results)
│    Cache    │
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │  (Query Cache)
│    Cache    │
└─────────────┘
```

#### 2. Cache Invalidation Strategy
```typescript
interface CacheStrategy {
  ttl: number              // Time to live in seconds
  staleWhileRevalidate: boolean
  tags: string[]          // For tag-based invalidation
  version: string         // For version-based invalidation
}

// Cache invalidation patterns
enum InvalidationPattern {
  TIME_BASED = 'time_based',      // TTL expiration
  EVENT_BASED = 'event_based',    // On specific events
  MANUAL = 'manual',               // Manual purge
  TAG_BASED = 'tag_based'         // Invalidate by tags
}
```

### Query Optimization

#### 1. Database Query Optimization
```typescript
// Efficient pagination with cursor
const documents = await prisma.document.findMany({
  where: { realmId, uploadDate: { gte: cursor } },
  take: limit + 1,
  orderBy: { uploadDate: 'desc' },
  include: {
    _count: { select: { chunks: true, facts: true } },
    jobs: { take: 1, orderBy: { createdAt: 'desc' } }
  }
})

// Aggregation pipeline
const stats = await prisma.$queryRaw`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN state = 'INGESTED' THEN 1 ELSE 0 END) as processed,
    AVG(chunks) as avgChunks
  FROM documents
  WHERE realmId = ${realmId}
`
```

#### 2. Vector Search Optimization
```typescript
interface SearchOptimization {
  useCache: boolean           // Cache frequent queries
  preFilter: FilterCriteria   // Metadata filtering before vector search
  hybridSearch: boolean       // Combine vector + keyword search
  reranking: boolean         // Re-rank results with cross-encoder
  maxCandidates: number      // Limit candidates for efficiency
}
```

### Load Balancing

#### 1. Application Load Balancing
```
┌─────────────────────────┐
│    Global LB (Geo)      │
└───┬─────────┬───────────┘
    │         │
┌───▼───┐ ┌──▼────┐
│Region1│ │Region2│
└───┬───┘ └──┬────┘
    │        │
┌───▼───────▼───┐
│   Local LB     │
└──┬──┬──┬──┬───┘
   │  │  │  │
 App1 2  3  4
```

#### 2. Database Load Balancing
```typescript
class DatabaseLoadBalancer {
  private readReplicas: Database[]
  private writeDatabase: Database
  
  async read(query: Query): Promise<Result> {
    const replica = this.selectReplica() // Round-robin, least connections
    return replica.execute(query)
  }
  
  async write(query: Query): Promise<Result> {
    return this.writeDatabase.execute(query)
  }
}
```

## Monitoring and Observability

### Metrics Collection

#### 1. Application Metrics
```typescript
interface ApplicationMetrics {
  // Request metrics
  requestCount: Counter
  requestDuration: Histogram
  requestErrors: Counter
  
  // Business metrics
  documentsProcessed: Counter
  processingDuration: Histogram
  searchQueries: Counter
  searchLatency: Histogram
  
  // System metrics
  memoryUsage: Gauge
  cpuUsage: Gauge
  activeConnections: Gauge
}
```

#### 2. Infrastructure Metrics
```yaml
metrics:
  - name: cpu_usage
    type: gauge
    labels: [pod, node]
  - name: memory_usage
    type: gauge
    labels: [pod, node]
  - name: disk_io
    type: counter
    labels: [pod, device]
  - name: network_throughput
    type: counter
    labels: [pod, interface]
```

### Logging Architecture

#### 1. Structured Logging
```typescript
interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  service: string
  traceId: string
  spanId: string
  userId?: string
  realmId?: string
  message: string
  metadata: Record<string, any>
}

logger.info('Document processed', {
  documentId: doc.id,
  processingTime: duration,
  stages: completedStages,
  userId: user.id
})
```

#### 2. Log Aggregation Pipeline
```
Application Logs → Filebeat → Logstash → Elasticsearch → Kibana
                      │
                      └→ S3 (Long-term storage)
```

### Distributed Tracing

#### 1. Trace Structure
```
User Request
  │
  ├─ API Gateway (100ms)
  │   │
  │   ├─ Authentication (20ms)
  │   │
  │   └─ Rate Limiting (5ms)
  │
  ├─ Application (500ms)
  │   │
  │   ├─ Database Query (150ms)
  │   │
  │   ├─ Cache Lookup (10ms)
  │   │
  │   └─ Business Logic (340ms)
  │       │
  │       ├─ Vector Search (200ms)
  │       │
  │       └─ Result Processing (140ms)
  │
  └─ Response (10ms)
```

#### 2. Tracing Implementation
```typescript
import { Tracer } from '@opentelemetry/api'

async function processDocument(doc: Document, tracer: Tracer) {
  const span = tracer.startSpan('document.process')
  
  try {
    span.setAttributes({
      'document.id': doc.id,
      'document.type': doc.type,
      'document.size': doc.size
    })
    
    // Process document
    const result = await pipeline.execute(doc)
    
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw error
  } finally {
    span.end()
  }
}
```

### Health Checks

#### 1. Application Health
```typescript
interface HealthCheck {
  name: string
  check(): Promise<HealthStatus>
}

class DatabaseHealthCheck implements HealthCheck {
  async check(): Promise<HealthStatus> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', message: 'Database connected' }
    } catch (error) {
      return { status: 'unhealthy', message: error.message }
    }
  }
}
```

#### 2. Kubernetes Probes
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Alerting Rules

#### 1. Critical Alerts
```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 0.05
    duration: 5m
    severity: critical
    
  - name: DatabaseDown
    condition: database_health == 0
    duration: 1m
    severity: critical
    
  - name: DiskSpaceLow
    condition: disk_usage > 0.9
    duration: 10m
    severity: critical
```

#### 2. Warning Alerts
```yaml
alerts:
  - name: HighLatency
    condition: p95_latency > 1000ms
    duration: 10m
    severity: warning
    
  - name: ProcessingBacklog
    condition: pending_jobs > 1000
    duration: 30m
    severity: warning
    
  - name: MemoryPressure
    condition: memory_usage > 0.8
    duration: 15m
    severity: warning
```

## Development Workflow

### Git Workflow
```
main
  │
  ├── develop
  │     │
  │     ├── feature/feature-name
  │     ├── feature/another-feature
  │     └── bugfix/bug-description
  │
  ├── release/v1.0.0
  │
  └── hotfix/critical-fix
```

### CI/CD Pipeline
```yaml
pipeline:
  - stage: build
    steps:
      - checkout
      - install_dependencies
      - compile_typescript
      - build_application
      
  - stage: test
    parallel:
      - unit_tests
      - integration_tests
      - e2e_tests
      - security_scan
      
  - stage: deploy_staging
    steps:
      - build_docker_image
      - push_to_registry
      - deploy_to_staging
      - run_smoke_tests
      
  - stage: deploy_production
    steps:
      - approval_gate
      - blue_green_deployment
      - health_checks
      - rollback_on_failure
```

## Disaster Recovery

### Backup Strategy
```
Continuous Backups:
  - Database: Point-in-time recovery (PITR)
  - Files: Incremental backups to S3
  - Configurations: Git repository
  
Daily Snapshots:
  - Full database dump
  - Vector database export
  - Application state backup
  
Weekly Archives:
  - Complete system backup
  - Off-site replication
```

### Recovery Procedures
```
RTO (Recovery Time Objective): 1 hour
RPO (Recovery Point Objective): 15 minutes

Recovery Priority:
1. Authentication service
2. Database restoration
3. Application deployment
4. Vector database restoration
5. Background jobs resumption
```

## Future Architecture Considerations

### Microservices Migration Path
```
Current: Modular Monolith
  │
  ├── Phase 1: Extract Authentication Service
  ├── Phase 2: Extract Document Processing Service
  ├── Phase 3: Extract Search Service
  └── Phase 4: Full Microservices Architecture
```

### Technology Upgrades
- GraphQL API alongside REST
- Real-time collaboration with WebRTC
- Blockchain for document verification
- Edge computing for regional performance
- Serverless functions for event processing

### Scalability Enhancements
- Multi-region deployment
- Global CDN integration
- Database sharding
- Event streaming with Kafka
- Service mesh with Istio