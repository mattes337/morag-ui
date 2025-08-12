# Task 4.2: Cross-Realm Querying

**Phase**: 4 - Advanced Querying System (Low Priority)
**Status**: ❌ Not Started
**Priority**: Low
**Estimated Effort**: 3-4 days

## Overview

Implement cross-realm querying capabilities that allow users to search and retrieve information across multiple realms simultaneously. This extends the current realm-isolated querying to enable broader information discovery while maintaining proper access controls and permissions.

## Current State Analysis

### Existing Implementation
- Queries are limited to single realm scope
- Realm isolation is enforced at the API level
- No cross-realm search capabilities
- No aggregated results from multiple realms

### Gap Analysis
- ❌ No cross-realm query execution
- ❌ No permission checking across realms
- ❌ No result aggregation from multiple realms
- ❌ No cross-realm relevance scoring
- ❌ No realm-aware result presentation

## Requirements

### Functional Requirements
1. **Multi-Realm Search**: Query across multiple realms simultaneously
2. **Permission Enforcement**: Respect realm access permissions
3. **Result Aggregation**: Combine and rank results from multiple realms
4. **Realm Attribution**: Clearly identify which realm each result comes from
5. **Selective Realm Querying**: Allow users to choose specific realms to search
6. **Performance Optimization**: Efficient parallel querying across realms
7. **Result Filtering**: Filter results by realm, database, or other criteria

### Technical Requirements
1. **Access Control**: Verify user permissions for each realm
2. **Parallel Execution**: Execute queries across realms in parallel
3. **Result Merging**: Intelligent merging and ranking of cross-realm results
4. **Caching**: Cache realm permissions and query results
5. **Error Handling**: Graceful handling of realm-specific failures
6. **Monitoring**: Track cross-realm query performance and usage

## Architecture Design

### Cross-Realm Query Engine
```typescript
interface CrossRealmQueryEngine {
  executeQuery(query: CrossRealmQuery): Promise<CrossRealmQueryResult>;
  getAccessibleRealms(userId: string): Promise<Realm[]>;
  validateRealmAccess(userId: string, realmIds: string[]): Promise<RealmAccessResult[]>;
  mergeResults(results: RealmQueryResult[]): Promise<MergedQueryResult>;
  rankCrossRealmResults(results: QueryResult[]): Promise<QueryResult[]>;
}

interface CrossRealmQuery {
  query: string;
  userId: string;
  targetRealms?: string[]; // If not specified, search all accessible realms
  maxResultsPerRealm?: number;
  totalMaxResults?: number;
  filters?: CrossRealmFilters;
  options?: QueryOptions;
}

interface CrossRealmQueryResult {
  query: string;
  totalResults: number;
  realmResults: RealmQueryResult[];
  aggregatedResults: QueryResult[];
  executionTime: number;
  errors: RealmQueryError[];
}
```

## Implementation Plan

### Step 1: Realm Access Management
```typescript
export class RealmAccessService {
  async getAccessibleRealms(userId: string): Promise<Realm[]> {
    // Get realms where user is owner or has explicit access
    const userRealms = await prisma.userRealm.findMany({
      where: { userId },
      include: {
        realm: {
          include: {
            owner: true,
            _count: {
              select: {
                documents: true,
                servers: true,
              },
            },
          },
        },
      },
    });

    // Also include realms owned by the user
    const ownedRealms = await prisma.realm.findMany({
      where: { ownerId: userId },
      include: {
        owner: true,
        _count: {
          select: {
            documents: true,
            servers: true,
          },
        },
      },
    });

    // Combine and deduplicate
    const allRealms = [
      ...userRealms.map(ur => ur.realm),
      ...ownedRealms,
    ];

    return this.deduplicateRealms(allRealms);
  }

  async validateRealmAccess(
    userId: string, 
    realmIds: string[]
  ): Promise<RealmAccessResult[]> {
    const accessResults: RealmAccessResult[] = [];

    for (const realmId of realmIds) {
      try {
        const access = await this.checkRealmAccess(userId, realmId);
        accessResults.push({
          realmId,
          hasAccess: access.hasAccess,
          role: access.role,
          permissions: access.permissions,
        });
      } catch (error) {
        accessResults.push({
          realmId,
          hasAccess: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return accessResults;
  }

  private async checkRealmAccess(userId: string, realmId: string): Promise<RealmAccess> {
    // Check if user owns the realm
    const ownedRealm = await prisma.realm.findFirst({
      where: { id: realmId, ownerId: userId },
    });

    if (ownedRealm) {
      return {
        hasAccess: true,
        role: 'OWNER',
        permissions: ['read', 'write', 'admin'],
      };
    }

    // Check if user has explicit access
    const userRealm = await prisma.userRealm.findFirst({
      where: { userId, realmId },
    });

    if (userRealm) {
      return {
        hasAccess: true,
        role: userRealm.role,
        permissions: this.getPermissionsForRole(userRealm.role),
      };
    }

    return {
      hasAccess: false,
      role: null,
      permissions: [],
    };
  }
}
```

