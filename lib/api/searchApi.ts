import { SearchResult, SearchFilters, simulateSearchApi } from '@/lib/mockData/searchMockData';
import { trackCacheOperation } from '@/lib/utils/performanceMonitoring';

/**
 * Search request parameters for document search API
 * 
 * @example
 * ```typescript
 * const searchRequest: SearchRequest = {
 *   query: "machine learning models",
 *   filters: {
 *     documentType: 'pdf',
 *     dateRange: 'last-month', 
 *     sortBy: 'relevance'
 *   },
 *   page: 1,
 *   limit: 10
 * };
 * ```
 */
export interface SearchRequest {
  /** Search query string - minimum 3 characters for effective search */
  query: string;
  /** Filters to apply to search results */
  filters: SearchFilters;
  /** Page number for pagination (1-based, defaults to 1) */
  page?: number;
  /** Number of results per page (defaults to 10, max 100) */
  limit?: number;
}

/**
 * Search API response containing paginated results
 * 
 * @example
 * ```typescript
 * const response: SearchResponse = {
 *   results: [
 *     {
 *       id: '1',
 *       title: 'Q4 Financial Report',
 *       content: 'Comprehensive analysis...',
 *       documentType: 'pdf',
 *       relevanceScore: 0.95,
 *       highlights: ['revenue', 'growth'],
 *       metadata: { author: 'Finance Team' }
 *     }
 *   ],
 *   totalResults: 42,
 *   totalPages: 5,
 *   currentPage: 1
 * };
 * ```
 */
export interface SearchResponse {
  /** Array of search result documents */
  results: SearchResult[];
  /** Total number of matching documents across all pages */
  totalResults: number;
  /** Total number of pages available */
  totalPages: number;
  /** Current page number (1-based) */
  currentPage: number;
}

/**
 * Cache entry for storing search results with TTL and access tracking
 * Internal interface for search result caching with LRU eviction support
 */
interface CacheEntry {
  /** Cached search response data */
  data: SearchResponse;
  /** Timestamp when the entry was cached */
  timestamp: number;
  /** Timestamp when the entry was last accessed */
  lastAccessed: number;
}

/**
 * Advanced LRU cache for search results with TTL and memory management
 * 
 * Provides intelligent caching functionality with:
 * - Time-based expiration (5 minute TTL)
 * - Size-based eviction (100 entry limit)
 * - Memory-based eviction (10MB limit)
 * - LRU (Least Recently Used) eviction strategy
 * 
 * @example
 * ```typescript
 * const cache = new SearchCache();
 * 
 * // Check for cached result
 * const cached = cache.get(searchRequest);
 * if (cached) {
 *   return cached;
 * }
 * 
 * // Store result in cache
 * cache.set(searchRequest, searchResponse);
 * ```
 */
class SearchCache {
  private cache = new Map<string, CacheEntry>();
  /** Cache TTL in milliseconds (5 minutes) */
  private readonly TTL = 5 * 60 * 1000;
  /** Maximum number of cached entries */
  private readonly MAX_SIZE = 100;
  /** Approximate memory limit in MB */
  private readonly MAX_MEMORY_MB = 10;
  /** Current estimated memory usage in bytes */
  private memoryUsage = 0;

  private generateKey(request: SearchRequest): string {
    return JSON.stringify({
      query: request.query.trim().toLowerCase(),
      filters: request.filters,
      page: request.page || 1,
      limit: request.limit || 10
    });
  }

