/**
 * Web Worker for handling heavy search operations
 * 
 * This worker runs search operations in a separate thread to prevent
 * blocking the main UI thread, especially when processing large datasets.
 */

import { SearchResult, SearchFilters } from '@/lib/mockData/searchMockData';

export interface SearchWorkerMessage {
  id: string;
  type: 'SEARCH' | 'FILTER' | 'SORT';
  payload: {
    query: string;
    filters: SearchFilters;
    data: SearchResult[];
    page: number;
    limit: number;
  };
}

export interface SearchWorkerResponse {
  id: string;
  type: 'SEARCH_COMPLETE' | 'ERROR';
  payload: {
    results: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
    processingTime?: number;
  } | {
    error: string;
  };
}

// Check if we're in a worker context
if (typeof self !== 'undefined' && typeof importScripts === 'function') {
  self.onmessage = async (event: MessageEvent<SearchWorkerMessage>) => {
    const startTime = performance.now();
    const { id, type, payload } = event.data;

    try {
      switch (type) {
        case 'SEARCH':
          const result = await performSearchInWorker(
            payload.query,
            payload.filters,
            payload.data,
            payload.page,
            payload.limit
          );
          
          const processingTime = performance.now() - startTime;
          
          const response: SearchWorkerResponse = {
            id,
            type: 'SEARCH_COMPLETE',
            payload: {
              ...result,
              processingTime
            }
          };
          
          self.postMessage(response);
          break;
          
        default:
          throw new Error(`Unknown worker message type: ${type}`);
      }
    } catch (error) {
      const errorResponse: SearchWorkerResponse = {
        id,
        type: 'ERROR',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
      
      self.postMessage(errorResponse);
    }
  };
}

/**
 * Perform search operation in worker thread
 */
async function performSearchInWorker(
  query: string,
  filters: SearchFilters,
  data: SearchResult[],
  page: number = 1,
  limit: number = 10
) {
  // Normalize query for better matching
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
  
  // Step 1: Filter by document type
  let filteredResults = data;
  if (filters.documentType && filters.documentType !== 'all') {
    filteredResults = filteredResults.filter(result => 
      result.documentType === filters.documentType
    );
  }
  
  // Step 2: Filter by date range
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let dateThreshold: Date;
    
    switch (filters.dateRange) {
      case 'today':
        dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last-week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-month':
        dateThreshold = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'last-3-months':
        dateThreshold = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last-year':
        dateThreshold = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        dateThreshold = new Date(0); // No filtering
    }
    
    if (filters.dateRange !== 'custom') {
      filteredResults = filteredResults.filter(result => 
        new Date(result.createdAt) >= dateThreshold
      );
    }
  }
  
  // Step 3: Search and score results (chunked to prevent blocking)
  let searchResults: (SearchResult & { score: number })[] = [];
  
  if (queryWords.length > 0) {
    const chunkSize = 50; // Process in chunks to yield control
    
    for (let i = 0; i < filteredResults.length; i += chunkSize) {
      const chunk = filteredResults.slice(i, i + chunkSize);
      
      const chunkResults = chunk.map(result => {
        const score = calculateRelevanceScore(result, queryWords, normalizedQuery);
        return {
          ...result,
          score,
          highlights: extractHighlights(result, queryWords)
        };
      }).filter(result => result.score > 0);
      
      searchResults.push(...chunkResults);
      
      // Yield control every chunk to prevent blocking
      if (i % (chunkSize * 4) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  } else {
    // No query, return all filtered results
    searchResults = filteredResults.map(result => ({
      ...result,
      score: result.relevanceScore
    }));
  }
  
  // Step 4: Sort results
  searchResults.sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'relevance':
      default:
        return b.score - a.score;
    }
  });
  
  // Step 5: Paginate results
  const totalResults = searchResults.length;
  const totalPages = Math.ceil(totalResults / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = searchResults.slice(startIndex, endIndex);
  
  // Remove score from final results
  const finalResults: SearchResult[] = paginatedResults.map(({ score, ...result }) => result);
  
  return {
    results: finalResults,
    totalResults,
    totalPages,
    currentPage: page
  };
}

/**
 * Calculate relevance score for a search result
 */
function calculateRelevanceScore(
  result: SearchResult,
  queryWords: string[],
  fullQuery: string
): number {
  let score = 0;
  
  const titleLower = result.title.toLowerCase();
  const contentLower = result.content.toLowerCase();
  const excerptLower = (result.excerpt || '').toLowerCase();
  const tagsLower = result.metadata.tags.map(tag => tag.toLowerCase());
  const authorLower = (result.metadata.author || '').toLowerCase();
  
  // Exact phrase matching (highest priority)
  if (fullQuery.length > 3) {
    if (titleLower.includes(fullQuery)) score += 100;
    if (contentLower.includes(fullQuery)) score += 50;
    if (excerptLower.includes(fullQuery)) score += 30;
  }
  
  // Individual word matching
  for (const word of queryWords) {
    if (word.length < 2) continue; // Skip very short words
    
    // Title matches (high priority)
    const titleMatches = (titleLower.match(new RegExp(word, 'g')) || []).length;
    score += titleMatches * 20;
    
    // Content matches
    const contentMatches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    score += Math.min(contentMatches, 10) * 5; // Cap to prevent spam
    
    // Excerpt matches
    const excerptMatches = (excerptLower.match(new RegExp(word, 'g')) || []).length;
    score += excerptMatches * 10;
    
    // Tag matches
    const tagMatches = tagsLower.filter(tag => tag.includes(word)).length;
    score += tagMatches * 15;
    
    // Author matches
    if (authorLower.includes(word)) score += 25;
  }
  
  // Boost score based on original relevance
  score *= result.relevanceScore;
  
  return score;
}

/**
 * Extract highlight terms from search result
 */
function extractHighlights(result: SearchResult, queryWords: string[]): string[] {
  const highlights: Set<string> = new Set();
  
  // Add original highlights
  result.highlights.forEach(highlight => highlights.add(highlight));
  
  // Add matching query words
  queryWords.forEach(word => {
    if (word.length >= 2) {
      highlights.add(word);
    }
  });
  
  // Limit highlights to prevent UI performance issues
  return Array.from(highlights).slice(0, 10);
}

// Export for TypeScript compilation
export {};