import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResultsVirtualized } from './SearchResultsVirtualized';
import { SearchResult } from '@/lib/mockData/searchMockData';

// Mock react-window
const mockReact = require('react');

jest.mock('react-window', () => ({
  FixedSizeList: mockReact.forwardRef(({ children, itemData, itemCount, itemSize }: any, ref: any) => {
    // Render a simplified version for testing
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 5); i++) { // Render only first 5 items for testing
      items.push(
        mockReact.createElement('div', 
          { key: i, style: { height: itemSize } },
          children({ index: i, style: { height: itemSize }, data: itemData })
        )
      );
    }
    return mockReact.createElement('div', { 'data-testid': 'virtualized-list', ref }, items);
  })
}));

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Test Document 1',
    excerpt: 'This is a test document excerpt with some content',
    documentType: 'pdf',
    relevanceScore: 0.95,
    author: 'John Doe',
    dateCreated: '2023-01-01T00:00:00Z',
    realm: 'test-realm'
  },
  {
    id: '2',
    title: 'Another Test Document',
    excerpt: 'Another excerpt for testing purposes',
    documentType: 'document',
    relevanceScore: 0.87,
    author: 'Jane Smith',
    dateCreated: '2023-01-02T00:00:00Z',
    realm: 'test-realm'
  },
  {
    id: '3',
    title: 'Audio File Test',
    excerpt: 'Transcript of an audio file',
    documentType: 'audio',
    relevanceScore: 0.76,
    author: 'Audio Author',
    dateCreated: '2023-01-03T00:00:00Z',
    realm: 'media-realm'
  },
  {
    id: '4',
    title: 'Video Content',
    excerpt: 'Description of video content',
    documentType: 'video',
    relevanceScore: 0.82,
    author: 'Video Creator',
    dateCreated: '2023-01-04T00:00:00Z',
    realm: 'media-realm'
  },
  {
    id: '5',
    title: 'Image Document',
    excerpt: 'OCR extracted text from image',
    documentType: 'image',
    relevanceScore: 0.65,
    author: 'Image Processor',
    dateCreated: '2023-01-05T00:00:00Z',
    realm: 'vision-realm'
  }
];

describe('SearchResultsVirtualized', () => {
  const defaultProps = {
    results: mockResults,
    query: 'test',
    height: 600,
    itemHeight: 140
  };

  it('renders without crashing', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });

  it('displays results count header', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
    expect(screen.getByText(/for "test"/)).toBeInTheDocument();
  });

  it('renders result items with correct content', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Another Test Document')).toBeInTheDocument();
    expect(screen.getByText(/This is a test document excerpt/)).toBeInTheDocument();
  });

  it('highlights search query in title and excerpt', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    const highlights = screen.getAllByText('test');
    expect(highlights.length).toBeGreaterThan(0);
    
    // Check if the highlighted text has the correct styling
    const firstHighlight = highlights[0];
    expect(firstHighlight).toBeDefined();
    expect(firstHighlight?.tagName).toBe('MARK');
  });

  it('displays file type icons and badges correctly', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('DOCUMENT')).toBeInTheDocument();
    expect(screen.getByText('AUDIO')).toBeInTheDocument();
  });

  it('shows relevance scores', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText('95% match')).toBeInTheDocument();
    expect(screen.getByText('87% match')).toBeInTheDocument();
    expect(screen.getByText('76% match')).toBeInTheDocument();
  });

  it('displays metadata correctly', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('test-realm')).toBeInTheDocument();
    expect(screen.getByText('media-realm')).toBeInTheDocument();
  });

  it('calls onResultClick when result is clicked', () => {
    const onResultClick = jest.fn();
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        onResultClick={onResultClick}
      />
    );
    
    const firstResult = screen.getByText('Test Document 1').closest('div[role="button"], div[tabindex], button, [onclick]') || 
                       screen.getByText('Test Document 1').closest('.cursor-pointer');
    
    if (firstResult) {
      fireEvent.click(firstResult);
      expect(onResultClick).toHaveBeenCalledWith(mockResults[0]);
    }
  });

  it('calls onViewDetails when view details button is clicked', () => {
    const onViewDetails = jest.fn();
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        onViewDetails={onViewDetails}
      />
    );
    
    const viewDetailsButtons = screen.getAllByTitle('View details');
    if (viewDetailsButtons.length > 0) {
      fireEvent.click(viewDetailsButtons[0]);
      expect(onViewDetails).toHaveBeenCalledWith(mockResults[0]);
    }
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        isLoading={true}
      />
    );
    
    // Check for loading skeleton elements
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('animate-pulse')
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no results', () => {
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        results={[]}
      />
    );
    
    expect(screen.getByText(/No results found for "test"/)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
  });

  it('shows empty state without query', () => {
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        results={[]}
        query=""
      />
    );
    
    expect(screen.getByText(/No search results/)).toBeInTheDocument();
    expect(screen.getByText(/Enter a search query/)).toBeInTheDocument();
  });

  it('displays custom empty message', () => {
    const customMessage = 'Custom empty state message';
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        results={[]}
        emptyMessage={customMessage}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2023')).toBeInTheDocument();
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      results: mockResults.slice(0, 2),
      query: 'test'
    };
    
    render(<SearchResultsVirtualized {...minimalProps} />);
    
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Another Test Document')).toBeInTheDocument();
  });

  it('shows performance info in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<SearchResultsVirtualized {...defaultProps} />);
    
    expect(screen.getByText(/Virtualized:/)).toBeInTheDocument();
    expect(screen.getByText(/Rendered:/)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('applies custom className', () => {
    const customClass = 'custom-search-results';
    const { container } = render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        className={customClass}
      />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('handles results without all metadata fields', () => {
    const incompleteResults: SearchResult[] = [
      {
        id: '1',
        title: 'Minimal Document',
        excerpt: 'This document has minimal metadata',
        documentType: 'document',
        relevanceScore: 0.75,
        dateCreated: '2023-01-01T00:00:00Z'
        // Missing author and realm
      }
    ];
    
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        results={incompleteResults}
      />
    );
    
    expect(screen.getByText('Minimal Document')).toBeInTheDocument();
    expect(screen.getByText(/This document has minimal metadata/)).toBeInTheDocument();
  });

  it('handles very long titles and excerpts', () => {
    const longContentResults: SearchResult[] = [
      {
        id: '1',
        title: 'This is a very long title that should be truncated properly when displayed in the search results component to ensure good user experience and layout consistency across different screen sizes and devices',
        excerpt: 'This is a very long excerpt that contains a lot of text and should be properly truncated to ensure that the search results remain readable and the layout does not break even when dealing with documents that have extensive descriptions and content summaries that might be quite lengthy and detailed',
        documentType: 'document',
        relevanceScore: 0.85,
        author: 'Author with a Very Long Name That Might Also Need Truncation',
        dateCreated: '2023-01-01T00:00:00Z',
        realm: 'realm-with-a-very-long-name-that-might-overflow'
      }
    ];
    
    render(
      <SearchResultsVirtualized 
        {...defaultProps} 
        results={longContentResults}
      />
    );
    
    // Should render without breaking layout
    expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    expect(screen.getByText(/This is a very long excerpt/)).toBeInTheDocument();
  });
});