  private estimateEntrySize(entry: CacheEntry): number {
    // Rough estimation of memory usage in bytes
    const keySize = 200; // Approximate key size
    const dataSize = JSON.stringify(entry.data).length * 2; // UTF-16 encoding
    const metadataSize = 24; // timestamp + lastAccessed numbers
    return keySize + dataSize + metadataSize;
  }

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.memoryUsage -= this.estimateEntrySize(entry);
      }
      this.cache.delete(oldestKey);
    }
  }

  private enforceMemoryLimit(): void {
    const memoryLimitBytes = this.MAX_MEMORY_MB * 1024 * 1024;
    
    while (this.memoryUsage > memoryLimitBytes && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  get(request: SearchRequest): SearchResponse | null {
    const startTime = performance.now();
    const key = this.generateKey(request);
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Track cache miss
      trackCacheOperation('search-cache', 'miss', performance.now() - startTime);
      return null;
    }
    
    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.memoryUsage -= this.estimateEntrySize(entry);
      this.cache.delete(key);
      // Track cache miss due to expiration
      trackCacheOperation('search-cache', 'miss', performance.now() - startTime);
      return null;
    }
    
    // Update last accessed time for LRU
    entry.lastAccessed = now;
    
    // Track cache hit
    trackCacheOperation('search-cache', 'hit', performance.now() - startTime);
    
    return entry.data;
  }

  set(request: SearchRequest, data: SearchResponse): void {
    const key = this.generateKey(request);
    const now = Date.now();
    
    const newEntry: CacheEntry = {
      data,
      timestamp: now,
      lastAccessed: now
    };

    // If updating existing entry, subtract old size
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.memoryUsage -= this.estimateEntrySize(existingEntry);
    }

    // Add new entry size to memory usage
    const entrySize = this.estimateEntrySize(newEntry);
    this.memoryUsage += entrySize;

    this.cache.set(key, newEntry);

    // Enforce size limits
    while (this.cache.size > this.MAX_SIZE) {
      this.evictLRU();
    }

    // Enforce memory limits
    this.enforceMemoryLimit();
  }

  clear(): void {
    this.cache.clear();
    this.memoryUsage = 0;
  }

  // Clean up expired entries and optimize memory
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.estimateEntrySize(entry);
      }
      this.cache.delete(key);
    }

    // Proactive memory management - if we're over 80% of memory limit, clean up LRU entries
    const memoryThreshold = (this.MAX_MEMORY_MB * 1024 * 1024) * 0.8;
    while (this.memoryUsage > memoryThreshold && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  // Get cache statistics for monitoring
  getStats(): {
    size: number;
    memoryUsageMB: number;
    maxSize: number;
    maxMemoryMB: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      memoryUsageMB: this.memoryUsage / (1024 * 1024),
      maxSize: this.MAX_SIZE,
      maxMemoryMB: this.MAX_MEMORY_MB
    };
  }
}

// Global cache instance with memory management
const searchCache = new SearchCache();

// Cleanup expired entries and manage memory every minute
if (typeof window !== 'undefined') {
  // Only run cleanup in browser environment
  const cleanupInterval = setInterval(() => {
    searchCache.cleanup();
  }, 60 * 1000);

  // Clean up interval on page unload to prevent memory leaks
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
    searchCache.clear();
  });
}

// Development/debugging helper
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__searchCacheStats = () => searchCache.getStats();
}

/**
 * Main Search API class providing document search functionality
 * 
 * Features:
 * - Full-text search across document content, titles, and metadata
 * - Advanced filtering by document type, date range, and sorting
 * - Automatic result caching with 5-minute TTL and LRU eviction
 * - Pagination support for large result sets
 * - Error handling with detailed error messages
 * - Search suggestions and autocomplete support
 * - Faceted search filters for advanced UI
 * 
 * @example
 * ```typescript
 * import { searchApi } from '@/lib/api/searchApi';
 * 
 * // Basic search
 * const results = await searchApi.searchDocuments({
 *   query: "quarterly revenue report",
 *   filters: {
 *     documentType: 'pdf',
 *     dateRange: 'last-3-months',
 *     sortBy: 'relevance'
 *   },
 *   page: 1,
 *   limit: 20
 * });
 * 
 * console.log(`Found ${results.totalResults} documents`);
 * results.results.forEach(doc => {
 *   console.log(`${doc.title} (${doc.relevanceScore})`);
 * });
 * ```
 */
