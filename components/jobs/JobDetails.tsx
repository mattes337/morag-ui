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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText,
  Server,
  Clock,
  Play,
  StopCircle,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Cpu,
  HardDrive,
  Activity,
  Tag,
  User,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingJob } from '@/lib/mockData/jobsMockData';
import { JobStatus } from './JobStatus';
import { format, formatDistanceToNow } from 'date-fns';

interface JobDetailsProps {
  job: ProcessingJob;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: (jobId: string) => Promise<void>;
  onRetry?: (jobId: string) => Promise<void>;
  onDelete?: (jobId: string) => Promise<void>;
  variant?: 'dialog' | 'sheet';
  className?: string;
}

export function JobDetails({
  job,
  trigger,
  open,
  onOpenChange,
  onCancel,
  onRetry,
  onDelete,
  variant = 'dialog',
  className
}: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, actionFn?: (jobId: string) => Promise<void>) => {
    if (!actionFn) return;
    
    setIsActionLoading(action);
    try {
      await actionFn(job.id);
      onOpenChange?.(false);
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPriorityColor = () => {
    switch (job.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getResourceUsageColor = (percent: number) => {
    if (percent >= 80) return 'text-red-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const canCancel = ['pending', 'queued', 'running'].includes(job.status);
  const canRetry = ['failed', 'cancelled'].includes(job.status);
  const canDelete = !['running'].includes(job.status);

  const JobDetailsContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold break-words">{job.name}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{job.id}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(job.createdAt, 'PPP p')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <JobStatus job={job} size="lg" />
            <Badge className={cn("border", getPriorityColor())}>
              {job.priority.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canCancel && onCancel && (
            <Button
              variant="outline"
              onClick={() => handleAction('cancel', onCancel)}
              disabled={isActionLoading === 'cancel'}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Cancel Job
            </Button>
          )}
          
          {canRetry && onRetry && (
            <Button
              variant="outline"
              onClick={() => handleAction('retry', onRetry)}
              disabled={isActionLoading === 'retry'}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isActionLoading === 'retry' && "animate-spin")} />
              Retry Job
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(job.id)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy ID
          </Button>
          
          {canDelete && onDelete && (
            <Button
              variant="outline"
              onClick={() => handleAction('delete', onDelete)}
              disabled={isActionLoading === 'delete'}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        {/* Progress */}
        {['running', 'failed'].includes(job.status) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-3" />
            {job.status === 'failed' && job.errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive">{job.errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="capitalize">{job.type.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Stage</dt>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="capitalize">{job.stage.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Realm</dt>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <span>{job.realmName}</span>
                  </div>
                </div>

                {job.documentName && (
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">Document</dt>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="break-words">{job.documentName}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>

                {job.startedAt && (
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">Started</dt>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>{formatDistanceToNow(job.startedAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>
                      {job.actualDuration ? 
                        `${formatDuration(job.actualDuration)} (actual)` : 
                        `${formatDuration(job.estimatedDuration)} (estimated)`
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">Retries</dt>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>{job.retryCount} / {job.maxRetries}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Information */}
          {job.metadata.fileSize && (
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground">File Size</dt>
                    <div className="text-sm font-medium">
                      {formatBytes(job.metadata.fileSize)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground">File Type</dt>
                    <div className="text-sm font-medium">{job.metadata.fileType}</div>
                  </div>

                  {job.metadata.chunkCount && (
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground">Chunks</dt>
                      <div className="text-sm font-medium">{job.metadata.chunkCount}</div>
                    </div>
                  )}

                  {job.metadata.factCount && (
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground">Facts</dt>
                      <div className="text-sm font-medium">{job.metadata.factCount}</div>
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
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.metadata.processingSteps.map((step, index) => (
                <div key={step.stage} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {step.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {step.status === 'running' && (
                      <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                    )}
                    {step.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {step.status === 'pending' && (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {step.stage.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {step.status}
                      </Badge>
                    </div>
                    
                    {step.duration && (
                      <div className="text-sm text-muted-foreground">
                        Completed in {step.duration}s
                      </div>
                    )}
                    
                    {step.error && (
                      <div className="text-sm text-destructive">
                        Error: {step.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span className="font-medium">CPU</span>
                    </div>
                    <span className={cn("font-bold", getResourceUsageColor(job.resourceUsage.cpuPercent))}>
                      {job.resourceUsage.cpuPercent}%
                    </span>
                  </div>
                  <Progress value={job.resourceUsage.cpuPercent} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <span className="font-bold">
                      {job.resourceUsage.memoryMB}MB
                    </span>
                  </div>
                  <Progress value={(job.resourceUsage.memoryMB / 4096) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Disk I/O</span>
                    </div>
                    <span className="font-bold">
                      {formatBytes(job.resourceUsage.diskIOKB * 1024)}
                    </span>
                  </div>
                  <Progress value={(job.resourceUsage.diskIOKB / 10240) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded border p-4">
                <div className="font-mono text-sm space-y-2">
                  <div className="text-muted-foreground">
                    [{format(job.createdAt, 'HH:mm:ss')}] Job created: {job.name}
                  </div>
                  {job.startedAt && (
                    <div className="text-blue-600">
                      [{format(job.startedAt, 'HH:mm:ss')}] Job started - Stage: {job.stage}
                    </div>
                  )}
                  {job.status === 'running' && (
                    <div className="text-green-600">
                      [{format(new Date(), 'HH:mm:ss')}] Processing... ({job.progress}% complete)
                    </div>
                  )}
                  {job.status === 'failed' && job.errorMessage && (
                    <>
                      <div className="text-red-600">
                        [{format(job.completedAt || new Date(), 'HH:mm:ss')}] Job failed: {job.errorMessage}
                      </div>
                      {job.errorStack && (
                        <div className="text-red-500 text-xs whitespace-pre-wrap pl-4">
                          {job.errorStack}
                        </div>
                      )}
                    </>
                  )}
                  {job.status === 'completed' && job.completedAt && (
                    <div className="text-green-600">
                      [{format(job.completedAt, 'HH:mm:ss')}] Job completed successfully
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (variant === 'sheet') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent className={cn("w-[600px] sm:w-[700px] max-w-none", className)}>
          <SheetHeader>
            <SheetTitle>Job Details</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] mt-6">
            <JobDetailsContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-hidden", className)}>
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <JobDetailsContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}