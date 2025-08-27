'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  FileText, 
  User, 
  Calendar, 
  Globe, 
  Image, 
  Table, 
  FileCheck,
  Layers,
  Type,
  Hash
} from 'lucide-react';

export interface PDFMetadata extends BaseMetadata {
  page_count: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  modification_date?: string;
  language?: string;
  processing_method?: string;
  extraction_quality?: number;
  has_images?: boolean;
  has_tables?: boolean;
  text_length?: number;
  chunk_count?: number;
  quality_issues?: string[];
}

interface PDFMetadataCardProps {
  metadata: PDFMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function PDFMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  className = ''
}: PDFMetadataCardProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getExtractionQualityBadge = (quality?: number) => {
    if (!quality) return null;
    const percentage = Math.round(quality * 100);
    const variant = percentage >= 95 ? 'default' : percentage >= 85 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="flex items-center space-x-1">
        <FileCheck className="w-3 h-3" />
        <span>{percentage}% extracted</span>
      </Badge>
    );
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="PDF Document"
      icon={FileText}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Document Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Document Details</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Pages:</span>
                <span className="font-medium">{metadata.page_count}</span>
              </div>
              
              {metadata.language && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{metadata.language.toUpperCase()}</span>
                </div>
              )}
              
              {metadata.text_length && (
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Text Length:</span>
                  <span className="font-medium">{metadata.text_length.toLocaleString()} chars</span>
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

            {/* Content Features */}
            <div className="flex flex-wrap gap-2">
              {metadata.has_images && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Image className="w-3 h-3" />
                  <span>Contains Images</span>
                </Badge>
              )}
              {metadata.has_tables && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Table className="w-3 h-3" />
                  <span>Contains Tables</span>
                </Badge>
              )}
              {metadata.extraction_quality && getExtractionQualityBadge(metadata.extraction_quality)}
            </div>
          </div>

          {/* Author Information */}
          {(metadata.title || metadata.author || metadata.subject) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Author Information</span>
              </h4>
              
              <div className="space-y-2 text-sm">
                {metadata.title && (
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <p className="font-medium mt-1">{metadata.title}</p>
                  </div>
                )}
                
                {metadata.author && (
                  <div>
                    <span className="text-gray-600">Author:</span>
                    <p className="font-medium mt-1">{metadata.author}</p>
                  </div>
                )}
                
                {metadata.subject && (
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <p className="font-medium mt-1">{metadata.subject}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Information */}
          {(metadata.creator || metadata.producer || metadata.processing_method) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <FileCheck className="w-4 h-4" />
                <span>Technical Details</span>
              </h4>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                {metadata.creator && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Creator:</span>
                    <span className="font-medium">{metadata.creator}</span>
                  </div>
                )}
                
                {metadata.producer && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Producer:</span>
                    <span className="font-medium">{metadata.producer}</span>
                  </div>
                )}
                
                {metadata.processing_method && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Processing Method:</span>
                    <Badge variant="outline">{metadata.processing_method}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          {(metadata.creation_date || metadata.modification_date) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Document Dates</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {metadata.creation_date && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(metadata.creation_date)}</span>
                  </div>
                )}
                
                {metadata.modification_date && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Modified:</span>
                    <span className="font-medium">{formatDate(metadata.modification_date)}</span>
                  </div>
                )}
              </div>
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
        </>
      )}
    </BaseMetadataCard>
  );
}
