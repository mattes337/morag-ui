'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  Youtube, 
  User, 
  Calendar, 
  Clock, 
  Eye, 
  ThumbsUp,
  MessageSquare,
  Tag,
  ExternalLink,
  Download,
  FileText,
  Globe
} from 'lucide-react';

export interface YouTubeMetadata extends BaseMetadata {
  video_path: string;
  audio_path: string;
  subtitle_paths: string[];
  thumbnail_paths: string[];
  transcript_path: string;
  transcript_text: string;
  transcript_language: string;
  metadata: {
    id: string;
    title: string;
    description: string;
    uploader: string;
    upload_date: string;
    duration: number;
    view_count: number;
    like_count: number;
    comment_count: number;
    tags: string[];
    categories: string[];
    thumbnail_url: string;
    webpage_url: string;
    channel_id: string;
    channel_url: string;
    playlist_id?: string;
    playlist_title?: string;
    playlist_index?: number;
  };
  success: boolean;
  error_message?: string;
}

interface YouTubeMetadataCardProps {
  metadata: YouTubeMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  onPlayVideo?: () => void;
  onOpenYouTube?: () => void;
  className?: string;
}

export function YouTubeMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  onPlayVideo,
  onOpenYouTube,
  className = ''
}: YouTubeMetadataCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    // YouTube date format is YYYYMMDD
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="YouTube Video"
      icon={Youtube}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Video Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Youtube className="w-4 h-4" />
              <span>Video Details</span>
            </h4>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Title:</span>
                <p className="font-medium mt-1">{metadata.metadata.title}</p>
              </div>
              
              {metadata.metadata.description && (
                <div>
                  <span className="text-gray-600 text-sm">Description:</span>
                  <p className="text-gray-700 mt-1 text-sm line-clamp-3">
                    {metadata.metadata.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Channel Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Channel</span>
            </h4>
            
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Uploader:</span>
              <span className="font-medium">{metadata.metadata.uploader}</span>
            </div>
          </div>

          {/* Video Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Statistics</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">{formatDuration(metadata.metadata.duration)}</div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">{formatNumber(metadata.metadata.view_count)}</div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">{formatNumber(metadata.metadata.like_count)}</div>
                <div className="text-xs text-gray-600">Likes</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
                <div className="font-medium">{formatNumber(metadata.metadata.comment_count)}</div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
            </div>
          </div>

          {/* Upload Date */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Publication</span>
            </h4>
            
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Upload Date:</span>
              <span className="font-medium">{formatDate(metadata.metadata.upload_date)}</span>
            </div>
          </div>

          {/* Categories and Tags */}
          {(metadata.metadata.categories.length > 0 || metadata.metadata.tags.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Categories & Tags</span>
              </h4>
              
              {metadata.metadata.categories.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {metadata.metadata.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {metadata.metadata.tags.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {metadata.metadata.tags.slice(0, 10).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {metadata.metadata.tags.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{metadata.metadata.tags.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Playlist Information */}
          {metadata.metadata.playlist_id && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Playlist</span>
              </h4>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900">{metadata.metadata.playlist_title}</div>
                  <div className="text-blue-700 mt-1">
                    Video #{metadata.metadata.playlist_index} in playlist
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Information */}
          {metadata.transcript_text && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Transcript</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{metadata.transcript_language.toUpperCase()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Length:</span>
                  <span className="font-medium">{metadata.transcript_text.length.toLocaleString()} chars</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {metadata.transcript_text.substring(0, 200)}...
                </p>
              </div>
            </div>
          )}

          {/* Downloaded Files */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Downloaded Files</span>
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Video</Badge>
                <span className="text-gray-600">Available</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Audio</Badge>
                <span className="text-gray-600">Available</span>
              </div>
              
              {metadata.subtitle_paths.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Subtitles</Badge>
                  <span className="text-gray-600">{metadata.subtitle_paths.length} files</span>
                </div>
              )}
              
              {metadata.thumbnail_paths.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Thumbnails</Badge>
                  <span className="text-gray-600">{metadata.thumbnail_paths.length} files</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t">
            {onPlayVideo && (
              <button
                onClick={onPlayVideo}
                className="flex items-center justify-center space-x-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
              >
                <Youtube className="w-4 h-4" />
                <span>Play Video</span>
              </button>
            )}
            
            {onOpenYouTube && (
              <button
                onClick={onOpenYouTube}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open on YouTube</span>
              </button>
            )}
          </div>
        </>
      )}
    </BaseMetadataCard>
  );
}
