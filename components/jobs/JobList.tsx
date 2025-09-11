'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Calendar,
  ChevronUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdvancedJobs, type JobFilters, type JobSorting } from '@/lib/hooks/useJobs';
import { JobStatus } from './JobStatus';
import { SingleJobActions, BulkJobActions } from './JobActions';
import { JobDetail } from './JobDetail';
import { useRealm } from '@/lib/hooks/useRealm';
import { useRealTimeUpdates } from '@/lib/hooks/useRealTimeUpdates';
import type { ProcessingJob } from '@/lib/mockData/jobsMockData';

interface JobListProps {
  realtimeUpdates?: boolean;
  defaultFilters?: JobFilters;
  defaultSorting?: JobSorting;
  compactView?: boolean;
}

export function JobList({
  realtimeUpdates = true,
  defaultFilters,
  defaultSorting,
  compactView = false
}: JobListProps) {
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // Get current realm context for filtering
  const { currentRealm } = useRealm();

  const {
    jobs,
    loading,
    error,
    statistics,
    realms,
    pagination,
    filters,
    sorting,
    setFilters,
    setSorting,
    setPage,
    refreshJobs,
    cancelJob,
    retryJob,
    deleteJob,
    bulkCancel,
    bulkRetry,
    bulkDelete,
    selectedJobs,
    setSelectedJobs,
    toggleJobSelection,
    selectAllJobs,
    clearSelection
  } = useAdvancedJobs({
    ...(defaultFilters && { filters: defaultFilters }),
    ...(defaultSorting && { sorting: defaultSorting }),
    pagination: { page: 1, limit: 25 },
    realTimeUpdates: realtimeUpdates
  });

  // Sync realm filter with current realm context
  useEffect(() => {
    if (currentRealm && currentRealm.id !== 'global') {
      setFilters({
        ...filters,
        realm: [currentRealm.name]
      });
    } else {
      // Clear realm filter for global view
      const { realm, ...restFilters } = filters;
      setFilters(restFilters);
    }
  }, [currentRealm, setFilters, filters]);

  // Real-time updates integration for job status changes
  const { jobUpdates, connectionState } = useRealTimeUpdates({
    onJobUpdate: (update) => {
      // Refresh jobs list when job statuses change
      refreshJobs();
    },
    onDocumentUpdate: (update) => {
      // Refresh jobs when new documents are uploaded
      if (update.action === 'uploaded') {
        refreshJobs();
      }
    }
  });

  const handleViewJobDetails = useCallback((job: ProcessingJob) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  }, []);

  const handleSortBy = useCallback((field: keyof ProcessingJob) => {
    setSorting({
      field,
      direction: (sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc') as 'asc' | 'desc'
    });
  }, [setSorting, sorting]);

  const handleFilterChange = useCallback((key: keyof JobFilters, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  }, [setFilters, filters]);

  const handleSearchChange = useCallback((search: string) => {
    handleFilterChange('search', search || undefined);
  }, [handleFilterChange]);

  // Statistics summary
  const statusCounts = useMemo(() => {
    return {
      total: statistics.total,
      running: statistics.running,
      completed: statistics.completed,
      failed: statistics.failed,
      pending: statistics.pending,
      queued: statistics.queued,
      cancelled: statistics.cancelled
    };
  }, [statistics]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Error loading jobs</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              onClick={refreshJobs} 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {status === 'total' ? 'Total Jobs' : status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by name, document, realm, or ID..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              <Filter className="h-4 w-4 mr-2" />
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
            {['pending', 'queued', 'running', 'completed', 'failed', 'cancelled'].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.status?.includes(status as any) || false}
                onCheckedChange={(checked) => {
                  const currentStatuses = filters.status || [];
                  const newStatuses = checked
                    ? [...currentStatuses, status as any]
                    : currentStatuses.filter(s => s !== status);
                  handleFilterChange('status', newStatuses.length ? newStatuses : undefined);
                }}
                className="capitalize"
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <Select
          value={filters.priority?.[0] || 'all'}
          onValueChange={(value) => 
            handleFilterChange('priority', value === 'all' ? undefined : [value as any])
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Realm Filter */}
        <Select
          value={filters.realm?.[0] || 'all'}
          onValueChange={(value) =>
            handleFilterChange('realm', value === 'all' ? undefined : [value])
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Realms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Realms</SelectItem>
            {realms.map((realm) => (
              <SelectItem key={realm} value={realm}>
                {realm}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          onClick={refreshJobs}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Bulk Actions */}
      <BulkJobActions
        selectedJobs={selectedJobs}
        totalJobs={jobs.length}
        onBulkCancel={bulkCancel}
        onBulkRetry={bulkRetry}
        onBulkDelete={bulkDelete}
        onSelectAll={selectAllJobs}
        onClearSelection={clearSelection}
      />

      {/* Jobs Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>
              Jobs ({pagination.total.toLocaleString()})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {realtimeUpdates && (
                <Badge variant="outline" className="text-green-600">
                  Live Updates
                </Badge>
              )}
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJobs.length === jobs.length && jobs.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllJobs();
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortBy('name')}
                  >
                    <div className="flex items-center gap-1">
                      Job Name
                      {sorting.field === 'name' && (
                        sorting.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortBy('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sorting.field === 'status' && (
                        sorting.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortBy('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sorting.field === 'type' && (
                        sorting.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Realm</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortBy('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sorting.field === 'createdAt' && (
                        sorting.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {filters.search || filters.status?.length || filters.realm?.length ? 
                          'No jobs found matching your filters' : 
                          'No jobs found'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow 
                      key={job.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedJobs.includes(job.id) && "bg-muted/30"
                      )}
                      onClick={() => handleViewJobDetails(job)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium truncate max-w-[200px]" title={job.name}>
                            {job.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {job.id}
                          </div>
                          {job.documentName && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={job.documentName}>
                              {job.documentName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <JobStatus 
                          job={job} 
                          showProgress={job.status === 'running'}
                          size={compactView ? 'sm' : 'md'}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {job.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[150px]" title={job.realmName}>
                          {job.realmName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {job.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.createdAt.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <SingleJobActions
                          job={job}
                          onCancel={cancelJob}
                          onRetry={retryJob}
                          onDelete={deleteJob}
                          onViewDetails={handleViewJobDetails}
                          size={compactView ? 'sm' : 'md'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1) setPage(pagination.page - 1);
                }}
                className={cn(pagination.page <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
              const pageNum = pagination.page - 2 + i;
              if (pageNum < 1 || pageNum > Math.ceil(pagination.total / pagination.limit)) return null;
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                    isActive={pageNum === pagination.page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
                    setPage(pagination.page + 1);
                  }
                }}
                className={cn(
                  pagination.page >= Math.ceil(pagination.total / pagination.limit) && 
                  "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Job Detail Modal */}
      <JobDetail
        job={selectedJob!}
        open={isJobDetailOpen}
        onOpenChange={setIsJobDetailOpen}
        onCancel={cancelJob}
        onRetry={retryJob}
        onDelete={deleteJob}
      />
    </div>
  );
}