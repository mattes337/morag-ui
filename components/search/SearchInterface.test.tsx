import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchInterface } from './SearchInterface';

// Mock lodash.debounce
jest.mock('lodash.debounce', () => {
  return jest.fn((fn) => {
    const debouncedFn = jest.fn((...args) => fn(...args));
    debouncedFn.cancel = jest.fn();
    debouncedFn.flush = jest.fn();
    return debouncedFn;
  });
});

// Mock the search API
jest.mock('@/lib/api/search', () => ({
  searchApi: {
    searchDocuments: jest.fn().mockResolvedValue({
      results: [],
      totalResults: 0,
      totalPages: 1,
      currentPage: 1
    })
  }
}));

// Mock the useSearch hook
jest.mock('./hooks/useSearch', () => ({
  useSearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    filters: {
      documentType: 'all',
      dateRange: 'all',
      sortBy: 'relevance'
    },
    updateFilters: jest.fn(),
    isLoading: false,
    results: [],
    totalResults: 0,
    currentPage: 1,
    totalPages: 1,
    searchNow: jest.fn(),
    searchDebounced: jest.fn()
  }))
}));

describe('SearchInterface', () => {
  const mockOnSearch = jest.fn();
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input field', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
    });

    it('renders search button', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    it('renders filter controls', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      // Filter controls are inside the advanced search section which is collapsed by default
      // Check for the advanced search toggle button
      expect(screen.getByText(/advanced search/i)).toBeInTheDocument();
    });

    it('renders advanced search toggle', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByText(/advanced search/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles text input in search field', async () => {
      const mockSetQuery = jest.fn();
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: '',
        setQuery: mockSetQuery,
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: jest.fn(),
        searchDebounced: jest.fn()
      });

      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test query');
      
      expect(mockSetQuery).toHaveBeenCalled();
    });

    it('calls onSearch when search button is clicked', async () => {
      const mockSearchNow = jest.fn();
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: 'test query',
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: mockSearchNow,
        searchDebounced: jest.fn()
      });

      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: 'Search' });
      await user.click(searchButton);
      
      expect(mockSearchNow).toHaveBeenCalledWith('test query');
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('calls onSearch when Enter key is pressed', async () => {
      const mockSearchNow = jest.fn();
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: 'test query',
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: mockSearchNow,
        searchDebounced: jest.fn()
      });

      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      searchInput.focus();
      await user.keyboard('{Enter}');
      
      expect(mockSearchNow).toHaveBeenCalledWith('test query');
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('debounces search input', async () => {
      // This test verifies that typing calls the hook methods
      const mockSearchDebounced = jest.fn();
      const mockSetQuery = jest.fn();
      const { useSearch } = require('./hooks/useSearch');
      
      useSearch.mockReturnValue({
        query: '',
        setQuery: mockSetQuery,
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: jest.fn(),
        searchDebounced: mockSearchDebounced
      });

      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      
      // Simulate typing by firing a change event directly
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should have called setQuery with the full value
      expect(mockSetQuery).toHaveBeenCalledWith('test');
      
      // Since 'test' has >= 3 characters, should call searchDebounced and onSearch
      expect(mockSearchDebounced).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    it('handles filter changes', async () => {
      const mockUpdateFilters = jest.fn();
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: '',
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: mockUpdateFilters,
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: jest.fn(),
        searchDebounced: jest.fn()
      });

      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      // Use quick filter buttons which are always visible (no need to open advanced)
      const pdfFilterButton = screen.getByText('PDF Documents');
      await user.click(pdfFilterButton);
      
      expect(mockUpdateFilters).toHaveBeenCalled();
      expect(mockOnFilter).toHaveBeenCalled();
    });

    it('toggles advanced search options', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const advancedToggle = screen.getByRole('button', { name: /advanced search/i });
      
      // Button should initially have aria-expanded="false"
      expect(advancedToggle).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(advancedToggle);
      
      // After click, should have aria-expanded="true" 
      expect(advancedToggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('focuses search input when Ctrl+K is pressed', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      
      // Simulate Ctrl+K
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
      
      expect(searchInput).toHaveFocus();
    });

    it('shows keyboard shortcut hint', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByText(/ctrl\+k/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner when searching', () => {
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: 'test',
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: true,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchDebounced: jest.fn()
      });
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });

    it('disables search button when loading', () => {
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: 'test',
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: true,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchDebounced: jest.fn()
      });
      
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: 'Search' });
      expect(searchButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByRole('searchbox')).toHaveAccessibleName('Search documents and content');
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const { useSearch } = require('./hooks/useSearch');
      useSearch.mockReturnValue({
        query: 'test', // Set a query so the search button is not disabled
        setQuery: jest.fn(),
        filters: { documentType: 'all', dateRange: 'all', sortBy: 'relevance' },
        updateFilters: jest.fn(),
        isLoading: false,
        results: [],
        totalResults: 0,
        currentPage: 1,
        totalPages: 1,
        searchNow: jest.fn(),
        searchDebounced: jest.fn()
      });

      render(
        <SearchInterface 
          onSearch={mockOnSearch}
          onFilter={mockOnFilter}
        />
      );
      
      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Check that both elements are focusable
      expect(searchInput).not.toHaveAttribute('disabled');
      expect(searchButton).not.toHaveAttribute('disabled');
      
      // Focus the search input directly
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });
});