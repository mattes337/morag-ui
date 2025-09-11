# MoRAG UI - Modular Retrieval-Augmented Generation Platform

![MoRAG Logo](./public/favicon.ico)

A comprehensive enterprise-grade platform for managing vector databases, document processing, and AI-powered content analysis. Transform unstructured data into actionable knowledge through advanced AI processing and retrieval augmentation.

## Quick Start

### Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: Latest version
- **MySQL 8.0+** or **PostgreSQL 14+** (for production)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd morag-ui-claude

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Open your browser
open http://localhost:3000
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## What is MoRAG?

MoRAG (Modular Retrieval-Augmented Generation) enables organizations to:

- 📚 **Process Documents**: Upload and process PDFs, audio, video, images, web content, and YouTube videos
- 🔍 **Semantic Search**: Find content using natural language queries with AI-powered relevance scoring
- 🏢 **Multi-Realm Support**: Complete data isolation between departments, projects, or teams
- ⚡ **5-Stage Pipeline**: Automated processing from raw content to actionable knowledge
- 🔗 **Vector Integration**: Support for Qdrant, Pinecone, Weaviate, ChromaDB
- 🎯 **Enterprise-Ready**: Role-based access, audit logging, SSO support

## Key Features

### 🎨 **Modern UI/UX**
- **Design System**: 60+ accessible UI components with Storybook documentation
- **Dark/Light Mode**: Automatic theme switching with user preferences
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### 🔧 **Developer Experience**
- **TypeScript**: Strict type safety with comprehensive interfaces
- **Component Library**: Radix UI primitives with Tailwind CSS styling
- **Testing**: Jest, Testing Library, and Playwright for comprehensive coverage
- **Storybook**: Interactive component documentation and development

### ⚡ **Performance Optimized**
- **Next.js 15**: App Router with React 18 concurrent features
- **Caching Strategy**: Intelligent search result caching with LRU eviction
- **Bundle Optimization**: Tree-shaking and dynamic imports
- **Memory Management**: Proactive cleanup and monitoring

## Project Structure

```
morag-ui-claude/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes (/login, /register)
│   ├── (dashboard)/       # Main application routes (/search, /documents)
│   └── api/               # API routes for backend integration
├── components/            # React components
│   ├── ui/               # Atomic UI components (Button, Input, Card, etc.)
│   ├── auth/             # Authentication components (LoginForm, etc.)
│   ├── search/           # Search interface and results
│   ├── documents/        # Document upload and management
│   ├── layout/           # Layout components (Sidebar, Header, etc.)
│   └── error/            # Error boundaries and fallbacks
├── contexts/             # React contexts for global state
├── lib/                  # Utility libraries and API clients
│   ├── api/             # API client functions
│   ├── utils/           # Helper utilities
│   ├── hooks/           # Custom React hooks
│   └── mockData/        # Development mock data
├── docs/                 # Documentation
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Development Workflow

### Daily Development

```bash
# Start development with hot reload
npm run dev

# Run component development environment
npm run storybook

# Run both simultaneously
npm run dev:all
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Testing
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:a11y         # Accessibility tests
```

### Building and Deployment

```bash
# Production build
npm run build

# Analyze bundle size
npm run build:analyze

# Start production server
npm start

# Build Storybook for deployment
npm run build:storybook
```

## Core Concepts

### Processing Pipeline

MoRAG processes documents through a 5-stage pipeline:

1. **`markdown-conversion`** - Convert content to markdown format
2. **`markdown-optimizer`** - LLM-based text improvement (optional)
3. **`chunker`** - Split content into semantic chunks
4. **`fact-generator`** - Extract facts, entities, and relations
5. **`ingestor`** - Store in vector and graph databases

### Realms

Realms provide complete data isolation, enabling:
- Department-specific knowledge bases
- Project-based document collections
- Multi-tenant architecture
- Role-based access control per realm

### Document Types

Supported formats include:
- **Documents**: PDF, DOCX, TXT, MD
- **Media**: MP3, MP4, WAV, JPG, PNG, WEBP
- **Web Content**: URLs, YouTube videos
- **Archives**: ZIP files with mixed content

## API Usage Examples

### Search Documents

```typescript
import { searchApi } from '@/lib/api/searchApi';

// Basic search
const results = await searchApi.searchDocuments({
  query: "quarterly revenue report",
  filters: {
    documentType: 'pdf',
    dateRange: 'last-3-months',
    sortBy: 'relevance'
  },
  page: 1,
  limit: 20
});

console.log(`Found ${results.totalResults} documents`);
```

### Upload Documents

```typescript
import { uploadDocuments } from '@/lib/api/documentsApi';

