# Task 4.1: Classifier Agent Implementation

**Phase**: 4 - Advanced Querying System (Low Priority)
**Status**: ❌ Not Started
**Priority**: Low
**Estimated Effort**: 4-5 days

## Overview

Implement an intelligent classifier agent that can analyze user queries and automatically determine which databases are most relevant for answering the query. This enables cross-database and cross-realm querying by intelligently selecting the appropriate data sources.

## Current State Analysis

### Existing Implementation
- Users manually select specific databases or realms for querying
- No automatic database selection based on query content
- Limited to single database or single realm queries
- No intelligent routing of queries to relevant data sources

### Gap Analysis
- ❌ No query analysis and classification system
- ❌ No automatic database selection
- ❌ No cross-database query routing
- ❌ No query intent understanding
- ❌ No confidence scoring for database selection

## Requirements

### Functional Requirements
1. **Query Analysis**: Analyze user queries to understand intent and content
2. **Database Classification**: Classify databases based on their content and domain
3. **Intelligent Selection**: Select most relevant databases for a given query
4. **Confidence Scoring**: Provide confidence scores for database selections
5. **Multi-Database Queries**: Support querying across multiple selected databases
6. **Learning Capability**: Improve selection accuracy over time
7. **Fallback Mechanism**: Handle cases where no suitable database is found

### Technical Requirements
1. **AI/ML Integration**: LLM integration for query understanding
2. **Database Profiling**: Create profiles of database content and capabilities
3. **Similarity Matching**: Match queries to database profiles
4. **Caching System**: Cache classification results for performance
5. **API Integration**: Seamless integration with existing query system
6. **Monitoring**: Track classification accuracy and performance

## Architecture Design

### Classifier Agent Components
```typescript
interface ClassifierAgent {
  analyzeQuery(query: string): Promise<QueryAnalysis>;
  selectDatabases(analysis: QueryAnalysis, availableDatabases: Database[]): Promise<DatabaseSelection[]>;
  executeMultiDatabaseQuery(query: string, selections: DatabaseSelection[]): Promise<QueryResult[]>;
  updateDatabaseProfiles(databases: Database[]): Promise<void>;
  learnFromFeedback(query: string, selections: DatabaseSelection[], feedback: UserFeedback): Promise<void>;
}

interface QueryAnalysis {
  intent: QueryIntent;
  domain: string[];
  keywords: string[];
  entities: string[];
  complexity: QueryComplexity;
  confidence: number;
}

interface DatabaseSelection {
  database: Database;
  relevanceScore: number;
  confidence: number;
  reasoning: string;
}
```

### Database Profiling System
```typescript
interface DatabaseProfile {
  id: string;
  databaseId: string;
  domain: string;
  contentSummary: string;
  keywords: string[];
  entities: string[];
  documentTypes: string[];
  topicDistribution: TopicDistribution;
  queryHistory: QueryPattern[];
  lastUpdated: Date;
}

interface TopicDistribution {
  [topic: string]: number; // topic -> relevance score
}
```

## Implementation Plan

### Step 1: Query Analysis Engine
```typescript
export class QueryAnalysisEngine {
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    // Use LLM to analyze query intent and extract key information
    const analysis = await this.llmService.analyzeQuery(query);
    return {
      intent: this.classifyIntent(analysis),
      domain: this.extractDomains(analysis),
      keywords: this.extractKeywords(analysis),
      entities: this.extractEntities(analysis),
      complexity: this.assessComplexity(analysis),
      confidence: analysis.confidence
    };
  }

  private classifyIntent(analysis: any): QueryIntent {
    // Classify query intent (search, analysis, comparison, etc.)
  }

  private extractDomains(analysis: any): string[] {
    // Extract relevant domains from query
  }
}
```

