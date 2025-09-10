# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoRAG (Modular Retrieval-Augmented Generation) is a comprehensive enterprise-grade platform for managing vector databases, document processing, and AI-powered content analysis. It uses a stage-based processing pipeline to transform unstructured data into actionable knowledge.

## Implemented milestones (*ALWAYS KEEP UPDATED*)
- 1a
- 2a, 2b, 2c

## Key Architecture

### Tech Stack
- **Frontend**: Next.js 14.2+ (App Router), React 18, Tailwind CSS, Radix UI, TypeScript 5
- **Backend**: Node.js 20+, Next.js API Routes, TypeScript, Prisma ORM 5.7.1
- **Database**: MySQL 8.0 / PostgreSQL 14+, with support for vector databases (Qdrant, Pinecone, Weaviate, ChromaDB)
- **Authentication**: JWT-based with optional SSO support

### Core Domain Concepts
- **Realms**: Isolated workspaces with complete data separation
- **Documents**: Files (PDF, audio, video, images, web content) processed through the pipeline
- **Processing Pipeline**: Stage-based system with 5 canonical stages
- **Jobs**: Background processing tasks with status tracking

## Processing Pipeline Stages

The system uses canonical stage names throughout:
1. `markdown-conversion` - Convert content to markdown format
2. `markdown-optimizer` - LLM-based text improvement (optional)
3. `chunker` - Split content into semantic chunks
4. `fact-generator` - Extract facts, entities, and relations
5. `ingestor` - Store in vector and graph databases

## API Architecture

### Stage-Based API Endpoints
- `POST /api/v1/stages/{stage_name}/execute` - Execute individual stages
- `POST /api/v1/stages/chain` - Execute multiple stages in sequence
- `POST /api/v1/stages/execute-all` - Execute all stages with form data
- `GET /api/v1/stages/list` - List available stages

### Key API Patterns
- **File uploads**: Use `-F "file=@filename"` for local files
- **URLs**: Use `-F 'input_files=["URL"]'` for web pages/YouTube
- **Model configuration**: Set via `llm_model_config` parameter
- **Stage configuration**: Pass via `stage_configs` parameter

## Database Schema

### Core Tables (Prisma Models)
- `User` - System users with role-based access
- `Realm` - Isolated workspaces with configurations
- `Document` - Document metadata and processing state
- `DocumentChunk` - Document segments with embeddings
- `DocumentFile` - File storage tracking
- `StageExecution` - Processing stage history
- `ProcessingJob` - Background job queue
- `Fact` - Extracted facts with relationships
- `Entity` - Named entities from documents

### Key Enums
- `ProcessingStage`: MARKDOWN_CONVERSION, MARKDOWN_OPTIMIZER, CHUNKER, FACT_GENERATOR, INGESTOR
- `DocumentState`: PENDING, INGESTING, INGESTED, DEPRECATED, DELETED
- `StageStatus`: PENDING, RUNNING, COMPLETED, FAILED, SKIPPED

## Common Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

### Linting and Type Checking
```bash
# Run ESLint
npm run lint

# Fix lint issues
npm run lint:fix

# Type check
npm run typecheck

# Format code
npm run format
```

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/morag_dev

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Vector Databases (optional)
QDRANT_HOST=localhost
QDRANT_PORT=6333
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

# LLM Configuration
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key

# YouTube Processing (optional)
APIFY_API_TOKEN=your-apify-token
```

## Project Structure

```
morag-ui-claude/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Atomic UI components
│   ├── views/            # Page-specific views
│   └── dialogs/          # Modal dialogs
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── docs/                 # Documentation
    ├── ARCHITECTURE.md   # System architecture
    ├── PRD.md           # Product requirements
    ├── BACKEND_API_GUIDE.md # API documentation
    └── schema.prisma    # Database schema
```

## Important Development Notes

1. **Stage Names**: Always use canonical stage names (e.g., `markdown-conversion`, not `markdown_conversion`)
2. **File Processing**: Support for PDF, audio, video, images, web URLs, and YouTube videos
3. **Realm Isolation**: Complete data isolation between realms - no cross-realm data access
4. **Processing Modes**: Manual (user-triggered) vs Automatic (immediate processing)
5. **Error Handling**: All API responses include `success` field - always check before using result
6. **Database Transactions**: Use Prisma transactions for multi-table operations
7. **Background Jobs**: Use ProcessingJob model for queue management
8. **Storybook Files**: All `.stories.tsx` files must be stored alongside their corresponding component file, not in a separate `/stories/` directory

## Security Considerations

- JWT tokens for authentication
- Role-based access control (RBAC) at system and realm levels
- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM
- Environment-based configuration for secrets
- Audit logging for critical operations

## Performance Optimization

- Cursor-based pagination for large datasets
- Redis caching for frequently accessed data
- Batch processing for document ingestion
- Efficient chunking strategies (semantic, topic-based)
- Vector database optimization with appropriate indexing

## Testing Strategy

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for pipeline stages
- Load testing for concurrent document processing