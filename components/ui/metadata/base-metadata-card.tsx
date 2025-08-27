'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Button } from '../button';
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  HardDrive,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export interface BaseMetadata {
  filename: string;
  file_size: number;
  created_at: string;
  modified_at?: string;
  content_type: string;
  checksum?: string;
  processing_time?: number;
  quality_score?: number;
  confidence_score?: number;
  warnings?: string[];
  error_message?: string;
}

interface BaseMetadataCardProps {
  metadata: BaseMetadata;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function BaseMetadataCard({
  metadata,
  title,
  icon: Icon,
  variant = 'default',
  onView,
  onDownload,
  children,
  className = ''
}: BaseMetadataCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getQualityBadge = (score?: number) => {
    if (!score) return null;
    const percentage = Math.round(score * 100);
    const variant = percentage >= 90 ? 'default' : percentage >= 70 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="flex items-center space-x-1">
        {percentage >= 90 ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        <span>{percentage}%</span>
      </Badge>
    );
  };

  if (variant === 'compact') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{metadata.filename}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatFileSize(metadata.file_size)}</span>
                {metadata.quality_score && (
                  <>
                    <span>•</span>
                    {getQualityBadge(metadata.quality_score)}
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              {onView && (
                <Button variant="ghost" size="sm" onClick={onView}>
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 font-normal">{metadata.filename}</p>
          </div>
          <div className="flex items-center space-x-2">
            {metadata.quality_score && getQualityBadge(metadata.quality_score)}
            {metadata.confidence_score && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Info className="w-3 h-3" />
                <span>{Math.round(metadata.confidence_score * 100)}%</span>
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic File Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{formatFileSize(metadata.file_size)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{metadata.content_type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">{formatDate(metadata.created_at)}</span>
          </div>
          {metadata.processing_time && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Processed in:</span>
              <span className="font-medium">{formatDuration(metadata.processing_time)}</span>
            </div>
          )}
        </div>

        {/* Warnings */}
        {metadata.warnings && metadata.warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Warnings</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {metadata.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {metadata.error_message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{metadata.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Content */}
        {children}

        {/* Actions */}
        {(onView || onDownload) && (
          <div className="flex space-x-2 pt-2 border-t">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