export class SearchApi {
  /**
   * Search documents with advanced filtering and pagination
   * 
   * Performs full-text search across document content, titles, and metadata.
   * Results are cached for 5 minutes to improve performance. Supports advanced
   * filtering, sorting, and pagination for large result sets.
   * 
   * @param request - Search parameters including query, filters, and pagination
   * @returns Promise resolving to paginated search results
   * 
   * @throws {Error} When search fails due to network issues or invalid parameters
   * 
   * @example
   * ```typescript
   * // Search for machine learning documents
   * try {
   *   const response = await searchApi.searchDocuments({
   *     query: "machine learning best practices",
   *     filters: {
   *       documentType: 'docx',
   *       dateRange: 'last-year',
   *       sortBy: 'date-desc'
   *     },
   *     page: 1,
   *     limit: 15
   *   });
   *   
   *   // Process results
   *   response.results.forEach(result => {
   *     console.log(`${result.title} - ${result.relevanceScore.toFixed(2)}`);
   *     console.log(`Highlights: ${result.highlights.join(', ')}`);
   *   });
   * } catch (error) {
   *   console.error('Search failed:', error.message);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Search with pagination
   * const searchAllPages = async (query: string) => {
   *   let allResults = [];
   *   let currentPage = 1;
   *   let totalPages = 1;
   *   
   *   do {
   *     const response = await searchApi.searchDocuments({
   *       query,
   *       filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
   *       page: currentPage,
   *       limit: 50
   *     });
   *     
   *     allResults.push(...response.results);
   *     totalPages = response.totalPages;
   *     currentPage++;
   *   } while (currentPage <= totalPages);
   *   
   *   return allResults;
   * };
   * ```
   */
  async searchDocuments(request: SearchRequest): Promise<SearchResponse> {
    try {
      // Check cache first
      const cached = searchCache.get(request);
      if (cached) {
        // Add small delay to simulate network request even for cached results
        await new Promise(resolve => setTimeout(resolve, 50));
        return cached;
      }

      // Perform search with mock API
      const response = await simulateSearchApi(
        request.query,
        request.filters,
        request.page || 1,
        request.limit || 10
      );

      // Cache the result
      searchCache.set(request, response);

      return response;
    } catch (error) {
      console.error('Search API error:', error);
      throw new Error(
        error instanceof Error 
          ? `Search failed: ${error.message}` 
          : 'Search request failed'
      );
    }
  }

  /**
   * Clear the search result cache
   * 
   * Useful when user context changes (realm switch, logout) or when
   * fresh data is required. Clears all cached search results immediately.
   * 
   * @example
   * ```typescript
   * // Clear cache when switching realms
   * const handleRealmChange = (newRealm) => {
   *   searchApi.clearCache();
   *   // Perform new search in new realm context
   * };
   * 
   * // Clear cache on logout
   * const handleLogout = () => {
   *   searchApi.clearCache();
   *   // Redirect to login
   * };
   * 
   * // Clear cache for testing
   * beforeEach(() => {
   *   searchApi.clearCache();
   * });
   * ```
   */
  clearCache(): void {
    searchCache.clear();
  }