const files = [file1, file2]; // File objects
const uploadResult = await uploadDocuments(files, {
  realmId: 'engineering',
  autoProcess: true
});
```

### Stage Processing

```bash
# Execute single stage
curl -X POST "/api/v1/stages/markdown-conversion/execute" \
  -F "file=@document.pdf"

# Execute pipeline
curl -X POST "/api/v1/stages/execute-all" \
  -F "file=@document.pdf" \
  -F 'stage_configs={"chunker":{"strategy":"semantic"}}'
```

## Environment Configuration

Create `.env.local` with required variables:

```bash
# Database (Choose one)
DATABASE_URL=mysql://user:password@localhost:3306/morag_dev
DATABASE_URL=postgresql://user:password@localhost:5432/morag_dev

# Authentication
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d

# Vector Databases (Optional)
QDRANT_HOST=localhost
QDRANT_PORT=6333
NEO4J_URI=bolt://localhost:7687

# LLM Configuration
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key

# Media Processing (Optional)
APIFY_API_TOKEN=your-apify-token
```

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run storybook` | Component development |
| `npm run lint` | Check code quality |
| `npm run typecheck` | TypeScript validation |

## Component Usage Examples

### Search Interface

```tsx
import { SearchInterface } from '@/components/search/SearchInterface';

<SearchInterface
  onSearch={(query) => handleSearch(query)}
  onFilter={(filters) => handleFilter(filters)}
  placeholder="Search documents, knowledge base, and more..."
  autoFocus={true}
/>
```

### Document Upload

```tsx
import { DocumentUpload } from '@/components/documents/DocumentUpload';

<DocumentUpload
  onUploadComplete={(files) => console.log('Uploaded:', files)}
  showPipeline={true}
  maxFiles={10}
/>
```

### UI Components

```tsx
import { Button, Card, Input, Badge } from '@/components/ui';

// Accessible button with loading state
<Button 
  variant="primary" 
  size="lg" 
  loading={isSubmitting}
  leftIcon={<SaveIcon />}
>
  Save Document
</Button>

// Card with proper semantic structure
<Card>
  <CardHeader>
    <CardTitle>Document Analysis</CardTitle>
  </CardHeader>
  <CardContent>
    Content here...
  </CardContent>
</Card>
```

## Architecture Highlights

### Type Safety
- **Strict TypeScript**: All components and APIs fully typed
- **Interface Contracts**: Clear prop interfaces with JSDoc
- **Runtime Validation**: Zod schemas for API validation

### Performance
- **React 18**: Concurrent features for smooth UX
- **Caching**: 5-minute TTL with LRU eviction for search results
- **Bundle Splitting**: Automatic code splitting and tree-shaking
- **Memory Management**: Proactive cleanup and monitoring

### Accessibility
- **WCAG 2.1 AA**: Full compliance with accessibility standards
- **Screen Reader**: Comprehensive ARIA labels and live regions
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Design system ensures proper contrast ratios

## Testing Strategy

### Unit Tests
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

### Accessibility Tests
```bash
npm run test:a11y         # Run accessibility-specific tests
npm run accessibility:check # Full accessibility validation
```

### Integration Tests
```bash
npm run test:integration  # API and component integration
```

### End-to-End Tests
```bash
npm run test:e2e          # Full user workflow testing
```

## Contributing

1. **Code Style**: Follow ESLint configuration and Prettier formatting
2. **Component Development**: Create Storybook stories for new components
3. **Testing**: Maintain test coverage above 80%
4. **Accessibility**: Ensure WCAG 2.1 AA compliance
5. **Documentation**: Update JSDoc for all public APIs

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Regenerate types
npm run typecheck

# Check for missing dependencies
npm audit
```

**Performance Issues**
```bash
# Analyze bundle size
npm run build:analyze

# Check for memory leaks in browser DevTools
```

### Development Tools

- **Search Cache Stats**: In development, use `window.__searchCacheStats()` in browser console
- **Performance Monitoring**: Built-in performance tracking with React Profiler
- **Component Testing**: Use Storybook for isolated component development

## Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design and patterns
- **[API Documentation](./docs/BACKEND_API_GUIDE.md)** - Complete API reference
- **[Product Requirements](./docs/PRD.md)** - Feature specifications
- **[Accessibility Guide](./docs/ACCESSIBILITY_GUIDE.md)** - WCAG compliance details
- **[Component Storybook](http://localhost:6006)** - Interactive component docs

## Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check existing documentation in `/docs` folder
- Review component examples in Storybook
- Consult the troubleshooting section above

## License

ISC License - see LICENSE file for details.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**