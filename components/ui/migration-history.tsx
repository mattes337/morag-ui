"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ArrowRight, 
  Calendar,
  User,
  Database,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Migration {
  id: string;
  sourceRealmId: string;
  sourceRealmName: string;
  targetRealmId: string;
  targetRealmName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalDocuments: number;
  processedDocuments: number;
  documentTitles: string[];
  migrationOptions: {
    copyStageFiles: boolean;
    reprocessStages: string[];
    preserveOriginal: boolean;
    migrationMode: 'copy' | 'move';
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errors: string[];
  createdBy: string;
}

interface MigrationHistoryProps {
  realmId?: string;
  className?: string;
}

export function MigrationHistory({ realmId, className }: MigrationHistoryProps) {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMigrations = async () => {
    try {
      const params = new URLSearchParams();
      if (realmId) {
        params.append('realmId', realmId);
      }
      params.append('limit', '50');
      params.append('offset', '0');

      const response = await fetch(`/api/migrations?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch migrations');
      }

      setMigrations(data.migrations);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch migrations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMigrations();
  }, [realmId]);

  // Auto-refresh for active migrations
  useEffect(() => {
    const activeMigrations = migrations.filter(
      migration => migration.status === 'PENDING' || migration.status === 'IN_PROGRESS'
    );

    if (activeMigrations.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      fetchMigrations();
    }, 5000);

    return () => clearInterval(interval);
  }, [migrations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMigrations();
  };

  const handleCancelMigration = async (migrationId: string) => {
    try {
      const response = await fetch(`/api/migrations/${migrationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        fetchMigrations();
      }
    } catch (error) {
      console.error('Failed to cancel migration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'IN_PROGRESS':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      absolute: date.toLocaleString(),
    };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Migration History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading migrations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Migration History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Migration History</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {migrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No migrations found</p>
            <p className="text-sm">Document migrations will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {migrations.map(migration => {
              const createdDate = formatDate(migration.createdAt);
              const completedDate = migration.completedAt ? formatDate(migration.completedAt) : null;
              const progressPercentage = migration.totalDocuments > 0 
                ? (migration.processedDocuments / migration.totalDocuments) * 100 
                : 0;

              return (
                <div key={migration.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(migration.status)}
                      <Badge className={cn('text-xs', getStatusColor(migration.status))}>
                        {migration.status}
                      </Badge>
                      <span className="text-sm text-gray-500">#{migration.id.slice(0, 8)}</span>
                    </div>
                    {migration.status === 'IN_PROGRESS' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelMigration(migration.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Migration Details */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{migration.sourceRealmName}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{migration.targetRealmName}</span>
                  </div>

                  {/* Documents */}
                  <div className="text-sm">
                    <span className="font-medium">{migration.totalDocuments} documents:</span>
                    <div className="mt-1 text-gray-600">
                      {migration.documentTitles.slice(0, 3).join(', ')}
                      {migration.documentTitles.length > 3 && (
                        <span> and {migration.documentTitles.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {(migration.status === 'IN_PROGRESS' || migration.status === 'COMPLETED') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{migration.processedDocuments} / {migration.totalDocuments}</span>
                      </div>
                      <Progress value={progressPercentage} className="w-full" />
                    </div>
                  )}

                  {/* Migration Options */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {migration.migrationOptions.migrationMode === 'copy' ? 'Copy' : 'Move'}
                    </Badge>
                    {migration.migrationOptions.copyStageFiles && (
                      <Badge variant="outline" className="text-xs">Stage Files</Badge>
                    )}
                    {migration.migrationOptions.reprocessStages.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Reprocess: {migration.migrationOptions.reprocessStages.join(', ')}
                      </Badge>
                    )}
                  </div>

                  {/* Errors */}
                  {migration.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Errors:</div>
                          {migration.errors.slice(0, 2).map((error, index) => (
                            <div key={index} className="text-sm">{error}</div>
                          ))}
                          {migration.errors.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{migration.errors.length - 2} more errors
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span title={createdDate.absolute}>Created {createdDate.relative}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{migration.createdBy}</span>
                      </div>
                    </div>
                    {completedDate && (
                      <div title={completedDate.absolute}>
                        Completed {completedDate.relative}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}