  /**
   * Get search query suggestions for autocomplete functionality
   * 
   * Provides intelligent suggestions based on common search terms and
   * partial query matching. Currently uses a predefined list but can be
   * enhanced with ML-based suggestions or search history analysis.
   * 
   * @param query - Partial search query (minimum 1 character)
   * @returns Promise resolving to array of suggested search terms (max 5)
   * 
   * @example
   * ```typescript
   * // Show autocomplete suggestions in search input
   * const handleInputChange = async (value: string) => {
   *   if (value.length >= 1) {
   *     const suggestions = await searchApi.getSuggestions(value);
   *     setSuggestions(suggestions);
   *   } else {
   *     setSuggestions([]);
   *   }
   * };
   * 
   * // Example usage
   * const suggestions = await searchApi.getSuggestions("mach");
   * // Returns: ["machine learning", "market research"]
   * ```
   * 
   * @example
   * ```typescript
   * // Implement search with suggestions dropdown
   * const SearchWithSuggestions = () => {
   *   const [query, setQuery] = useState('');
   *   const [suggestions, setSuggestions] = useState<string[]>([]);
   *   const [showSuggestions, setShowSuggestions] = useState(false);
   *   
   *   const handleQueryChange = async (newQuery: string) => {
   *     setQuery(newQuery);
   *     
   *     if (newQuery.trim()) {
   *       const suggestions = await searchApi.getSuggestions(newQuery);
   *       setSuggestions(suggestions);
   *       setShowSuggestions(suggestions.length > 0);
   *     } else {
   *       setSuggestions([]);
   *       setShowSuggestions(false);
   *     }
   *   };
   *   
   *   return (
   *     <div className="relative">
   *       <input 
   *         value={query} 
   *         onChange={(e) => handleQueryChange(e.target.value)}
   *         onFocus={() => setShowSuggestions(suggestions.length > 0)}
   *         onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
   *       />
   *       {showSuggestions && (
   *         <div className="absolute top-full left-0 right-0 bg-white border shadow-lg">
   *           {suggestions.map(suggestion => (
   *             <div 
   *               key={suggestion} 
   *               className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
   *               onClick={() => {
   *                 setQuery(suggestion);
   *                 setShowSuggestions(false);
   *               }}
   *             >
   *               {suggestion}
   *             </div>
   *           ))}
   *         </div>
   *       )}
   *     </div>
   *   );
   * };
   * ```
   */
  async getSuggestions(query: string): Promise<string[]> {
    // Mock implementation - in real app would call suggestion API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!query.trim()) return [];
    
    // Simple suggestion logic based on common search terms
    const commonTerms = [
      'financial report',
      'machine learning',
      'performance metrics',
      'security incident',
      'product roadmap',
      'employee handbook',
      'market research',
      'API documentation',
      'customer feedback',
      'budget allocation'
    ];
    
    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Get search facets for building advanced search filters
   * 
   * Returns available filter options with result counts for each facet.
   * Facets can be optionally filtered by a search query to show only
   * relevant options based on the search context.
   * 
   * @param query - Optional search query to filter facets (shows only relevant facets)
   * @returns Promise resolving to facet data with counts and labels
   * 
   * @example
   * ```typescript
   * // Get all available facets
   * const facets = await searchApi.getSearchFacets();
   * console.log(`${facets.documentTypes.length} document types available`);
   * console.log(`${facets.authors.length} authors with documents`);
   * 
   * // Build filter UI
   * facets.documentTypes.forEach(type => {
   *   console.log(`${type.label}: ${type.count} documents`);
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Get facets for specific query context
   * const queryFacets = await searchApi.getSearchFacets("machine learning");
   * // Returns facets relevant to ML documents
   * 
   * // Build dynamic filter interface
   * const FilterInterface = () => {
   *   const [facets, setFacets] = useState(null);
   *   const [query, setQuery] = useState('');
   *   
   *   useEffect(() => {
   *     const loadFacets = async () => {
   *       const data = await searchApi.getSearchFacets(query || undefined);
   *       setFacets(data);
   *     };
   *     loadFacets();
   *   }, [query]);
   *   
   *   if (!facets) return <div>Loading filters...</div>;
   *   
   *   return (
   *     <div className="space-y-4">
   *       <div>
   *         <h3>Document Types</h3>
   *         {facets.documentTypes.map(type => (
   *           <label key={type.value} className="flex items-center">
   *             <input type="checkbox" value={type.value} />
   *             <span>{type.label} ({type.count})</span>
   *           </label>
   *         ))}
   *       </div>
   *       <div>
   *         <h3>Authors</h3>
   *         {facets.authors.map(author => (
   *           <label key={author.value}>
   *             <input type="checkbox" value={author.value} />
   *             {author.label} ({author.count})
   *           </label>
   *         ))}
   *       </div>
   *     </div>
   *   );
   * };
   * ```
   * 
   * @example
   * ```typescript
   * // Use facets for search analytics
   * const analyzeSearchSpace = async () => {
   *   const facets = await searchApi.getSearchFacets();
   *   
   *   const totalDocs = facets.documentTypes
   *     .filter(type => type.value !== 'all')
   *     .reduce((sum, type) => sum + type.count, 0);
   *   
   *   const topAuthors = facets.authors
   *     .sort((a, b) => b.count - a.count)
   *     .slice(0, 5);
   *   
   *   const mostCommonType = facets.documentTypes
   *     .filter(type => type.value !== 'all')
   *     .sort((a, b) => b.count - a.count)[0];
   *   
   *   console.log(`Total documents: ${totalDocs}`);
   *   console.log(`Most common type: ${mostCommonType.label} (${mostCommonType.count})`);
   *   console.log('Top authors:', topAuthors);
   * };
   * ```
   */
  async getSearchFacets(_query?: string): Promise<{
    /** Document types with result counts */
    documentTypes: Array<{ value: string; label: string; count: number }>;
    /** Available date range filters */
    dateRanges: Array<{ value: string; label: string }>;
    /** Authors with document counts */
    authors: Array<{ value: string; label: string; count: number }>;
    /** Realms with document counts */
    realms: Array<{ value: string; label: string; count: number }>;
  }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      documentTypes: [
        { value: 'all', label: 'All Types', count: 55 },
        { value: 'pdf', label: 'PDF Documents', count: 15 },
        { value: 'docx', label: 'Word Documents', count: 12 },
        { value: 'pptx', label: 'Presentations', count: 10 },
        { value: 'xlsx', label: 'Spreadsheets', count: 8 },
        { value: 'image', label: 'Images', count: 4 },
        { value: 'video', label: 'Videos', count: 3 },
        { value: 'audio', label: 'Audio Files', count: 2 },
        { value: 'webpage', label: 'Web Pages', count: 1 }
      ],
      dateRanges: [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'last-week', label: 'Last Week' },
        { value: 'last-month', label: 'Last Month' },
        { value: 'last-3-months', label: 'Last 3 Months' },
        { value: 'last-year', label: 'Last Year' },
        { value: 'custom', label: 'Custom Range' }
      ],
      authors: [
        { value: 'sarah-johnson', label: 'Sarah Johnson', count: 3 },
        { value: 'dr-alex-chen', label: 'Dr. Alex Chen', count: 2 },
        { value: 'mike-rodriguez', label: 'Mike Rodriguez', count: 2 },
        { value: 'jennifer-liu', label: 'Jennifer Liu', count: 1 },
        { value: 'tom-wilson', label: 'Tom Wilson', count: 1 }
      ],
      realms: [
        { value: 'engineering', label: 'Engineering', count: 12 },
        { value: 'finance', label: 'Corporate Finance', count: 8 },
        { value: 'hr', label: 'Human Resources', count: 6 },
        { value: 'product', label: 'Product Management', count: 5 },
        { value: 'marketing', label: 'Marketing', count: 4 }
      ]
    };
  }
}

