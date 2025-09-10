// Additional search-specific mock data and utilities
// This file complements searchMockData.ts with extra functionality

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'document' | 'author' | 'tag';
  frequency: number;
  category?: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters?: any;
}

export interface PopularSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock search suggestions for autocomplete
export const searchSuggestions: SearchSuggestion[] = [
  // Query suggestions
  { id: '1', text: 'financial report 2024', type: 'query', frequency: 125, category: 'finance' },
  { id: '2', text: 'machine learning best practices', type: 'query', frequency: 98, category: 'technical' },
  { id: '3', text: 'product roadmap', type: 'query', frequency: 87, category: 'product' },
  { id: '4', text: 'security incident response', type: 'query', frequency: 76, category: 'security' },
  { id: '5', text: 'employee handbook', type: 'query', frequency: 65, category: 'hr' },
  { id: '6', text: 'market research analysis', type: 'query', frequency: 54, category: 'business' },
  { id: '7', text: 'API documentation', type: 'query', frequency: 48, category: 'technical' },
  { id: '8', text: 'customer feedback survey', type: 'query', frequency: 42, category: 'customer' },
  { id: '9', text: 'budget allocation', type: 'query', frequency: 39, category: 'finance' },
  { id: '10', text: 'performance metrics', type: 'query', frequency: 36, category: 'analytics' },

  // Document suggestions
  { id: '11', text: 'Q4 Financial Report 2024', type: 'document', frequency: 89, category: 'finance' },
  { id: '12', text: 'Machine Learning Best Practices Guide', type: 'document', frequency: 67, category: 'technical' },
  { id: '13', text: 'Product Roadmap Presentation', type: 'document', frequency: 45, category: 'product' },
  { id: '14', text: 'Security Incident Response Plan', type: 'document', frequency: 38, category: 'security' },

  // Author suggestions  
  { id: '15', text: 'Sarah Johnson', type: 'author', frequency: 23, category: 'finance' },
  { id: '16', text: 'Dr. Alex Chen', type: 'author', frequency: 19, category: 'technical' },
  { id: '17', text: 'Mike Rodriguez', type: 'author', frequency: 17, category: 'product' },
  { id: '18', text: 'Jennifer Liu', type: 'author', frequency: 15, category: 'hr' },

  // Tag suggestions
  { id: '19', text: 'machine-learning', type: 'tag', frequency: 31, category: 'technical' },
  { id: '20', text: 'quarterly-report', type: 'tag', frequency: 28, category: 'finance' },
  { id: '21', text: 'security', type: 'tag', frequency: 25, category: 'security' },
  { id: '22', text: 'product-strategy', type: 'tag', frequency: 22, category: 'product' },
  { id: '23', text: 'employee-handbook', type: 'tag', frequency: 20, category: 'hr' },
];

// Mock search history (would typically be user-specific)
export const searchHistory: SearchHistory[] = [
  {
    id: '1',
    query: 'financial report 2024',
    timestamp: new Date('2024-01-16T10:30:00Z'),
    resultsCount: 12,
    filters: { documentType: 'pdf', dateRange: 'last-month' }
  },
  {
    id: '2',
    query: 'machine learning',
    timestamp: new Date('2024-01-15T14:20:00Z'),
    resultsCount: 8,
    filters: { documentType: 'all', dateRange: 'all' }
  },
  {
    id: '3',
    query: 'product roadmap',
    timestamp: new Date('2024-01-14T09:15:00Z'),
    resultsCount: 5,
    filters: { documentType: 'pptx', dateRange: 'last-week' }
  },
  {
    id: '4',
    query: 'security incident',
    timestamp: new Date('2024-01-13T16:45:00Z'),
    resultsCount: 3,
    filters: { documentType: 'docx', dateRange: 'all' }
  },
  {
    id: '5',
    query: 'employee survey',
    timestamp: new Date('2024-01-12T11:30:00Z'),
    resultsCount: 7,
    filters: { documentType: 'xlsx', dateRange: 'last-3-months' }
  }
];