### Step 2: Cross-Realm Query Executor
```typescript
export class CrossRealmQueryExecutor {
  async executeQuery(query: CrossRealmQuery): Promise<CrossRealmQueryResult> {
    const startTime = Date.now();
    
    // Validate realm access
    const targetRealms = query.targetRealms || 
      (await RealmAccessService.getAccessibleRealms(query.userId)).map(r => r.id);
    
    const accessResults = await RealmAccessService.validateRealmAccess(
      query.userId, 
      targetRealms
    );

    // Filter to only accessible realms
    const accessibleRealmIds = accessResults
      .filter(result => result.hasAccess)
      .map(result => result.realmId);

    if (accessibleRealmIds.length === 0) {
      throw new Error('No accessible realms found');
    }

    // Execute queries in parallel across accessible realms
    const realmQueryPromises = accessibleRealmIds.map(realmId =>
      this.executeRealmQuery(query, realmId)
    );

    const realmResults = await Promise.allSettled(realmQueryPromises);
    
    // Separate successful results from errors
    const successfulResults: RealmQueryResult[] = [];
    const errors: RealmQueryError[] = [];

    realmResults.forEach((result, index) => {
      const realmId = accessibleRealmIds[index];
      
      if (result.status === 'fulfilled') {
        successfulResults.push({
          realmId,
          ...result.value,
        });
      } else {
        errors.push({
          realmId,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    // Merge and rank results
    const aggregatedResults = await this.mergeAndRankResults(
      successfulResults,
      query
    );

    const executionTime = Date.now() - startTime;

    return {
      query: query.query,
      totalResults: aggregatedResults.length,
      realmResults: successfulResults,
      aggregatedResults,
      executionTime,
      errors,
    };
  }

  private async executeRealmQuery(
    query: CrossRealmQuery,
    realmId: string
  ): Promise<Omit<RealmQueryResult, 'realmId'>> {
    // Use existing vector search with realm filtering
    const searchResults = await VectorSearchService.search({
      query: query.query,
      realmId,
      numResults: query.maxResultsPerRealm || 10,
      filters: query.filters,
      options: query.options,
    });

    // Get realm information for context
    const realm = await prisma.realm.findUnique({
      where: { id: realmId },
      select: { id: true, name: true, description: true },
    });

    return {
      realm: realm!,
      results: searchResults.results,
      totalFound: searchResults.totalFound,
      executionTime: searchResults.executionTime,
    };
  }

  private async mergeAndRankResults(
    realmResults: RealmQueryResult[],
    query: CrossRealmQuery
  ): Promise<QueryResult[]> {
    // Combine all results
    const allResults: QueryResult[] = [];
    
    realmResults.forEach(realmResult => {
      realmResult.results.forEach(result => {
        allResults.push({
          ...result,
          realmId: realmResult.realmId,
          realmName: realmResult.realm.name,
          // Adjust score based on realm relevance if needed
          score: this.adjustScoreForRealm(result.score, realmResult.realmId, query),
        });
      });
    });

    // Sort by adjusted score
    allResults.sort((a, b) => b.score - a.score);

    // Limit to total max results
    const maxResults = query.totalMaxResults || 50;
    return allResults.slice(0, maxResults);
  }

  private adjustScoreForRealm(
    originalScore: number,
    realmId: string,
    query: CrossRealmQuery
  ): number {
    // Could implement realm-specific scoring adjustments here
    // For now, just return the original score
    return originalScore;
  }
}
```

