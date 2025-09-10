/**
 * Mock API Client
 * Simulates real API calls with delays, realistic response times, error scenarios
 * Consistent data across calls with 5% failure rate
 */

import { 
  ApiClient, 
  ApiResponse, 
  ApiRequestConfig, 
  ApiError, 
  ApiErrorCode,
  CacheEntry,
  RequestContext 
} from './types';

// Import all mock data modules
import { mockData, validateMockData } from '../mockData';
import * as searchMockData from '../mockData/searchMockData';
import * as documentMockData from '../mockData/documentMockData';
import * as pipelineMockData from '../mockData/pipelineMockData';

class MockApiClient implements ApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private requestId = 0;
  private readonly baseDelay = 100; // Base delay in ms
  private readonly maxDelay = 500; // Max delay in ms
  private readonly errorRate = 0.05; // 5% failure rate

  constructor() {
    // Clear cache periodically to simulate real-world cache expiration
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // Clean every minute
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, config);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const requestId = (++this.requestId).toString();
    const context: RequestContext = {
      signal: config?.signal,
      retryCount: 0,
      startTime: Date.now()
    };

    // Check cache first for GET requests
    if (method === 'GET' && config?.cache !== false) {
      const cached = this.getFromCache<T>(endpoint);
      if (cached) {
        await this.simulateDelay(50); // Faster for cached responses
        return {
          success: true,
          data: cached,
          timestamp: new Date().toISOString(),
          requestId
        };
      }
    }

    // Handle request cancellation
    if (context.signal?.aborted) {
      throw new Error('Request cancelled');
    }

    // Simulate network delay
    const delay = this.calculateDelay();
    await this.simulateDelay(delay);

    // Check for cancellation after delay
    if (context.signal?.aborted) {
      throw new Error('Request cancelled');
    }

    // Simulate errors based on error rate
    if (this.shouldSimulateError()) {
      const error = this.generateRandomError();
      return {
        success: false,
        error,
        timestamp: new Date().toISOString(),
        requestId
      };
    }

    // Generate mock response based on endpoint
    const responseData = await this.generateMockResponse<T>(method, endpoint, data);

    // Cache GET responses
    if (method === 'GET' && config?.cache !== false) {
      this.setCache(endpoint, responseData, config?.cacheTTL || 300000); // 5 min default TTL
    }

    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  private calculateDelay(): number {
    // Realistic response times between 100-500ms with weighted distribution
    const random = Math.random();
    if (random < 0.6) {
      // 60% of requests are fast (100-200ms)
      return this.baseDelay + Math.random() * 100;
    } else if (random < 0.9) {
      // 30% are medium (200-350ms)
      return 200 + Math.random() * 150;
    } else {
      // 10% are slow (350-500ms)
      return 350 + Math.random() * 150;
    }
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.errorRate;
  }

  private generateRandomError(): ApiError {
    const errors = [
      {
        code: ApiErrorCode.NETWORK_ERROR,
        message: 'Network connection failed',
        statusCode: 0
      },
      {
        code: ApiErrorCode.TIMEOUT,
        message: 'Request timeout',
        statusCode: 408
      },
      {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
        statusCode: 500
      },
      {
        code: ApiErrorCode.RATE_LIMITED,
        message: 'Too many requests',
        statusCode: 429
      }
    ];

    return errors[Math.floor(Math.random() * errors.length)];
  }

  private async generateMockResponse<T>(method: string, endpoint: string, data?: any): Promise<T> {
    // Route to specific mock data generators based on endpoint
    
    // Search endpoints
    if (endpoint.includes('/search')) {
      return await this.generateSearchResponse(endpoint, data) as T;
    }
    
    // Document management endpoints
    if (endpoint.includes('/documents')) {
      if (method === 'POST' && endpoint.includes('/upload')) {
        return this.generateDocumentUploadResponse(data) as T;
      }
      if (endpoint.includes('/stats')) {
        return this.generateDocumentStatsResponse() as T;
      }
      return this.generateDocumentListResponse(endpoint) as T;
    }
    
    // Pipeline endpoints
    if (endpoint.includes('/pipeline')) {
      return this.generatePipelineResponse(endpoint) as T;
    }
    
    // User management endpoints
    if (endpoint.includes('/users')) {
      return this.generateUserResponse(endpoint, method, data) as T;
    }
    
    // Realm management endpoints
    if (endpoint.includes('/realms')) {
      return this.generateRealmResponse(endpoint, method, data) as T;
    }
    
    // Analytics endpoints
    if (endpoint.includes('/analytics')) {
      return this.generateAnalyticsResponse(endpoint) as T;
    }
    
    // Job management endpoints
    if (endpoint.includes('/jobs')) {
      return this.generateJobResponse(endpoint, method, data) as T;
    }
    
    // Default fallback
    return this.generateDefaultResponse(endpoint, method, data) as T;
  }

  private async generateSearchResponse(endpoint: string, data?: any): Promise<any> {
    // Extract search parameters from endpoint or data
    const searchQuery = data?.query || data?.q || '';
    const limit = data?.limit || 10;
    const offset = data?.offset || 0;
    
    // Use actual search mock data
    let results = searchMockData.searchResults;
    
    // Apply search filtering if query provided
    if (searchQuery) {
      const searchResult = await searchMockData.simulateSearch(searchQuery, data?.filters || {}, Math.floor(offset / limit) + 1, limit);
      results = searchResult.results;
    }
    
    // Get facets data
    const facets = searchMockData.searchFacets;
    
    return {
      results,
      totalCount: searchMockData.searchResults.length,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(searchMockData.searchResults.length / limit),
      query: searchQuery,
      facets
    };
  }

  private generateDocumentUploadResponse(files?: any): any {
    // Generate document upload response
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      documentId,
      pipelineId,
      status: 'uploaded',
      message: 'Document uploaded successfully and processing started'
    };
  }

  private generateDocumentListResponse(endpoint: string): any {
    // Return actual mock documents
    return documentMockData.mockDocuments;
  }

  private generateDocumentStatsResponse(): any {
    // Return document statistics
    return documentMockData.mockDocumentStats;
  }

  private generatePipelineResponse(endpoint: string): any {
    // Extract pipeline ID from endpoint if present
    const pipelineId = endpoint.split('/').pop();
    
    // Use actual pipeline mock data
    const pipeline = pipelineId ? pipelineMockData.getPipelineById(pipelineId) : pipelineMockData.mockPipelines[0];
    return pipeline || pipelineMockData.mockPipelines[0];
  }

  private generateUserResponse(endpoint: string, method: string, data?: any): any {
    if (method === 'GET') {
      // Extract user ID from endpoint if present
      const userId = endpoint.split('/').pop();
      if (userId && userId !== 'users') {
        return mockData.users.byId(userId);
      }
      return mockData.users.all();
    }
    
    // Default user response
    return { message: 'User operation completed', data: data };
  }

  private generateRealmResponse(endpoint: string, method: string, data?: any): any {
    if (method === 'GET') {
      // Extract realm ID from endpoint if present
      const realmId = endpoint.split('/').pop();
      if (realmId && realmId !== 'realms') {
        return mockData.realms.byId(realmId);
      }
      return mockData.realms.all();
    }
    
    // Default realm response
    return { message: 'Realm operation completed', data: data };
  }

  private generateAnalyticsResponse(endpoint: string): any {
    // Extract realm ID from endpoint if present
    const parts = endpoint.split('/');
    const realmId = parts.find(part => part.startsWith('realm-')) || 'realm-1';
    
    if (endpoint.includes('/global')) {
      return mockData.analytics.global();
    }
    if (endpoint.includes('/dashboard')) {
      return mockData.analytics.dashboard();
    }
    if (endpoint.includes('/health')) {
      return mockData.analytics.systemHealth();
    }
    
    return mockData.analytics.byRealm(realmId);
  }

  private generateJobResponse(endpoint: string, method: string, data?: any): any {
    if (method === 'GET') {
      // Extract job ID from endpoint if present
      const jobId = endpoint.split('/').pop();
      if (jobId && jobId !== 'jobs') {
        return mockData.jobs.byId(jobId);
      }
      if (endpoint.includes('/queue')) {
        return mockData.jobs.queue();
      }
      if (endpoint.includes('/statistics')) {
        return mockData.jobs.statistics();
      }
      return mockData.jobs.all();
    }
    
    // Default job response
    return { message: 'Job operation completed', data: data };
  }

  private generateDefaultResponse(endpoint: string, method: string, data?: any): any {
    return {
      message: `Mock API response for ${method} ${endpoint}`,
      timestamp: new Date().toISOString(),
      data: data || null
    };
  }

  // Cache management methods
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }
}

// Singleton instance
export const mockApiClient = new MockApiClient();
export default mockApiClient;