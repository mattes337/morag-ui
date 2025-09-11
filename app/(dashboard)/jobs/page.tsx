'use client';

import React, { Suspense, useState } from 'react';
import { JobList } from '@/components/jobs/JobList';
import { JobQueue } from '@/components/jobs/JobQueue';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobDetails } from '@/components/jobs/JobDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Filter, 
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAdvancedJobs, type JobFilters as JobFiltersType } from '@/lib/hooks/useJobs';
import { ProcessingJob } from '@/lib/mockData/jobsMockData';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob] = useState<ProcessingJob | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<JobFiltersType>({});

  const {
    loading,
    statistics,
    realms,
    refreshJobs,
    cancelJob,
    retryJob,
    deleteJob
  } = useAdvancedJobs({
    filters,
    sorting: { field: 'createdAt', direction: 'desc' },
    pagination: { page: 1, limit: 50 },
    realTimeUpdates: true
  });

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  // Wrapper functions to handle Promise<boolean> -> Promise<void>
  const handleCancelJob = async (jobId: string): Promise<void> => {
    await cancelJob(jobId);
  };

  const handleRetryJob = async (jobId: string): Promise<void> => {
    await retryJob(jobId);
  };

  const handleDeleteJob = async (jobId: string): Promise<void> => {
    await deleteJob(jobId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage processing jobs across all realms
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshJobs}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground">Total Jobs</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.running}</div>
            <div className="text-xs text-muted-foreground">Running</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableRealms={realms}
              jobStats={statistics}
              showQuickFilters={true}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Queue
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                All Jobs
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Monitor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-6">
              <Suspense fallback={<JobsLoadingSkeleton />}>
                <JobQueue
                  autoRefresh={true}
                  refreshInterval={5000}
                  showBulkActions={true}
                  maxVisibleJobs={20}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    All Jobs ({statistics.total.toLocaleString()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<JobsLoadingSkeleton />}>
                    <JobList
                      realtimeUpdates={true}
                      defaultFilters={filters}
                      compactView={false}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Active Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <JobQueue
                      autoRefresh={true}
                      refreshInterval={3000}
                      showBulkActions={false}
                      maxVisibleJobs={5}
                    />
                  </CardContent>
                </Card>

                {/* Recent Failures */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Failures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<JobsLoadingSkeleton />}>
                      <JobList
                        realtimeUpdates={true}
                        defaultFilters={{ status: ['failed'] }}
                        compactView={true}
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          open={isJobDetailsOpen}
          onOpenChange={setIsJobDetailsOpen}
          onCancel={handleCancelJob}
          onRetry={handleRetryJob}
          onDelete={handleDeleteJob}
          variant="dialog"
        />
      )}
    </div>
  );
}

function JobsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter and action bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      
      {/* Table header skeleton */}
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        {/* Table rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-12 gap-4 items-center">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-6 w-20 col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}