/**
 * Singleton instance of SearchApi for application use
 * 
 * Pre-configured search API instance ready for use throughout the application.
 * Provides all search functionality with automatic caching and error handling.
 * 
 * @example
 * ```typescript
 * import { searchApi } from '@/lib/api/searchApi';
 * 
 * // Use directly in components
 * const MyComponent = () => {
 *   const [results, setResults] = useState([]);
 *   
 *   const handleSearch = async (query: string) => {
 *     const response = await searchApi.searchDocuments({
 *       query,
 *       filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' }
 *     });
 *     setResults(response.results);
 *   };
 * };
 * ```
 */
export const searchApi = new SearchApi();

/**
 * Convenience function for document search
 * 
 * @param request - Search request parameters
 * @returns Promise resolving to search results
 * 
 * @example
 * ```typescript
 * import { searchDocuments } from '@/lib/api/searchApi';
 * 
 * const results = await searchDocuments({
 *   query: "API documentation",
 *   filters: { documentType: 'webpage', dateRange: 'all', sortBy: 'relevance' }
 * });
 * ```
 */
export const searchDocuments = (request: SearchRequest) => searchApi.searchDocuments(request);

/**
 * Convenience function for getting search suggestions
 * 
 * @param query - Partial search query
 * @returns Promise resolving to suggestion array
 * 
 * @example
 * ```typescript
 * import { getSuggestions } from '@/lib/api/searchApi';
 * 
 * const suggestions = await getSuggestions("machine");
 * // Returns: ["machine learning", "machine vision"]
 * ```
 */
export const getSuggestions = (query: string) => searchApi.getSuggestions(query);

/**
 * Convenience function for getting search facets
 * 
 * @param query - Optional query to filter facets
 * @returns Promise resolving to facet data
 * 
 * @example
 * ```typescript
 * import { getSearchFacets } from '@/lib/api/searchApi';
 * 
 * const facets = await getSearchFacets();
 * const pdfCount = facets.documentTypes.find(t => t.value === 'pdf')?.count || 0;
 * ```
 */
export const getSearchFacets = (query?: string) => searchApi.getSearchFacets(query);

/**
 * Convenience function for clearing search cache
 * 
 * @example
 * ```typescript
 * import { clearSearchCache } from '@/lib/api/searchApi';
 * 
 * // Clear cache when context changes
 * const handleRealmSwitch = () => {
 *   clearSearchCache();
 *   // Load new realm data
 * };
 * ```
 */
export const clearSearchCache = () => searchApi.clearCache();

export default searchApi;