'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  RefreshCw,
  Download,
  Settings2,
  Tag,
  Server,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingJob } from '@/lib/mockData/jobsMockData';
import { JobFilters as JobFiltersType } from '@/lib/hooks/useJobs';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  availableRealms: string[];
  jobStats: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  className?: string;
  compact?: boolean;
  showQuickFilters?: boolean;
}

const STATUS_OPTIONS: Array<{ value: ProcessingJob['status']; label: string; color: string }> = [
  { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  { value: 'queued', label: 'Queued', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'running', label: 'Running', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
];

const PRIORITY_OPTIONS: Array<{ value: ProcessingJob['priority']; label: string; color: string }> = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
];

const TYPE_OPTIONS: Array<{ value: ProcessingJob['type']; label: string }> = [
  { value: 'document_processing', label: 'Document Processing' },
  { value: 'search_indexing', label: 'Search Indexing' },
  { value: 'fact_extraction', label: 'Fact Extraction' },
  { value: 'chunk_generation', label: 'Chunk Generation' },
  { value: 'vector_ingestion', label: 'Vector Ingestion' },
];

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export function JobFilters({
  filters,
  onFiltersChange,
  availableRealms,
  jobStats,
  className,
  compact = false,
  showQuickFilters = true
}: JobFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.dateRange?.start,
    to: filters.dateRange?.end
  });

  const handleFilterChange = useCallback((key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((search: string) => {
    handleFilterChange('search', search || undefined);
  }, [handleFilterChange]);

  const toggleArrayFilter = useCallback((key: keyof JobFiltersType, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  }, [filters, handleFilterChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const applyDateRange = useCallback((days?: number) => {
    if (days === undefined) {
      // Custom date range
      if (dateRange.from && dateRange.to) {
        handleFilterChange('dateRange', {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        });
      }
    } else if (days === 0) {
      // Today
      const today = new Date();
      handleFilterChange('dateRange', {
        start: startOfDay(today),
        end: endOfDay(today)
      });
    } else {
      // Preset range
      const end = new Date();
      const start = subDays(end, days);
      handleFilterChange('dateRange', {
        start: startOfDay(start),
        end: endOfDay(end)
      });
    }
    setIsCalendarOpen(false);
  }, [dateRange, handleFilterChange]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.type?.length) count++;
    if (filters.realm?.length) count++;
    if (filters.dateRange) count++;
    return count;
  };

  const formatDateRange = () => {
    if (!filters.dateRange) return 'All time';
    const { start, end } = filters.dateRange;
    if (start && end) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
    }
    return 'Custom range';
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-background border-b", className)}>
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Status
              {filters.status?.length && (
                <Badge variant="secondary" className="ml-2">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status?.includes(option.value) || false}
                onCheckedChange={() => toggleArrayFilter('status', option.value)}
              >
                <Badge variant="outline" className={cn("mr-2 text-xs", option.color)}>
                  {option.label}
                </Badge>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({getActiveFiltersCount()})
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Job Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={getActiveFiltersCount() === 0}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job name, document, realm, or ID..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Quick Filters */}
        {showQuickFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.status?.includes('running') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleArrayFilter('status', 'running')}
              >
                <Activity className="h-4 w-4 mr-1" />
                Running ({jobStats.running})
              </Button>
              <Button
                variant={filters.status?.includes('failed') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleArrayFilter('status', 'failed')}
              >
                <X className="h-4 w-4 mr-1" />
                Failed ({jobStats.failed})
              </Button>
              <Button
                variant={filters.priority?.includes('urgent') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleArrayFilter('priority', 'urgent')}
              >
                <Star className="h-4 w-4 mr-1" />
                Urgent
              </Button>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={filters.status?.includes(option.value) || false}
                  onChange={() => toggleArrayFilter('status', option.value)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center",
                  filters.status?.includes(option.value) && "bg-primary border-primary"
                )}>
                  {filters.status?.includes(option.value) && (
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  )}
                </div>
                <Badge variant="outline" className={cn("text-xs", option.color)}>
                  {option.label}
                </Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  ({jobStats[option.value] || 0})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(option.value) || false}
                  onChange={() => toggleArrayFilter('priority', option.value)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center",
                  filters.priority?.includes(option.value) && "bg-primary border-primary"
                )}>
                  {filters.priority?.includes(option.value) && (
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  )}
                </div>
                <Badge variant="outline" className={cn("text-xs", option.color)}>
                  {option.label}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        {/* Job Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select
            value={filters.type?.[0] || 'all'}
            onValueChange={(value) => 
              handleFilterChange('type', value === 'all' ? undefined : [value as ProcessingJob['type']])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Realm Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Realm</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Server className="h-4 w-4 mr-2" />
                {filters.realm?.length 
                  ? `${filters.realm.length} realm${filters.realm.length !== 1 ? 's' : ''} selected`
                  : 'All Realms'
                }
                {filters.realm?.length && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.realm.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
              <DropdownMenuLabel>Select Realms</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRealms.map((realm) => (
                <DropdownMenuCheckboxItem
                  key={realm}
                  checked={filters.realm?.includes(realm) || false}
                  onCheckedChange={() => toggleArrayFilter('realm', realm)}
                >
                  <span className="truncate">{realm}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="space-y-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="grid grid-cols-2 gap-2">
                    {DATE_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="ghost"
                        size="sm"
                        onClick={() => applyDateRange(preset.days)}
                        className="justify-start"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    if (range?.from && range?.to) {
                      applyDateRange();
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {filters.dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('dateRange', undefined)}
                className="w-full"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Date Filter
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}