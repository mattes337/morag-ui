'use client';

import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Label,
  Input,
  Card,
  CardContent,
  Badge
} from '@/components/ui';
import { Filter, X, Calendar } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/lib/mockData/searchMockData';

export interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check for mobile/tablet screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCompact(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const documentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word Document' },
    { value: 'pptx', label: 'PowerPoint' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'image', label: 'Image' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'webpage', label: 'Web Page' },
    { value: 'other', label: 'Other' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Last 24 Hours' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const sortByOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date-desc', label: 'Date (Newest)' },
    { value: 'date-asc', label: 'Date (Oldest)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' }
  ];

  const handleFilterChange = (filterType: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      documentType: 'all',
      dateRange: 'all',
      sortBy: 'relevance'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.documentType !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Mobile/compact view
  if (isCompact) {
    return (
      <div className={`${className}`} data-testid="mobile-filters">
        <Button
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsDrawerOpen(false)}>
            <Card className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-lg border-t" onClick={e => e.stopPropagation()}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <FilterControls
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  documentTypeOptions={documentTypeOptions}
                  dateRangeOptions={dateRangeOptions}
                  sortByOptions={sortByOptions}
                />

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {activeFilterCount} filters active
            </span>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-sm"
          >
            Reset Filters
          </Button>
        )}
      </div>

      <FilterControls
        filters={filters}
        onFilterChange={handleFilterChange}
        documentTypeOptions={documentTypeOptions}
        dateRangeOptions={dateRangeOptions}
        sortByOptions={sortByOptions}
      />
    </div>
  );
};

interface FilterControlsProps {
  filters: SearchFiltersType;
  onFilterChange: (filterType: keyof SearchFiltersType, value: any) => void;
  documentTypeOptions: Array<{ value: string; label: string }>;
  dateRangeOptions: Array<{ value: string; label: string }>;
  sortByOptions: Array<{ value: string; label: string }>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  documentTypeOptions,
  dateRangeOptions,
  sortByOptions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Document Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="document-type">Document Type</Label>
        <Select
          value={filters.documentType}
          onValueChange={(value) => onFilterChange('documentType', value)}
        >
          <SelectTrigger id="document-type" aria-label="Document type filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {documentTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label htmlFor="date-range">Date Range</Label>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => onFilterChange('dateRange', value)}
        >
          <SelectTrigger id="date-range" aria-label="Date range filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By Filter */}
      <div className="space-y-2">
        <Label htmlFor="sort-by">Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger id="sort-by" aria-label="Sort by filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Inputs */}
      {filters.dateRange === 'custom' && (
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="from-date">From Date</Label>
            <div className="relative">
              <Input
                id="from-date"
                type="date"
                value={filters.customDateFrom || ''}
                onChange={(e) => onFilterChange('customDateFrom', e.target.value)}
                className="pr-10"
                aria-label="From date for custom range"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to-date">To Date</Label>
            <div className="relative">
              <Input
                id="to-date"
                type="date"
                value={filters.customDateTo || ''}
                onChange={(e) => onFilterChange('customDateTo', e.target.value)}
                className="pr-10"
                aria-label="To date for custom range"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;