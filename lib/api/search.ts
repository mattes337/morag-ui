import { SearchResult, SearchFilters, simulateSearchApi } from '@/lib/mockData/searchMockData';

export interface SearchApiParams {
  query: string;
  filters: SearchFilters;
  page?: number;
  limit?: number;
}

export interface SearchApiResponse {
  results: SearchResult[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}

export const searchApi = {
  searchDocuments: async ({
    query,
    filters,
    page = 1,
    limit = 10
  }: SearchApiParams): Promise<SearchApiResponse> => {
    // For now, use mock data. In production, this would call actual API endpoints
    return simulateSearchApi(query, filters, page, limit);
  }
};

export default searchApi;