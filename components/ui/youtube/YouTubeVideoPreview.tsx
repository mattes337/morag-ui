'use client';

import React from 'react';
import { Card, CardContent } from '../card';
import { Badge } from '../badge';
import { Button } from '../button';
import { Play, Calendar, Eye, Clock, ExternalLink } from 'lucide-react';
import { YouTubeVideoInfo, formatDuration, formatViewCount } from '../../../lib/utils/youtubeUtils';

interface YouTubeVideoPreviewProps {
  videoInfo: YouTubeVideoInfo;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function YouTubeVideoPreview({
  videoInfo,
  onConfirm,
  onCancel,
  isLoading = false
}: YouTubeVideoPreviewProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoInfo.id}`;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Video Thumbnail Section */}
        <div className="relative">
          <div className="aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default thumbnail if main one fails
                const target = e.target as HTMLImageElement;
                target.src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`;
              }}
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-200">
              <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors duration-200">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>
          </div>
          
          {/* Duration badge (if available) */}
          {videoInfo.duration && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white hover:bg-black hover:bg-opacity-80"
            >
              <Clock className="w-3 h-3 mr-1" />
              {videoInfo.duration}
            </Badge>
          )}
        </div>

        {/* Video Information Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {videoInfo.title}
          </h3>

          {/* Channel Information */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {videoInfo.channel.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{videoInfo.channel}</span>
                {videoInfo.channelUrl && (
                  <a
                    href={videoInfo.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Video Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            {videoInfo.viewCount && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{videoInfo.viewCount} views</span>
              </div>
            )}
            {videoInfo.uploadDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{videoInfo.uploadDate}</span>
              </div>
            )}
          </div>

          {/* Description Preview */}
          {videoInfo.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {videoInfo.description}
              </p>
            </div>
          )}

          {/* Verification Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Please verify this is the correct video
                </p>
                <p className="text-blue-700">
                  The video will be processed by our backend system to extract content and metadata.
                  Make sure this matches the video you intended to upload.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on YouTube</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Creating...' : 'Confirm & Create Document'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
