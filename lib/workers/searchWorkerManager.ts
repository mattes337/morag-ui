/**
 * Web Worker Manager for Search Operations
 * 
 * Manages web worker lifecycle and provides a clean API for offloading
 * heavy search operations to prevent main thread blocking.
 */

import { SearchResult, SearchFilters } from '@/lib/mockData/searchMockData';
import { SearchWorkerMessage, SearchWorkerResponse } from './searchWorker';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: NodeJS.Timeout;
}

export class SearchWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (typeof window === 'undefined' || !window.Worker) {
      console.warn('Web Workers not supported, falling back to main thread');
      return;
    }

    try {
      // Create worker from the searchWorker file
      const workerBlob = new Blob([this.getWorkerScript()], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(workerBlob);
      
      this.worker = new Worker(workerUrl);
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
      
      this.isInitialized = true;
      
      // Clean up URL after worker is created
      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.warn('Failed to initialize search worker:', error);
      this.worker = null;
    }
  }

  private getWorkerScript(): string {
    // This would normally be the compiled worker script
    // For now, we'll include the worker logic inline
    return `
      // Minimal worker implementation for search operations
      const performSearchInWorker = async (query, filters, data, page, limit) => {
        const normalizedQuery = query.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\\s+/).filter(word => word.length > 0);
        
        // Filter by document type
        let filteredResults = data;
        if (filters.documentType && filters.documentType !== 'all') {
          filteredResults = filteredResults.filter(result => 
            result.documentType === filters.documentType
          );
        }
        
        // Filter by date range
        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          let dateThreshold;
          
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
              dateThreshold = new Date(0);
          }
          
          if (filters.dateRange !== 'custom') {
            filteredResults = filteredResults.filter(result => 
              new Date(result.createdAt) >= dateThreshold
            );
          }
        }
        
        // Search and score results
        let searchResults = [];
        
        if (queryWords.length > 0) {
          const chunkSize = 50;
          
          for (let i = 0; i < filteredResults.length; i += chunkSize) {
            const chunk = filteredResults.slice(i, i + chunkSize);
            
            const chunkResults = chunk.map(result => {
              let score = 0;
              const titleLower = result.title.toLowerCase();
              const contentLower = result.content.toLowerCase();
              
              // Simple scoring based on query matches
              for (const word of queryWords) {
                if (titleLower.includes(word)) score += 20;
                if (contentLower.includes(word)) score += 5;
              }
              
              score *= result.relevanceScore;
              
              return {
                ...result,
                score,
                highlights: [...result.highlights, ...queryWords.slice(0, 5)]
              };
            }).filter(result => result.score > 0);
            
            searchResults.push(...chunkResults);
            
            // Yield control periodically
            if (i % (chunkSize * 4) === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }
        } else {
          searchResults = filteredResults.map(result => ({
            ...result,
            score: result.relevanceScore
          }));
        }
        
        // Sort results
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
        
        // Paginate
        const totalResults = searchResults.length;
        const totalPages = Math.ceil(totalResults / limit);
        const startIndex = (page - 1) * limit;
        const paginatedResults = searchResults.slice(startIndex, startIndex + limit);
        
        return {
          results: paginatedResults.map(({ score, ...result }) => result),
          totalResults,
          totalPages,
          currentPage: page
        };
      };
      
      self.onmessage = async (event) => {
        const startTime = performance.now();
        const { id, type, payload } = event.data;
        
        try {
          if (type === 'SEARCH') {
            const result = await performSearchInWorker(
              payload.query,
              payload.filters,
              payload.data,
              payload.page,
              payload.limit
            );
            
            self.postMessage({
              id,
              type: 'SEARCH_COMPLETE',
              payload: {
                ...result,
                processingTime: performance.now() - startTime
              }
            });
          }
        } catch (error) {
          self.postMessage({
            id,
            type: 'ERROR',
            payload: { error: error.message || 'Unknown error' }
          });
        }
      };
    `;
  }

  private handleWorkerMessage(event: MessageEvent<SearchWorkerResponse>) {
    const { id, type, payload } = event.data;
    const request = this.pendingRequests.get(id);

    if (!request) return;

    clearTimeout(request.timeout);
    this.pendingRequests.delete(id);

    if (type === 'SEARCH_COMPLETE') {
      request.resolve(payload);
    } else if (type === 'ERROR') {
      request.reject(new Error((payload as any).error));
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Search worker error:', error);
    
    // Reject all pending requests
    this.pendingRequests.forEach(request => {
      clearTimeout(request.timeout);
      request.reject(new Error('Worker error: ' + error.message));
    });
    this.pendingRequests.clear();
  }

  private generateRequestId(): string {
    return `search-${++this.requestIdCounter}-${Date.now()}`;
  }

  /**
   * Perform search operation using web worker
   */
  async searchWithWorker(
    query: string,
    filters: SearchFilters,
    data: SearchResult[],
    page: number = 1,
    limit: number = 10,
    timeoutMs: number = 10000
  ): Promise<{
    results: SearchResult[];
    totalResults: number;
    totalPages: number;
    currentPage: number;
    processingTime?: number;
  }> {
    // Fallback to main thread if worker not available
    if (!this.isInitialized || !this.worker) {
      return this.searchInMainThread(query, filters, data, page, limit);
    }

    const requestId = this.generateRequestId();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Search operation timed out'));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      const message: SearchWorkerMessage = {
        id: requestId,
        type: 'SEARCH',
        payload: {
          query,
          filters,
          data,
          page,
          limit
        }
      };

      this.worker!.postMessage(message);
    });
  }

  /**
   * Fallback search implementation for main thread
   */
  private async searchInMainThread(
    query: string,
    filters: SearchFilters,
    data: SearchResult[],
    page: number,
    limit: number
  ) {
    // Simple implementation for fallback
    const normalizedQuery = query.toLowerCase().trim();
    
    let results = data;
    
    // Basic filtering
    if (filters.documentType && filters.documentType !== 'all') {
      results = results.filter(r => r.documentType === filters.documentType);
    }
    
    // Basic search
    if (normalizedQuery) {
      results = results.filter(r => 
        r.title.toLowerCase().includes(normalizedQuery) ||
        r.content.toLowerCase().includes(normalizedQuery)
      );
    }
    
    // Sort
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'relevance':
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });
    
    // Paginate
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);
    
    return {
      results: paginatedResults,
      totalResults,
      totalPages,
      currentPage: page
    };
  }

  /**
   * Clean up worker and pending requests
   */
  destroy() {
    // Clear all pending requests
    this.pendingRequests.forEach(request => {
      clearTimeout(request.timeout);
      request.reject(new Error('Worker manager destroyed'));
    });
    this.pendingRequests.clear();

    // Terminate worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isInitialized = false;
  }
}

// Singleton instance
let workerManager: SearchWorkerManager | null = null;

export function getSearchWorkerManager(): SearchWorkerManager {
  if (!workerManager) {
    workerManager = new SearchWorkerManager();
    
    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (workerManager) {
          workerManager.destroy();
          workerManager = null;
        }
      });
    }
  }
  
  return workerManager;
}