'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  Video, 
  Clock, 
  Monitor, 
  Volume2, 
  Eye, 
  FileText,
  Camera,
  Zap,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';

export interface VideoMetadata extends BaseMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  format: string;
  has_audio: boolean;
  audio_codec?: string;
  creation_time?: string;
  audio_processing_result?: {
    transcript: string;
    segments: any[];
    metadata: {
      processing_time: number;
      word_count: number;
      segment_count: number;
      has_speaker_info: boolean;
      has_topic_info: boolean;
      num_speakers: number;
      speakers: string[];
      num_topics: number;
    };
  };
  thumbnails?: string[];
  keyframes?: string[];
  ocr_results?: {
    text_detected: boolean;
    extracted_text: string;
    confidence: number;
  };
  transcript_length?: number;
  segments_count?: number;
  has_speaker_diarization?: boolean;
  has_topic_segmentation?: boolean;
}

interface VideoMetadataCardProps {
  metadata: VideoMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  onPlayVideo?: () => void;
  className?: string;
}

export function VideoMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  onPlayVideo,
  className = ''
}: VideoMetadataCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (bitrate: number): string => {
    return `${Math.round(bitrate / 1000000)} Mbps`;
  };

  const getResolutionLabel = (width: number, height: number): string => {
    if (width >= 3840 && height >= 2160) return '4K';
    if (width >= 1920 && height >= 1080) return '1080p';
    if (width >= 1280 && height >= 720) return '720p';
    if (width >= 854 && height >= 480) return '480p';
    return `${width}×${height}`;
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="Video File"
      icon={Video}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Video Properties */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Video Properties</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{formatDuration(metadata.duration)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Resolution:</span>
                <span className="font-medium">
                  {metadata.width}×{metadata.height} ({getResolutionLabel(metadata.width, metadata.height)})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Frame Rate:</span>
                <span className="font-medium">{metadata.fps} fps</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Codec:</span>
                <Badge variant="outline">{metadata.codec.toUpperCase()}</Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Bitrate:</span>
                <span className="font-medium">{formatBitrate(metadata.bitrate)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{metadata.format.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Audio Information */}
          {metadata.has_audio && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>Audio Track</span>
              </h4>
              
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Volume2 className="w-3 h-3" />
                  <span>Audio Present</span>
                </Badge>
                
                {metadata.audio_codec && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Codec:</span>
                    <Badge variant="outline">{metadata.audio_codec.toUpperCase()}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transcription Results */}
          {metadata.audio_processing_result && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Transcription</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Words:</span>
                  <span className="font-medium">
                    {metadata.audio_processing_result.metadata.word_count.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Segments:</span>
                  <span className="font-medium">{metadata.audio_processing_result.metadata.segment_count}</span>
                </div>
                
                {metadata.audio_processing_result.metadata.has_speaker_info && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Speakers:</span>
                    <span className="font-medium">{metadata.audio_processing_result.metadata.num_speakers}</span>
                  </div>
                )}
                
                {metadata.audio_processing_result.metadata.has_topic_info && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Topics:</span>
                    <span className="font-medium">{metadata.audio_processing_result.metadata.num_topics}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {metadata.audio_processing_result.metadata.has_speaker_info && (
                  <Badge variant="outline">Speaker Diarization</Badge>
                )}
                {metadata.audio_processing_result.metadata.has_topic_info && (
                  <Badge variant="outline">Topic Segmentation</Badge>
                )}
              </div>
            </div>
          )}

          {/* OCR Results */}
          {metadata.ocr_results && metadata.ocr_results.text_detected && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Text Recognition (OCR)</span>
              </h4>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Text Detected</span>
                  </Badge>
                  <Badge variant="secondary">
                    {Math.round(metadata.ocr_results.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 italic">
                  &ldquo;{metadata.ocr_results.extracted_text.substring(0, 150)}
                  {metadata.ocr_results.extracted_text.length > 150 ? '...' : ''}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Thumbnails */}
          {metadata.thumbnails && metadata.thumbnails.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Thumbnails ({metadata.thumbnails.length})</span>
              </h4>
              
              <div className="flex space-x-2 overflow-x-auto">
                {metadata.thumbnails.slice(0, 4).map((thumbnail, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={thumbnail}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-12 object-cover rounded border"
                    />
                  </div>
                ))}
                {metadata.thumbnails.length > 4 && (
                  <div className="flex-shrink-0 w-20 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{metadata.thumbnails.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Play Video Button */}
          {onPlayVideo && (
            <div className="pt-2 border-t">
              <button
                onClick={onPlayVideo}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Play Video</span>
              </button>
            </div>
          )}
        </>
      )}
    </BaseMetadataCard>
  );
}
