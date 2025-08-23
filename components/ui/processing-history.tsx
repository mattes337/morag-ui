'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play,
  RotateCcw,
  Eye,
  Download
} from 'lucide-react';

interface ProcessingHistoryEntry {
  id: string;
  stage: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startTime?: string;
  endTime?: string;
  duration?: number;
  message?: string;
  error?: string;
  outputFiles?: Array<{
    id: string;
    filename: string;
    filesize: number;
    contentType: string;
  }>;
  metadata?: Record<string, any>;
}

interface ProcessingHistoryProps {
  documentId: string;
  onExecuteStage?: (stage: string) => Promise<void>;
  onViewOutput?: (fileId: string) => void;
  onDownloadOutput?: (fileId: string) => void;
}

export function ProcessingHistory({ 
  documentId, 
  onExecuteStage, 
  onViewOutput, 
  onDownloadOutput 
}: ProcessingHistoryProps) {
  const [history, setHistory] = useState<ProcessingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const loadProcessingHistory = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load actual processing history from API
      const response = await fetch(`/api/v1/documents/${documentId}/process`);
      if (!response.ok) {
        throw new Error('Failed to load processing history');
      }

      const data = await response.json();
      const processingData = data.processing;

      // Convert API response to ProcessingHistoryEntry format
      const historyEntries: ProcessingHistoryEntry[] = [];

      // Add job history
      if (processingData.jobs) {
        for (const job of processingData.jobs) {
          historyEntries.push({
            id: job.id,
            stage: job.stage,
            status: job.status === 'FINISHED' ? 'COMPLETED' :
                   job.status === 'PROCESSING' ? 'RUNNING' :
                   job.status === 'FAILED' ? 'FAILED' : 'PENDING',
            startTime: job.startedAt,
            endTime: job.completedAt,
            duration: job.startedAt && job.completedAt ?
              Math.floor((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000) :
              undefined,
            message: job.status === 'FINISHED' ? `Stage ${job.stage} completed successfully` :
                    job.status === 'FAILED' ? job.errorMessage :
                    `Stage ${job.stage} is ${job.status.toLowerCase()}`,
            error: job.status === 'FAILED' ? job.errorMessage : undefined,
          });
        }
      }

      // Add execution history
      if (processingData.executions) {
        for (const execution of processingData.executions) {
          // Get output files for this execution
          const outputFiles = execution.outputFiles ? execution.outputFiles.map((filename: string) => ({
            id: `${execution.id}-${filename}`,
            filename,
            filesize: 0, // Will be populated when needed
            contentType: filename.endsWith('.json') ? 'application/json' :
                        filename.endsWith('.md') ? 'text/markdown' : 'text/plain'
          })) : [];

          historyEntries.push({
            id: execution.id,
            stage: execution.stage,
            status: execution.status === 'COMPLETED' ? 'COMPLETED' :
                   execution.status === 'RUNNING' ? 'RUNNING' :
                   execution.status === 'FAILED' ? 'FAILED' : 'PENDING',
            startTime: execution.startedAt,
            endTime: execution.completedAt,
            duration: execution.startedAt && execution.completedAt ?
              Math.floor((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000) :
              undefined,
            message: execution.status === 'COMPLETED' ? `Stage ${execution.stage} completed successfully` :
                    execution.status === 'FAILED' ? execution.errorMessage :
                    `Stage ${execution.stage} is ${execution.status.toLowerCase()}`,
            error: execution.status === 'FAILED' ? execution.errorMessage : undefined,
            outputFiles,
          });
        }
      }

      // Sort by start time (most recent first)
      historyEntries.sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
      });

      setHistory(historyEntries);
    } catch (error) {
      console.error('Failed to load processing history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadProcessingHistory();
  }, [loadProcessingHistory]);

  const handleExecuteStage = async (stage: string) => {
    if (!onExecuteStage) return;
    
    try {
      setIsExecuting(stage);
      await onExecuteStage(stage);
      await loadProcessingHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to execute stage:', error);
    } finally {
      setIsExecuting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'RUNNING':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading processing history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(entry.status)}
                  <div>
                    <h4 className="font-medium">{entry.stage.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">
                      {entry.startTime && new Date(entry.startTime).toLocaleString()}
                      {entry.duration && ` • ${formatDuration(entry.duration)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                  {onExecuteStage && entry.status !== 'RUNNING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteStage(entry.stage)}
                      disabled={isExecuting === entry.stage}
                    >
                      {isExecuting === entry.stage ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {entry.message && (
                <p className="text-sm text-gray-700 mb-2">{entry.message}</p>
              )}

              {entry.error && (
                <p className="text-sm text-red-600 mb-2">{entry.error}</p>
              )}

              {entry.metadata && (
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <h5 className="text-sm font-medium mb-2">Details</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(entry.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {entry.outputFiles && entry.outputFiles.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Output Files</h5>
                  <div className="space-y-2">
                    {entry.outputFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{file.filename}</p>
                          <p className="text-xs text-gray-600">
                            {(file.filesize / 1024).toFixed(1)} KB • {file.contentType}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {onViewOutput && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewOutput(file.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onDownloadOutput && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDownloadOutput(file.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No processing history available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
