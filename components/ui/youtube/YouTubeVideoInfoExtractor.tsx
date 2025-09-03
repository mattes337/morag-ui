'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { extractYouTubeVideoId, extractYouTubeVideoInfo, YouTubeVideoInfo } from '../../../lib/utils/youtubeUtils';

interface YouTubeVideoInfoExtractorProps {
  url: string;
  onVideoInfoExtracted: (videoInfo: YouTubeVideoInfo) => void;
  onError: (error: string) => void;
}

export function YouTubeVideoInfoExtractor({
  url,
  onVideoInfoExtracted,
  onError
}: YouTubeVideoInfoExtractorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoInfo = useCallback(async (videoUrl: string) => {
    setIsLoading(true);
    
    try {
      const videoInfo = await extractYouTubeVideoInfo(videoUrl);
      
      if (videoInfo) {
        onVideoInfoExtracted(videoInfo);
      } else {
        onError('Failed to extract video information');
      }

    } catch (error) {
      console.error('Failed to extract YouTube video info:', error);
      onError(error instanceof Error ? error.message : 'Failed to extract video information');
    } finally {
      setIsLoading(false);
    }
  }, [onVideoInfoExtracted, onError]);

  useEffect(() => {
    if (!url) return;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      onError('Invalid YouTube URL');
      return;
    }

    extractVideoInfo(url);
  }, [url, onError, extractVideoInfo]);

  return (
    <div className="hidden">
      {isLoading && (
        <div className="text-sm text-gray-500">
          Extracting YouTube video information...
        </div>
      )}
    </div>
  );
}
