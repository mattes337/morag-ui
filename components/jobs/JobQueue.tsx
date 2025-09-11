'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  StopCircle, 
  RefreshCw, 
  Clock, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobCard } from './JobCard';
import { ProcessingJob } from '@/lib/mockData/jobsMockData';
import { useAdvancedJobs } from '@/lib/hooks/useJobs';

interface JobQueueProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showBulkActions?: boolean;
  maxVisibleJobs?: number;
}

export function JobQueue({
  className,
  autoRefresh = true,
  refreshInterval = 5000, // 5 seconds
  showBulkActions = true,
  maxVisibleJobs = 10
}: JobQueueProps) {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  const {
    jobs,
    loading,
    error,
    statistics,
    refreshJobs,
    cancelJob,
    retryJob,
    deleteJob,
    bulkCancel,
    bulkRetry,
    bulkDelete,
    selectedJobs,
    toggleJobSelection,
    selectAllJobs,
    clearSelection
  } = useAdvancedJobs({
    filters: {
      status: ['pending', 'queued', 'running']
    },
    sorting: {
      field: 'createdAt',
      direction: 'desc'
    },
    pagination: {
      page: 1,
      limit: maxVisibleJobs
    },
    realTimeUpdates: autoRefresh
  });

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshJobs();
      setLastRefreshTime(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshJobs]);

  // Filter jobs for queue display
  const queuedJobs = jobs.filter(job => 
    ['pending', 'queued', 'running'].includes(job.status)
  );

  const runningJobs = jobs.filter(job => job.status === 'running');
  const pendingJobs = jobs.filter(job => 
    ['pending', 'queued'].includes(job.status)
  );

  // Queue statistics
  const queueStats = {
    total: queuedJobs.length,
    running: runningJobs.length,
    pending: pendingJobs.length,
    avgProgress: runningJobs.length > 0 
      ? Math.round(runningJobs.reduce((sum, job) => sum + job.progress, 0) / runningJobs.length)
      : 0
  };

  const handleBulkAction = async (action: 'cancel' | 'retry' | 'delete') => {
    if (selectedJobs.length === 0) return;

    try {
      switch (action) {
        case 'cancel':
          await bulkCancel(selectedJobs);
          break;
        case 'retry':
          await bulkRetry(selectedJobs);
          break;
        case 'delete':
          await bulkDelete(selectedJobs);
          break;
      }
      clearSelection();
      refreshJobs();
    } catch (error) {
      console.error(`Failed to ${action} jobs:`, error);
    }
  };

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load job queue</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              onClick={refreshJobs} 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Job Queue</CardTitle>
            </div>
            {autoRefresh && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshJobs();
                setLastRefreshTime(new Date());
              }}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{queueStats.total}</div>
              <div className="text-xs text-muted-foreground">Total in Queue</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{queueStats.running}</div>
              <div className="text-xs text-muted-foreground">Running</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{queueStats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{queueStats.avgProgress}%</div>
              <div className="text-xs text-muted-foreground">Avg Progress</div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        {queueStats.running > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Queue Progress</span>
              <span className="text-sm text-muted-foreground">
                {queueStats.avgProgress}% complete
              </span>
            </div>
            <Progress value={queueStats.avgProgress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bulk Actions */}
        {showBulkActions && selectedJobs.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">
              {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('cancel')}
                className="text-destructive hover:text-destructive"
              >
                <StopCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('retry')}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-3">
          {loading && queuedJobs.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : queuedJobs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-semibold">Queue is Empty</h3>
              <p className="text-muted-foreground">
                No jobs are currently pending or running
              </p>
            </div>
          ) : (
            queuedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJobs.includes(job.id)}
                onSelect={() => toggleJobSelection(job.id)}
                onCancel={cancelJob}
                onRetry={retryJob}
                onDelete={deleteJob}
                showProgress={job.status === 'running'}
                compact={true}
              />
            ))
          )}
        </div>

        {/* Show more indicator */}
        {queuedJobs.length >= maxVisibleJobs && (
          <div className="text-center pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {maxVisibleJobs} of {statistics.total} total jobs
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}