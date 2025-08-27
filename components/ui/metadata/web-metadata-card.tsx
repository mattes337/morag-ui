'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  Globe, 
  User, 
  Calendar, 
  Link, 
  Image as ImageIcon, 
  FileText,
  Hash,
  ExternalLink,
  Database,
  Clock
} from 'lucide-react';

export interface WebMetadata extends BaseMetadata {
  url: string;
  title?: string;
  content: string;
  markdown_content: string;
  metadata: {
    description?: string;
    author?: string;
    publication_date?: string;
    language?: string;
    domain: string;
    content_type: string;
    status_code: number;
    word_count: number;
    paragraph_count: number;
    heading_count: number;
    has_structured_data: boolean;
    schema_types?: string[];
  };
  links: string[];
  images: string[];
  extraction_time: number;
  content_length: number;
  content_type: string;
}

interface WebMetadataCardProps {
  metadata: WebMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  onOpenUrl?: () => void;
  className?: string;
}

export function WebMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  onOpenUrl,
  className = ''
}: WebMetadataCardProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    return `${seconds.toFixed(2)}s`;
  };

  const getStatusBadge = (statusCode: number) => {
    const variant = statusCode >= 200 && statusCode < 300 ? 'default' : 
                   statusCode >= 300 && statusCode < 400 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant}>
        {statusCode}
      </Badge>
    );
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="Web Page"
      icon={Globe}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Page Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Page Information</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-gray-600 text-sm">URL:</span>
                  <p className="font-medium text-blue-600 break-all text-sm">{metadata.url}</p>
                </div>
              </div>
              
              {metadata.title && (
                <div>
                  <span className="text-gray-600 text-sm">Title:</span>
                  <p className="font-medium mt-1">{metadata.title}</p>
                </div>
              )}
              
              {metadata.metadata.description && (
                <div>
                  <span className="text-gray-600 text-sm">Description:</span>
                  <p className="text-gray-700 mt-1 text-sm">{metadata.metadata.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Technical Details</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(metadata.metadata.status_code)}
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{metadata.metadata.domain}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Content Type:</span>
                <span className="font-medium">{metadata.metadata.content_type}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Extraction Time:</span>
                <span className="font-medium">{formatDuration(metadata.extraction_time)}</span>
              </div>
              
              {metadata.metadata.language && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{metadata.metadata.language.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Content Statistics</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-lg">{metadata.metadata.word_count.toLocaleString()}</div>
                <div className="text-gray-600">Words</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-lg">{metadata.metadata.paragraph_count}</div>
                <div className="text-gray-600">Paragraphs</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-lg">{metadata.metadata.heading_count}</div>
                <div className="text-gray-600">Headings</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-lg">{(metadata.content_length / 1024).toFixed(1)}K</div>
                <div className="text-gray-600">Characters</div>
              </div>
            </div>
          </div>

          {/* Author and Publication */}
          {(metadata.metadata.author || metadata.metadata.publication_date) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Publication Info</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {metadata.metadata.author && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Author:</span>
                    <span className="font-medium">{metadata.metadata.author}</span>
                  </div>
                )}
                
                {metadata.metadata.publication_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Published:</span>
                    <span className="font-medium">{formatDate(metadata.metadata.publication_date)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Structured Data */}
          {metadata.metadata.has_structured_data && metadata.metadata.schema_types && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Structured Data</span>
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {metadata.metadata.schema_types.map((schemaType, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <Hash className="w-3 h-3" />
                    <span>{schemaType}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links and Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Links */}
            {metadata.links.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Link className="w-4 h-4" />
                  <span>Links ({metadata.links.length})</span>
                </h5>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metadata.links.slice(0, 5).map((link, index) => (
                    <div key={index} className="text-xs text-blue-600 break-all">
                      {link}
                    </div>
                  ))}
                  {metadata.links.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{metadata.links.length - 5} more links
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {metadata.images.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Images ({metadata.images.length})</span>
                </h5>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metadata.images.slice(0, 5).map((image, index) => (
                    <div key={index} className="text-xs text-gray-600 break-all">
                      {image}
                    </div>
                  ))}
                  {metadata.images.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{metadata.images.length - 5} more images
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Open URL Button */}
          {onOpenUrl && (
            <div className="pt-2 border-t">
              <button
                onClick={onOpenUrl}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Original Page</span>
              </button>
            </div>
          )}
        </>
      )}
    </BaseMetadataCard>
  );
}
