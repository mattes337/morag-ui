'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  FileText, 
  User, 
  Calendar, 
  Globe, 
  Hash, 
  Type,
  Layers,
  Image as ImageIcon,
  Table,
  Tag
} from 'lucide-react';

export interface WordMetadata extends BaseMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creation_date?: string;
  modification_date?: string;
  language?: string;
  word_count?: number;
  paragraph_count?: number;
  page_count?: number;
  has_images?: boolean;
  has_tables?: boolean;
  text_length?: number;
  chunk_count?: number;
  quality_issues?: string[];
}

interface WordMetadataCardProps {
  metadata: WordMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function WordMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  className = ''
}: WordMetadataCardProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'docx' ? 'DOCX' : ext === 'doc' ? 'DOC' : 'WORD';
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="Word Document"
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
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Format:</span>
                <Badge variant="outline">{getFileExtension(metadata.filename)}</Badge>
              </div>
              
              {metadata.language && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{metadata.language.toUpperCase()}</span>
                </div>
              )}
              
              {metadata.page_count && (
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{metadata.page_count}</span>
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
                  <ImageIcon className="w-3 h-3" />
                  <span>Contains Images</span>
                </Badge>
              )}
              {metadata.has_tables && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Table className="w-3 h-3" />
                  <span>Contains Tables</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Content Statistics */}
          {(metadata.word_count || metadata.paragraph_count || metadata.text_length) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Type className="w-4 h-4" />
                <span>Content Statistics</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {metadata.word_count && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-lg">{metadata.word_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                )}
                
                {metadata.paragraph_count && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-lg">{metadata.paragraph_count}</div>
                    <div className="text-sm text-gray-600">Paragraphs</div>
                  </div>
                )}
                
                {metadata.text_length && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-lg">{metadata.text_length.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Characters</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Metadata */}
          {(metadata.title || metadata.author || metadata.subject) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Document Metadata</span>
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

          {/* Keywords */}
          {metadata.keywords && metadata.keywords.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Keywords</span>
              </h4>
              
              <div className="flex flex-wrap gap-1">
                {metadata.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Document Dates */}
          {(metadata.creation_date || metadata.modification_date) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Document Dates</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {metadata.creation_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(metadata.creation_date)}</span>
                  </div>
                )}
                
                {metadata.modification_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
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