### Step 2: Database Profiling Service
```typescript
export class DatabaseProfilingService {
  async createProfile(database: Database): Promise<DatabaseProfile> {
    const documents = await this.getDocuments(database.id);
    const contentAnalysis = await this.analyzeContent(documents);
    
    return {
      id: generateId(),
      databaseId: database.id,
      domain: database.domain || 'general',
      contentSummary: contentAnalysis.summary,
      keywords: contentAnalysis.keywords,
      entities: contentAnalysis.entities,
      documentTypes: contentAnalysis.types,
      topicDistribution: contentAnalysis.topics,
      queryHistory: [],
      lastUpdated: new Date()
    };
  }

  async updateProfile(databaseId: string): Promise<void> {
    // Update profile based on new content and query patterns
  }
}
```

### Step 3: Database Selection Engine
```typescript
export class DatabaseSelectionEngine {
  async selectDatabases(
    analysis: QueryAnalysis, 
    availableDatabases: Database[]
  ): Promise<DatabaseSelection[]> {
    const profiles = await this.getProfiles(availableDatabases);
    const selections: DatabaseSelection[] = [];

    for (const profile of profiles) {
      const relevanceScore = await this.calculateRelevance(analysis, profile);
      const confidence = await this.calculateConfidence(analysis, profile);
      
      if (relevanceScore > this.threshold) {
        selections.push({
          database: profile.database,
          relevanceScore,
          confidence,
          reasoning: this.generateReasoning(analysis, profile, relevanceScore)
        });
      }
    }

    return selections.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async calculateRelevance(
    analysis: QueryAnalysis, 
    profile: DatabaseProfile
  ): Promise<number> {
    // Calculate relevance score based on multiple factors
    const domainMatch = this.calculateDomainMatch(analysis.domain, profile.domain);
    const keywordMatch = this.calculateKeywordMatch(analysis.keywords, profile.keywords);
    const entityMatch = this.calculateEntityMatch(analysis.entities, profile.entities);
    const topicMatch = this.calculateTopicMatch(analysis, profile.topicDistribution);

    return (domainMatch * 0.3 + keywordMatch * 0.3 + entityMatch * 0.2 + topicMatch * 0.2);
  }
}
```

### Step 4: Multi-Database Query Executor
```typescript
export class MultiDatabaseQueryExecutor {
  async executeQuery(
    query: string, 
    selections: DatabaseSelection[]
  ): Promise<QueryResult[]> {
    const results: QueryResult[] = [];
    
    // Execute queries in parallel across selected databases
    const promises = selections.map(selection => 
      this.executeOnDatabase(query, selection.database)
    );
    
    const databaseResults = await Promise.all(promises);
    
    // Merge and rank results
    return this.mergeAndRankResults(databaseResults, selections);
  }

  private async executeOnDatabase(
    query: string, 
    database: Database
  ): Promise<DatabaseQueryResult> {
    // Execute query on specific database using existing vector search
    return await this.vectorSearchService.search({
      query,
      databaseId: database.id,
      numResults: 10
    });
  }

  private mergeAndRankResults(
    results: DatabaseQueryResult[], 
    selections: DatabaseSelection[]
  ): QueryResult[] {
    // Merge results from multiple databases and apply global ranking
    const merged: QueryResult[] = [];
    
    results.forEach((dbResult, index) => {
      const selection = selections[index];
      dbResult.results.forEach(result => {
        merged.push({
          ...result,
          databaseId: selection.database.id,
          databaseName: selection.database.name,
          relevanceScore: result.score * selection.relevanceScore,
          source: 'classifier'
        });
      });
    });

    return merged.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
```

## Database Schema Extensions

### Classifier Models
```prisma
model DatabaseProfile {
  id                String   @id @default(uuid())
  databaseId        String   @unique
  domain            String
  contentSummary    String
  keywords          String[] // Array of keywords
  entities          String[] // Array of entities
  documentTypes     String[] // Array of document types
  topicDistribution Json     // Topic -> score mapping
  queryHistory      Json     // Array of query patterns
  lastUpdated       DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  database          Database @relation(fields: [databaseId], references: [id], onDelete: Cascade)

  @@map("database_profiles")
}

model QueryClassification {
  id              String   @id @default(uuid())
  query           String
  intent          String
  domains         String[]
  keywords        String[]
  entities        String[]
  complexity      String
  confidence      Float
  selectedDatabases Json   // Array of selected database IDs with scores
  userFeedback    Json?    // User feedback on classification accuracy
  createdAt       DateTime @default(now())

  @@map("query_classifications")
}
```

