import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchResults } from './SearchResults';
import { SearchResult } from '@/lib/mockData/searchMockData';

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Document 1',
    content: 'This is the content of document 1',
    documentType: 'pdf' as const,
    createdAt: '2024-01-15T10:00:00Z',
    relevanceScore: 0.95,
    highlights: ['content'],
    metadata: {
      author: 'John Doe',
      tags: ['important', 'research']
    }
  },
  {
    id: '2',
    title: 'Document 2',
    content: 'This is the content of document 2',
    documentType: 'docx' as const,
    createdAt: '2024-01-14T09:00:00Z',
    relevanceScore: 0.87,
    highlights: ['document'],
    metadata: {
      author: 'Jane Smith',
      tags: ['analysis']
    }
  }
];

describe('SearchResults', () => {
  const mockOnPageChange = jest.fn();
  const mockOnResultClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search results list', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
    });

    it('shows relevance scores', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('shows document metadata', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('research')).toBeInTheDocument();
    });

    it('shows document types with proper icons', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByTestId('pdf-icon')).toBeInTheDocument();
      expect(screen.getByTestId('docx-icon')).toBeInTheDocument();
    });

    it('shows total results count', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={1}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByText(/25 results/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeletons when loading', () => {
      render(
        <SearchResults
          results={[]}
          totalResults={0}
          currentPage={1}
          totalPages={1}
          isLoading={true}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getAllByTestId('result-skeleton')).toHaveLength(5);
    });

    it('hides pagination when loading', () => {
      render(
        <SearchResults
          results={[]}
          totalResults={0}
          currentPage={1}
          totalPages={3}
          isLoading={true}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no results', () => {
      render(
        <SearchResults
          results={[]}
          totalResults={0}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
    });

    it('shows search suggestions in empty state', () => {
      render(
        <SearchResults
          results={[]}
          totalResults={0}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
          query="nonexistent"
        />
      );

      expect(screen.getByText(/try different keywords/i)).toBeInTheDocument();
      expect(screen.getByText(/check spelling/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onResultClick when result is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      const firstResult = screen.getByText('Document 1');
      await user.click(firstResult);

      expect(mockOnResultClick).toHaveBeenCalledWith(mockResults[0]);
    });

    it('supports keyboard navigation for results', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      const firstResult = screen.getByRole('button', { name: /document 1/i });
      const secondResult = screen.getByRole('button', { name: /document 2/i });

      await user.tab();
      expect(firstResult).toHaveFocus();

      await user.tab();
      expect(secondResult).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnResultClick).toHaveBeenCalledWith(mockResults[1]);
    });
  });

  describe('Pagination', () => {
    it('renders pagination controls when multiple pages', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={1}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('calls onPageChange when page is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={1}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      const page2Button = screen.getByRole('button', { name: '2' });
      await user.click(page2Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('disables previous button on first page', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={1}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={3}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('hides pagination when single page', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
    });
  });

  describe('Content Highlighting', () => {
    it('highlights search terms in content', () => {
      const firstResult = mockResults[0];
      expect(firstResult).toBeDefined();
      const resultsWithHighlights: SearchResult[] = [{
        id: firstResult!.id,
        title: firstResult!.title,
        content: firstResult!.content,
        documentType: firstResult!.documentType,
        createdAt: firstResult!.createdAt,
        relevanceScore: firstResult!.relevanceScore,
        metadata: firstResult!.metadata,
        highlights: ['content', 'document']
      }];

      render(
        <SearchResults
          results={resultsWithHighlights}
          totalResults={1}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
          query="content document"
        />
      );

      expect(screen.getAllByTestId('highlight-content')).toHaveLength(2);
    });

    it('shows excerpt with highlighted terms', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getAllByText(/this is the content/i)).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('announces total results for screen readers', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={25}
          currentPage={1}
          totalPages={3}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByLabelText(/25 search results/i)).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(
        <SearchResults
          results={mockResults}
          totalResults={2}
          currentPage={1}
          totalPages={1}
          isLoading={false}
          onPageChange={mockOnPageChange}
          onResultClick={mockOnResultClick}
        />
      );

      expect(screen.getByRole('heading', { name: 'Document 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Document 2' })).toBeInTheDocument();
    });
  });
});