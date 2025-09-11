'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { TimeRangeSelector, TimeRange } from './TimeRangeSelector'
import { 
  Filter,
  X,
  Search,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnalyticsFiltersState {
  timeRange: TimeRange
  realm?: string
  metric?: string
  searchQuery?: string
  documentType?: string
  status?: string
  customFilters?: Record<string, any>
}

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState
  onFiltersChange: (filters: AnalyticsFiltersState) => void
  realms?: FilterOption[]
  metrics?: FilterOption[]
  documentTypes?: FilterOption[]
  statuses?: FilterOption[]
  className?: string
  showSearch?: boolean
  showReset?: boolean
  placeholder?: string
}

const defaultMetrics: FilterOption[] = [
  { label: 'Documents Processed', value: 'documents_processed', count: 1247 },
  { label: 'Search Queries', value: 'search_queries', count: 5832 },
  { label: 'Active Users', value: 'active_users', count: 28 },
  { label: 'Processing Time', value: 'processing_time' },
  { label: 'Success Rate', value: 'success_rate' },
  { label: 'Storage Usage', value: 'storage_usage' },
]

const defaultDocumentTypes: FilterOption[] = [
  { label: 'PDF Documents', value: 'pdf', count: 542 },
  { label: 'Word Documents', value: 'docx', count: 298 },
  { label: 'Text Files', value: 'txt', count: 156 },
  { label: 'Markdown', value: 'md', count: 89 },
  { label: 'HTML', value: 'html', count: 34 },
]

const defaultStatuses: FilterOption[] = [
  { label: 'Completed', value: 'completed', count: 1189 },
  { label: 'Processing', value: 'processing', count: 23 },
  { label: 'Failed', value: 'failed', count: 15 },
  { label: 'Queued', value: 'queued', count: 8 },
]

/**
 * AnalyticsFilters component - Multi-criteria filtering for analytics
 * 
 * Features:
 * - Time range selection with predefined periods
 * - Realm filtering for multi-tenant environments
 * - Metric type selection for focused analysis
 * - Document type and status filtering
 * - Search functionality across data
 * - Active filter badges with individual removal
 * - Reset all filters functionality
 * - Responsive design with collapsible mobile view
 * - Accessibility support with proper ARIA labels
 */
export function AnalyticsFilters({
  filters,
  onFiltersChange,
  realms = [],
  metrics = defaultMetrics,
  documentTypes = defaultDocumentTypes,
  statuses = defaultStatuses,
  className,
  showSearch = true,
  showReset = true,
  placeholder = "Search analytics data...",
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Update individual filter
  const updateFilter = useCallback((key: keyof AnalyticsFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }, [filters, onFiltersChange])

  // Remove individual filter
  const removeFilter = useCallback((key: keyof AnalyticsFiltersState) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  // Reset all filters
  const resetFilters = useCallback(() => {
    onFiltersChange({
      timeRange: filters.timeRange, // Keep time range
    })
  }, [filters.timeRange, onFiltersChange])

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.realm) count++
    if (filters.metric) count++
    if (filters.searchQuery) count++
    if (filters.documentType) count++
    if (filters.status) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Get filter display value
  const getFilterDisplayValue = (options: FilterOption[], value?: string) => {
    return options.find(option => option.value === value)?.label || value
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Time Range */}
        <div className="flex-shrink-0">
          <TimeRangeSelector
            value={filters.timeRange}
            onChange={(timeRange) => updateFilter('timeRange', timeRange)}
            size="default"
          />
        </div>

        {/* Search */}
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={filters.searchQuery || ''}
              onChange={(e) => updateFilter('searchQuery', e.target.value || undefined)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="default"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Reset Filters */}
        {showReset && activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="default"
            onClick={resetFilters}
            className="flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          {/* Realm Filter */}
          {realms.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="realm-select" className="text-sm font-medium text-muted-foreground">
                Realm
              </label>
              <Select
                value={filters.realm || ''}
                onValueChange={(value) => updateFilter('realm', value || undefined)}
              >
                <SelectTrigger id="realm-select" aria-labelledby="realm-select">
                  <SelectValue placeholder="All realms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All realms</SelectItem>
                  {realms.map((realm) => (
                    <SelectItem key={realm.value} value={realm.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{realm.label}</span>
                        {realm.count && (
                          <Badge variant="secondary" className="ml-2">
                            {realm.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Metric Filter */}
          <div className="space-y-2">
            <label htmlFor="metric-select" className="text-sm font-medium text-muted-foreground">
              Metric
            </label>
            <Select
              value={filters.metric || ''}
              onValueChange={(value) => updateFilter('metric', value || undefined)}
            >
              <SelectTrigger id="metric-select" aria-labelledby="metric-select">
                <SelectValue placeholder="All metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All metrics</SelectItem>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{metric.label}</span>
                      {metric.count && (
                        <Badge variant="secondary" className="ml-2">
                          {metric.count.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Filter */}
          <div className="space-y-2">
            <label htmlFor="document-type-select" className="text-sm font-medium text-muted-foreground">
              Document Type
            </label>
            <Select
              value={filters.documentType || ''}
              onValueChange={(value) => updateFilter('documentType', value || undefined)}
            >
              <SelectTrigger id="document-type-select" aria-labelledby="document-type-select">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      {type.count && (
                        <Badge variant="secondary" className="ml-2">
                          {type.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label htmlFor="status-select" className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => updateFilter('status', value || undefined)}
            >
              <SelectTrigger id="status-select" aria-labelledby="status-select">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{status.label}</span>
                      {status.count && (
                        <Badge variant="secondary" className="ml-2">
                          {status.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            Active filters:
          </span>
          
          {filters.realm && (
            <Badge variant="secondary" className="gap-1">
              Realm: {getFilterDisplayValue(realms, filters.realm)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('realm')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.metric && (
            <Badge variant="secondary" className="gap-1">
              Metric: {getFilterDisplayValue(metrics, filters.metric)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('metric')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('searchQuery')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.documentType && (
            <Badge variant="secondary" className="gap-1">
              Type: {getFilterDisplayValue(documentTypes, filters.documentType)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('documentType')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {getFilterDisplayValue(statuses, filters.status)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

