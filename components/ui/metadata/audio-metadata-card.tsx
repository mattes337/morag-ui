'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import {
  Volume2,
  Clock,
  Users,
  Hash,
  Mic,
  Brain,
  Radio,
  Music,
  MessageSquare,
  Tag
} from 'lucide-react';

export interface AudioTopic {
  id: number;
  title: string;
  summary: string;
  start_time: number;
  end_time: number;
  duration: number;
  keywords: string[];
  speaker_distribution: Record<string, number>;
}

export interface AudioMetadata extends BaseMetadata {
  duration: number;
  sample_rate: number;
  channels: number;
  bit_depth?: number;
  bitrate?: number;
  format: string;
  language?: string;
  model_used?: string;
  word_count?: number;
  segment_count?: number;
  has_speaker_info?: boolean;
  has_topic_info?: boolean;
  num_speakers?: number;
  speakers?: string[];
  num_topics?: number;
  topics?: AudioTopic[];
  confidence_score?: number;
}

interface AudioMetadataCardProps {
  metadata: AudioMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  onPlayAudio?: () => void;
  className?: string;
}

export function AudioMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  onPlayAudio,
  className = ''
}: AudioMetadataCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return 'Unknown';
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  const formatSampleRate = (rate: number): string => {
    return `${(rate / 1000).toFixed(1)} kHz`;
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="Audio File"
      icon={Volume2}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Audio Properties */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Audio Properties</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{formatDuration(metadata.duration)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{metadata.format.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Sample Rate:</span>
                <span className="font-medium">{formatSampleRate(metadata.sample_rate)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Channels:</span>
                <span className="font-medium">{metadata.channels} {metadata.channels === 1 ? 'Mono' : 'Stereo'}</span>
              </div>
              
              {metadata.bitrate && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Bitrate:</span>
                  <span className="font-medium">{formatBitrate(metadata.bitrate)}</span>
                </div>
              )}
              
              {metadata.bit_depth && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Bit Depth:</span>
                  <span className="font-medium">{metadata.bit_depth}-bit</span>
                </div>
              )}
            </div>
          </div>

          {/* Transcription Information */}
          {(metadata.model_used || metadata.language || metadata.word_count) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Transcription</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {metadata.model_used && (
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Model:</span>
                    <Badge variant="outline">{metadata.model_used}</Badge>
                  </div>
                )}
                
                {metadata.language && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{metadata.language.toUpperCase()}</span>
                  </div>
                )}
                
                {metadata.word_count && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Words:</span>
                    <span className="font-medium">{metadata.word_count.toLocaleString()}</span>
                  </div>
                )}
                
                {metadata.segment_count && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Segments:</span>
                    <span className="font-medium">{metadata.segment_count}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speaker Information */}
          {metadata.has_speaker_info && metadata.speakers && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Speakers ({metadata.num_speakers})</span>
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {metadata.speakers.map((speaker, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <Mic className="w-3 h-3" />
                    <span>{speaker}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {metadata.has_topic_info && metadata.topics && metadata.topics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Topics ({metadata.num_topics})</span>
              </h4>
              
              <div className="space-y-3">
                {metadata.topics.slice(0, 3).map((topic, index) => (
                  <div key={topic.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{topic.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(topic.start_time)} - {formatDuration(topic.end_time)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{topic.summary}</p>
                    {topic.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 5).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {metadata.topics.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{metadata.topics.length - 3} more topics
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Play Audio Button */}
          {onPlayAudio && (
            <div className="pt-2 border-t">
              <button
                onClick={onPlayAudio}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play Audio</span>
              </button>
            </div>
          )}
        </>
      )}
    </BaseMetadataCard>
  );
}