### Step 3: Result Presentation and UI
```typescript
interface CrossRealmQueryResult {
  query: string;
  totalResults: number;
  realmResults: RealmQueryResult[];
  aggregatedResults: QueryResult[];
  executionTime: number;
  errors: RealmQueryError[];
}

const CrossRealmSearchInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedRealms, setSelectedRealms] = useState<string[]>([]);
  const [accessibleRealms, setAccessibleRealms] = useState<Realm[]>([]);
  const [results, setResults] = useState<CrossRealmQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAccessibleRealms();
  }, []);

  const loadAccessibleRealms = async () => {
    try {
      const realms = await RealmAccessService.getAccessibleRealms(currentUser.id);
      setAccessibleRealms(realms);
      setSelectedRealms(realms.map(r => r.id)); // Select all by default
    } catch (error) {
      console.error('Failed to load accessible realms:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await CrossRealmQueryExecutor.executeQuery({
        query,
        userId: currentUser.id,
        targetRealms: selectedRealms.length > 0 ? selectedRealms : undefined,
        maxResultsPerRealm: 10,
        totalMaxResults: 50,
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Cross-realm search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="space-y-4">
        <div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across realms..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Realm Selection */}
        <div>
          <Label>Search in Realms:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant={selectedRealms.length === accessibleRealms.length ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRealms(accessibleRealms.map(r => r.id))}
            >
              All Realms
            </Button>
            {accessibleRealms.map(realm => (
              <Button
                key={realm.id}
                variant={selectedRealms.includes(realm.id) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedRealms(prev =>
                    prev.includes(realm.id)
                      ? prev.filter(id => id !== realm.id)
                      : [...prev, realm.id]
                  );
                }}
              >
                {realm.name}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>
                Found {results.totalResults} results across {results.realmResults.length} realms
              </span>
              <span className="text-sm text-gray-500">
                {results.executionTime}ms
              </span>
            </div>
            
            {results.errors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {results.errors.length} realm(s) had errors
              </div>
            )}
          </div>

          {/* Aggregated Results */}
          <div className="space-y-3">
            {results.aggregatedResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{result.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{result.realmName}</Badge>
                    <span className="text-sm text-gray-500">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{result.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Database: {result.databaseName}</span>
                  <span>Document: {result.documentName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Realm-Specific Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Results by Realm</h3>
            {results.realmResults.map(realmResult => (
              <div key={realmResult.realmId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{realmResult.realm.name}</h4>
                  <span className="text-sm text-gray-500">
                    {realmResult.results.length} results ({realmResult.executionTime}ms)
                  </span>
                </div>
                
                <div className="space-y-2">
                  {realmResult.results.slice(0, 3).map((result, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-gray-500 ml-2">
                        ({(result.score * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                  {realmResult.results.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... and {realmResult.results.length - 3} more results
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## API Endpoints

### Cross-Realm Query APIs
```typescript
// Cross-realm search
POST /api/search/cross-realm
{
  query: string;
  targetRealms?: string[];
  maxResultsPerRealm?: number;
  totalMaxResults?: number;
  filters?: CrossRealmFilters;
}

// Get accessible realms
GET /api/realms/accessible

// Validate realm access
POST /api/realms/validate-access
{
  realmIds: string[];
}
```

## Performance Optimizations

### Caching Strategy
1. **Realm Access Cache**: Cache user realm permissions
2. **Query Result Cache**: Cache frequent cross-realm queries
3. **Realm Metadata Cache**: Cache realm information

### Parallel Execution
1. **Concurrent Queries**: Execute realm queries in parallel
2. **Connection Pooling**: Efficient database connection management
3. **Result Streaming**: Stream results as they become available

## Testing Strategy

### Unit Tests
- Realm access validation
- Query execution logic
- Result merging algorithms
- Permission checking

### Integration Tests
- End-to-end cross-realm search
- Permission enforcement
- Error handling across realms
- Performance with multiple realms

### Performance Tests
- Large-scale cross-realm queries
- Concurrent user scenarios
- Memory usage optimization

## Acceptance Criteria

- [ ] Users can search across multiple realms simultaneously
- [ ] Realm permissions are properly enforced
- [ ] Results are accurately merged and ranked
- [ ] Realm attribution is clear in results
- [ ] Performance is acceptable for typical use cases
- [ ] Error handling is graceful for realm-specific failures
- [ ] UI provides intuitive realm selection and result presentation

## Dependencies

- Existing realm and permission system
- Vector search functionality
- User authentication system
- Result ranking algorithms

## Success Metrics

- Cross-realm queries execute within acceptable time limits (<5s)
- Permission enforcement is 100% accurate
- User adoption of cross-realm search features
- Improved information discovery across organizational boundaries
- Reduced time to find relevant information