## API Endpoints

### Classifier Agent APIs
```typescript
// Query classification and database selection
POST /api/classifier/analyze-query
{
  query: string;
  availableRealms?: string[];
  availableDatabases?: string[];
}

// Multi-database query execution
POST /api/classifier/query
{
  query: string;
  autoSelect?: boolean;
  selectedDatabases?: string[];
  maxDatabases?: number;
}

// Database profiling
POST /api/classifier/profiles/update
GET  /api/classifier/profiles/[databaseId]
GET  /api/classifier/profiles

// Feedback and learning
POST /api/classifier/feedback
{
  queryId: string;
  feedback: 'relevant' | 'irrelevant' | 'partial';
  selectedDatabases: string[];
  actuallyUsefulDatabases: string[];
}
```

## Frontend Components

### ClassifierQueryInterface
```typescript
interface ClassifierQueryProps {
  onQuerySubmit: (query: string, options: QueryOptions) => void;
  availableDatabases: Database[];
  isLoading: boolean;
}

const ClassifierQueryInterface: React.FC<ClassifierQueryProps> = ({
  onQuerySubmit,
  availableDatabases,
  isLoading
}) => {
  // Query input with auto-classification
  // Database selection preview
  // Confidence indicators
  // Manual override options
};
```

### DatabaseSelectionPreview
```typescript
interface DatabaseSelectionPreviewProps {
  selections: DatabaseSelection[];
  onOverride: (selections: DatabaseSelection[]) => void;
  onConfirm: () => void;
}
```

## Testing Strategy

### Unit Tests
- Query analysis accuracy
- Database selection algorithms
- Relevance scoring functions
- Profile generation and updates

### Integration Tests
- End-to-end classification workflow
- Multi-database query execution
- Profile update mechanisms
- Feedback learning system

### Performance Tests
- Classification speed with large database sets
- Query execution across multiple databases
- Profile generation for large content volumes

## Learning and Improvement

### Feedback Collection
```typescript
interface UserFeedback {
  queryId: string;
  selectedDatabases: string[];
  actuallyUseful: string[];
  notUseful: string[];
  rating: number; // 1-5 scale
  comments?: string;
}
```

### Learning Algorithm
1. **Implicit Feedback**: Track which results users click on
2. **Explicit Feedback**: Collect user ratings on database selections
3. **Pattern Recognition**: Identify successful query-database patterns
4. **Model Updates**: Periodically retrain classification models

## Acceptance Criteria

- [ ] Query analysis accurately identifies intent and key information
- [ ] Database selection provides relevant databases with >80% accuracy
- [ ] Multi-database queries execute efficiently
- [ ] Confidence scores are meaningful and calibrated
- [ ] User feedback improves classification over time
- [ ] Performance is acceptable (<3s for classification + query)
- [ ] Fallback mechanisms handle edge cases
- [ ] Integration with existing query system is seamless

## Dependencies

- LLM service integration (OpenAI, Anthropic, etc.)
- Existing vector search functionality
- Database profiling system
- User feedback collection system

## Risks & Mitigation

### Risk: LLM API Costs and Latency
**Mitigation**: Implement caching, use smaller models for classification, batch processing

### Risk: Classification Accuracy
**Mitigation**: Start with simple heuristics, gradually improve with ML, collect extensive feedback

### Risk: Performance with Many Databases
**Mitigation**: Implement efficient filtering, parallel processing, result caching

## Success Metrics

- Classification accuracy >80%
- User satisfaction with automatic database selection
- Reduced time to find relevant information
- Increased cross-database query usage
- Improved query result relevance scores
