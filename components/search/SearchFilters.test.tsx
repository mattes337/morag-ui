import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchFilters } from './SearchFilters';

describe('SearchFilters', () => {
  const defaultFilters = {
    documentType: 'all' as const,
    dateRange: 'all' as const,
    sortBy: 'relevance' as const
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders document type filter', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
    });

    it('renders date range filter', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
    });

    it('renders sort by filter', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });

    it('renders reset filters button', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
    });

    it('shows current filter values', () => {
      const customFilters = {
        documentType: 'pdf' as const,
        dateRange: 'last-month' as const,
        sortBy: 'date' as const
      };

      render(
        <SearchFilters
          filters={customFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByDisplayValue('PDF')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Last Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Date')).toBeInTheDocument();
    });
  });

  describe('Document Type Filter', () => {
    it('shows all document type options', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const documentTypeSelect = screen.getByLabelText(/document type/i);
      await user.click(documentTypeSelect);

      expect(screen.getByText('All Types')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('Word Document')).toBeInTheDocument();
      expect(screen.getByText('PowerPoint')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('calls onFiltersChange when document type is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const documentTypeSelect = screen.getByLabelText(/document type/i);
      await user.click(documentTypeSelect);
      
      const pdfOption = screen.getByText('PDF');
      await user.click(pdfOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        documentType: 'pdf'
      });
    });
  });

  describe('Date Range Filter', () => {
    it('shows all date range options', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const dateRangeSelect = screen.getByLabelText(/date range/i);
      await user.click(dateRangeSelect);

      expect(screen.getByText('All Time')).toBeInTheDocument();
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
      expect(screen.getByText('Last Week')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('Last 3 Months')).toBeInTheDocument();
      expect(screen.getByText('Last Year')).toBeInTheDocument();
      expect(screen.getByText('Custom Range')).toBeInTheDocument();
    });

    it('calls onFiltersChange when date range is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const dateRangeSelect = screen.getByLabelText(/date range/i);
      await user.click(dateRangeSelect);
      
      const lastWeekOption = screen.getByText('Last Week');
      await user.click(lastWeekOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        dateRange: 'last-week'
      });
    });

    it('shows custom date picker when custom range is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={{
            ...defaultFilters,
            dateRange: 'custom'
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
    });
  });

  describe('Sort By Filter', () => {
    it('shows all sort options', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const sortBySelect = screen.getByLabelText(/sort by/i);
      await user.click(sortBySelect);

      expect(screen.getByText('Relevance')).toBeInTheDocument();
      expect(screen.getByText('Date (Newest)')).toBeInTheDocument();
      expect(screen.getByText('Date (Oldest)')).toBeInTheDocument();
      expect(screen.getByText('Title (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Title (Z-A)')).toBeInTheDocument();
    });

    it('calls onFiltersChange when sort option is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const sortBySelect = screen.getByLabelText(/sort by/i);
      await user.click(sortBySelect);
      
      const dateOption = screen.getByText('Date (Newest)');
      await user.click(dateOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'date-desc'
      });
    });
  });

  describe('Filter Actions', () => {
    it('resets filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      
      const customFilters = {
        documentType: 'pdf' as const,
        dateRange: 'last-month' as const,
        sortBy: 'date' as const
      };

      render(
        <SearchFilters
          filters={customFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset filters/i });
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        documentType: 'all',
        dateRange: 'all',
        sortBy: 'relevance'
      });
    });

    it('shows active filter count when filters are applied', () => {
      const customFilters = {
        documentType: 'pdf' as const,
        dateRange: 'last-month' as const,
        sortBy: 'relevance' as const
      };

      render(
        <SearchFilters
          filters={customFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByText('2 filters active')).toBeInTheDocument();
    });

    it('hides active filter count when no filters are applied', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.queryByText(/filters active/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders in compact mode on mobile', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByTestId('mobile-filters')).toBeInTheDocument();
    });

    it('shows filter drawer toggle on mobile', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels and descriptions', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Tab through filters
      await user.tab();
      expect(screen.getByLabelText(/document type/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/date range/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/sort by/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /reset filters/i })).toHaveFocus();
    });

    it('announces filter changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <SearchFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const documentTypeSelect = screen.getByLabelText(/document type/i);
      await user.click(documentTypeSelect);
      
      const pdfOption = screen.getByText('PDF');
      await user.click(pdfOption);

      expect(screen.getByLabelText(/document type.*pdf/i)).toBeInTheDocument();
    });
  });
});