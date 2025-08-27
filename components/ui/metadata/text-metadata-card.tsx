'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  FileText, 
  Globe, 
  Hash, 
  Type,
  Code,
  AlignLeft
} from 'lucide-react';

export interface TextMetadata extends BaseMetadata {
  encoding?: string;
  line_count?: number;
  language?: string;
  text_length?: number;
  chunk_count?: number;
  quality_issues?: string[];
}

interface TextMetadataCardProps {
  metadata: TextMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function TextMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  className = ''
}: TextMetadataCardProps) {
  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'md':
        return 'Markdown';
      case 'txt':
        return 'Plain Text';
      case 'rtf':
        return 'Rich Text';
      default:
        return 'Text File';
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'md' ? Code : FileText;
  };

  const estimateReadingTime = (textLength?: number): string => {
    if (!textLength) return 'Unknown';
    // Average reading speed: 200-250 words per minute
    // Average word length: 5 characters
    const estimatedWords = textLength / 5;
    const minutes = Math.ceil(estimatedWords / 225);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  const FileIcon = getFileIcon(metadata.filename);

  return (
    <BaseMetadataCard
      metadata={metadata}
      title={getFileExtension(metadata.filename)}
      icon={FileIcon}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* File Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>File Details</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline">{getFileExtension(metadata.filename)}</Badge>
              </div>
              
              {metadata.encoding && (
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Encoding:</span>
                  <Badge variant="outline">{metadata.encoding.toUpperCase()}</Badge>
                </div>
              )}
              
              {metadata.language && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{metadata.language.toUpperCase()}</span>
                </div>
              )}
              
              {metadata.chunk_count && (
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Chunks:</span>
                  <span className="font-medium">{metadata.chunk_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Content Statistics</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {metadata.text_length && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-lg">{metadata.text_length.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
              )}
              
              {metadata.line_count && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-lg">{metadata.line_count.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Lines</div>
                </div>
              )}
              
              {metadata.text_length && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-lg">{estimateReadingTime(metadata.text_length)}</div>
                  <div className="text-sm text-gray-600">Reading Time</div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {metadata.text_length && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <AlignLeft className="w-4 h-4" />
                <span>Text Analysis</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Estimated Words:</span>
                  <span className="font-medium">{Math.round(metadata.text_length / 5).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Avg. Line Length:</span>
                  <span className="font-medium">
                    {metadata.line_count ? Math.round(metadata.text_length / metadata.line_count) : 'N/A'} chars
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* File Format Specific Information */}
          {metadata.filename.endsWith('.md') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Code className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-medium">Markdown Format</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                This file contains Markdown formatting that will be preserved during processing.
              </p>
            </div>
          )}

          {/* Quality Issues */}
          {metadata.quality_issues && metadata.quality_issues.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Quality Issues</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                {metadata.quality_issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Processing Notes */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Processing Notes:</p>
              <ul className="space-y-1 text-xs">
                <li>• Text files are processed with minimal transformation</li>
                <li>• Original formatting and line breaks are preserved</li>
                {metadata.filename.endsWith('.md') && (
                  <li>• Markdown syntax will be rendered in the final output</li>
                )}
                <li>• Character encoding is automatically detected and converted to UTF-8</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </BaseMetadataCard>
  );
}
