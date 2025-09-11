'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  FileText,
  Clock,
  Database,
  Activity,
  AlertTriangle,
  Copy,
  Download,
  ExternalLink,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  JobStatus, 
  JobStatusProgress, 
  JobProcessingSteps,
  JobPerformanceMetrics 
} from './JobStatus';
import { QuickJobActions } from './JobActions';
import type { ProcessingJob } from '@/lib/mockData/jobsMockData';

interface JobDetailProps {
  job: ProcessingJob;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: (jobId: string) => Promise<boolean>;
  onRetry?: (jobId: string) => Promise<boolean>;
  onDelete?: (jobId: string) => Promise<boolean>;
  children?: React.ReactNode;
}

export function JobDetail({
  job,
  open,
  onOpenChange,
  onCancel,
  onRetry,
  onDelete,
  children
}: JobDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(job.id);
    toast({
      title: 'Copied',
      description: 'Job ID copied to clipboard',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const dialogProps: { open?: boolean; onOpenChange?: (open: boolean) => void } = {};
  if (open !== undefined) dialogProps.open = open;
  if (onOpenChange !== undefined) dialogProps.onOpenChange = onOpenChange;

  return (
    <Dialog {...dialogProps}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">Job Details</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-sm">{job.id}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <QuickJobActions
              job={job}
              {...(onCancel && { onCancel })}
              {...(onRetry && { onRetry })}
              {...(onDelete && { onDelete })}
              compact
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[60vh]">
            <div className="mt-4">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-2 gap-6">
                  {/* Job Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Job Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-sm">{job.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {job.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <JobStatus job={job} showProgress showETA />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Realm</label>
                        <p className="text-sm">{job.realmName}</p>
                      </div>
                      {job.documentName && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Document</label>
                          <p className="text-sm">{job.documentName}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timing Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <p className="text-sm font-mono">{formatDate(job.createdAt)}</p>
                      </div>
                      {job.startedAt && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Started</label>
                          <p className="text-sm font-mono">{formatDate(job.startedAt)}</p>
                        </div>
                      )}
                      {job.completedAt && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Completed</label>
                          <p className="text-sm font-mono">{formatDate(job.completedAt)}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
                        <p className="text-sm">{formatDuration(job.estimatedDuration)}</p>
                      </div>
                      {job.actualDuration && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Actual Duration</label>
                          <p className="text-sm">{formatDuration(job.actualDuration)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Document Metadata */}
                {job.metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Document Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {job.metadata.fileSize && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">File Size</label>
                            <p className="text-sm">{formatFileSize(job.metadata.fileSize)}</p>
                          </div>
                        )}
                        {job.metadata.fileType && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">File Type</label>
                            <Badge variant="outline">{job.metadata.fileType}</Badge>
                          </div>
                        )}
                        {job.metadata.chunkCount && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Chunks</label>
                            <p className="text-sm">{job.metadata.chunkCount.toLocaleString()}</p>
                          </div>
                        )}
                        {job.metadata.factCount && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Facts</label>
                            <p className="text-sm">{job.metadata.factCount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {job.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Status and Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobStatusProgress job={job} />
                    </CardContent>
                  </Card>

                  {/* Processing Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Pipeline</CardTitle>
                      <CardDescription>
                        Track progress through each processing stage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <JobProcessingSteps job={job} />
                    </CardContent>
                  </Card>

                  {/* Retry Information */}
                  {job.retryCount > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Retry Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Attempts</label>
                            <p className="text-sm">{job.retryCount} of {job.maxRetries}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Remaining Retries</label>
                            <p className="text-sm">{job.maxRetries - job.retryCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Job Logs
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock log entries */}
                      <div className="space-y-2">
                        {generateMockLogs(job).map((log, index) => (
                          <div
                            key={index}
                            className={cn(
                              'flex items-start gap-2 p-2 rounded text-sm font-mono',
                              log.level === 'error' && 'bg-destructive/10 text-destructive',
                              log.level === 'warn' && 'bg-orange-50 text-orange-800',
                              log.level === 'info' && 'bg-blue-50 text-blue-800',
                            )}
                          >
                            <span className="text-muted-foreground shrink-0">
                              {log.timestamp}
                            </span>
                            <Badge
                              variant={
                                log.level === 'error' ? 'destructive' :
                                log.level === 'warn' ? 'destructive' :
                                'secondary'
                              }
                              className="shrink-0 text-xs"
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="flex-1">{log.message}</span>
                          </div>
                        ))}
                      </div>

                      {/* Error Stack Trace */}
                      {job.errorStack && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Error Stack Trace</h4>
                          <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
                            <pre className="text-xs font-mono text-destructive whitespace-pre-wrap">
                              {job.errorStack}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Resource Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Resource Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobPerformanceMetrics job={job} />
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">Worker Node</label>
                          <p>worker-{Math.floor(Math.random() * 10) + 1}.cluster.local</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Process ID</label>
                          <p className="font-mono">{Math.floor(Math.random() * 90000) + 10000}</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Queue Position</label>
                          <p>{job.status === 'queued' ? Math.floor(Math.random() * 20) + 1 : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Priority</label>
                          <Badge variant="outline" className="capitalize">{job.priority}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Historical performance data for this job type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div>
                            <label className="font-medium text-muted-foreground">Average Processing Time</label>
                            <p>{formatDuration(Math.floor(Math.random() * 30) + 10)}</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground">Success Rate</label>
                            <p>{(Math.random() * 15 + 85).toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="font-medium text-muted-foreground">Throughput</label>
                            <p>{(Math.random() * 50 + 20).toFixed(1)} docs/hour</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground">Queue Time</label>
                            <p>{formatDuration(Math.floor(Math.random() * 5) + 1)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to generate mock logs
function generateMockLogs(job: ProcessingJob) {
  const logs = [];
  const baseTime = job.createdAt.getTime();
  
  logs.push({
    timestamp: new Date(baseTime).toISOString().slice(11, 19),
    level: 'info' as const,
    message: `Job ${job.id} created and added to queue`
  });

  if (job.startedAt) {
    logs.push({
      timestamp: new Date(job.startedAt.getTime()).toISOString().slice(11, 19),
      level: 'info' as const,
      message: 'Job started processing'
    });

    logs.push({
      timestamp: new Date(job.startedAt.getTime() + 5000).toISOString().slice(11, 19),
      level: 'info' as const,
      message: `Processing document: ${job.documentName}`
    });

    if (job.status === 'running') {
      logs.push({
        timestamp: new Date(job.startedAt.getTime() + 30000).toISOString().slice(11, 19),
        level: 'info' as const,
        message: `Progress: ${Math.round(job.progress)}% complete`
      });
    }
  }

  if (job.status === 'completed' && job.completedAt) {
    logs.push({
      timestamp: new Date(job.completedAt.getTime() - 1000).toISOString().slice(11, 19),
      level: 'info' as const,
      message: 'Processing completed successfully'
    });

    logs.push({
      timestamp: new Date(job.completedAt.getTime()).toISOString().slice(11, 19),
      level: 'info' as const,
      message: `Job completed in ${job.actualDuration || 0} minutes`
    });
  }

  if (job.status === 'failed' && job.errorMessage) {
    logs.push({
      timestamp: new Date(Date.now() - 60000).toISOString().slice(11, 19),
      level: 'error' as const,
      message: job.errorMessage
    });
  }

  if (job.retryCount > 0) {
    logs.push({
      timestamp: new Date(Date.now() - 30000).toISOString().slice(11, 19),
      level: 'warn' as const,
      message: `Retry attempt ${job.retryCount} of ${job.maxRetries}`
    });
  }

  return logs;
}