// Popular searches across all users
export const popularSearches: PopularSearch[] = [
  { query: 'financial report', count: 234, trend: 'up' },
  { query: 'machine learning', count: 198, trend: 'stable' },
  { query: 'product roadmap', count: 167, trend: 'up' },
  { query: 'security incident', count: 145, trend: 'down' },
  { query: 'employee handbook', count: 132, trend: 'stable' },
  { query: 'market research', count: 121, trend: 'up' },
  { query: 'API documentation', count: 109, trend: 'up' },
  { query: 'customer feedback', count: 98, trend: 'stable' },
  { query: 'budget allocation', count: 87, trend: 'down' },
  { query: 'performance metrics', count: 76, trend: 'stable' }
];

// Search analytics data
export interface SearchAnalytics {
  totalSearches: number;
  averageResultsPerSearch: number;
  topQueries: PopularSearch[];
  searchSuccessRate: number;
  averageSearchTime: number;
  popularFilters: Array<{ filter: string; usage: number }>;
}

export const searchAnalytics: SearchAnalytics = {
  totalSearches: 1547,
  averageResultsPerSearch: 8.3,
  topQueries: popularSearches,
  searchSuccessRate: 0.92, // 92% of searches return results
  averageSearchTime: 0.34, // seconds
  popularFilters: [
    { filter: 'documentType:pdf', usage: 342 },
    { filter: 'dateRange:last-month', usage: 298 },
    { filter: 'sortBy:relevance', usage: 1201 },
    { filter: 'documentType:docx', usage: 234 },
    { filter: 'dateRange:last-week', usage: 189 }
  ]
};

// Utility functions for search data

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(
  partialQuery: string, 
  maxResults: number = 5,
  types?: Array<'query' | 'document' | 'author' | 'tag'>
): SearchSuggestion[] {
  if (!partialQuery.trim()) return [];

  const query = partialQuery.toLowerCase();
  let filtered = searchSuggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(query)
  );

  // Filter by types if specified
  if (types && types.length > 0) {
    filtered = filtered.filter(suggestion => types.includes(suggestion.type));
  }

  // Sort by frequency (descending) and relevance
  return filtered
    .sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aStartsWith = a.text.toLowerCase().startsWith(query);
      const bStartsWith = b.text.toLowerCase().startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort by frequency
      return b.frequency - a.frequency;
    })
    .slice(0, maxResults);
}

/**
 * Get user's recent search history
 */
export function getRecentSearches(limit: number = 5): SearchHistory[] {
  return searchHistory
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Add a search to history (in a real app, this would persist to backend)
 */
export function addToSearchHistory(
  query: string, 
  resultsCount: number, 
  filters?: any
): void {
  const newSearch: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date(),
    resultsCount,
    filters
  };
  
  searchHistory.unshift(newSearch);
  
  // Keep only last 50 searches
  if (searchHistory.length > 50) {
    searchHistory.splice(50);
  }
}

/**
 * Get trending searches
 */
export function getTrendingSearches(limit: number = 10): PopularSearch[] {
  return popularSearches
    .filter(search => search.trend === 'up')
    .slice(0, limit);
}

/**
 * Simulate search result highlighting
 */
export function highlightSearchTerms(
  text: string, 
  query: string, 
  className: string = 'highlight'
): string {
  if (!query.trim()) return text;
  
  const terms = query.split(' ').filter(term => term.length > 0);
  let highlightedText = text;
  
  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      `<mark class="${className}">$1</mark>`
    );
  });
  
  return highlightedText;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate search result excerpt with highlighted terms
 */
export function generateSearchExcerpt(
  content: string, 
  query: string, 
  maxLength: number = 200
): string {
  if (!query.trim()) {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
  
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Find the best position to start the excerpt (around first match)
  const firstMatch = contentLower.indexOf(queryLower);
  
  if (firstMatch === -1) {
    // No exact match, return beginning
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
  
  // Calculate excerpt boundaries to center around the match
  const start = Math.max(0, firstMatch - Math.floor((maxLength - query.length) / 2));
  const end = Math.min(content.length, start + maxLength);
  
  let excerpt = content.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
}

const searchDataExports = {
  searchSuggestions,
  searchHistory,
  popularSearches,
  searchAnalytics,
  getSearchSuggestions,
  getRecentSearches,
  addToSearchHistory,
  getTrendingSearches,
  highlightSearchTerms,
  generateSearchExcerpt
};

export default searchDataExports;