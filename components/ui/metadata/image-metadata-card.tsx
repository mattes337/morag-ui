'use client';

import React from 'react';
import { BaseMetadataCard, BaseMetadata } from './base-metadata-card';
import { Badge } from '../badge';
import { 
  Image as ImageIcon, 
  Camera, 
  MapPin, 
  Calendar, 
  Monitor, 
  Palette,
  Eye,
  FileText,
  Info
} from 'lucide-react';

export interface ExifData {
  camera_make?: string;
  camera_model?: string;
  creation_time?: string;
  gps_coordinates?: [number, number];
  orientation?: number;
  color_space?: string;
  dpi?: [number, number];
}

export interface ImageMetadata extends BaseMetadata {
  width: number;
  height: number;
  format: string;
  mode: string;
  has_exif: boolean;
  exif_data?: ExifData;
  creation_time?: string;
  camera_make?: string;
  camera_model?: string;
  caption?: string;
  extracted_text?: string;
  confidence_scores?: {
    caption_confidence: number;
    ocr_confidence: number;
    overall_confidence: number;
  };
}

interface ImageMetadataCardProps {
  metadata: ImageMetadata;
  variant?: 'default' | 'compact';
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ImageMetadataCard({
  metadata,
  variant = 'default',
  onView,
  onDownload,
  className = ''
}: ImageMetadataCardProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const formatCoordinates = (coords?: [number, number]): string => {
    if (!coords) return 'Unknown';
    const [lat, lng] = coords;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getResolutionMegapixels = (width: number, height: number): string => {
    const megapixels = (width * height) / 1000000;
    return `${megapixels.toFixed(1)} MP`;
  };

  const getConfidenceBadge = (confidence: number, label: string) => {
    const percentage = Math.round(confidence * 100);
    const variant = percentage >= 90 ? 'default' : percentage >= 70 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="text-xs">
        {label}: {percentage}%
      </Badge>
    );
  };

  return (
    <BaseMetadataCard
      metadata={metadata}
      title="Image File"
      icon={ImageIcon}
      variant={variant}
      onView={onView}
      onDownload={onDownload}
      className={className}
    >
      {variant === 'default' && (
        <>
          {/* Image Properties */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Image Properties</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{metadata.width} × {metadata.height}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Resolution:</span>
                <span className="font-medium">{getResolutionMegapixels(metadata.width, metadata.height)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Format:</span>
                <Badge variant="outline">{metadata.format}</Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Color Mode:</span>
                <span className="font-medium">{metadata.mode}</span>
              </div>
              
              {metadata.exif_data?.dpi && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">DPI:</span>
                  <span className="font-medium">{metadata.exif_data.dpi[0]} × {metadata.exif_data.dpi[1]}</span>
                </div>
              )}
              
              {metadata.exif_data?.color_space && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Color Space:</span>
                  <span className="font-medium">{metadata.exif_data.color_space}</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Information */}
          {(metadata.camera_make || metadata.camera_model || metadata.exif_data?.camera_make) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Camera Information</span>
              </h4>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                {(metadata.camera_make || metadata.exif_data?.camera_make) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Make:</span>
                    <span className="font-medium">
                      {metadata.camera_make || metadata.exif_data?.camera_make}
                    </span>
                  </div>
                )}
                
                {(metadata.camera_model || metadata.exif_data?.camera_model) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">
                      {metadata.camera_model || metadata.exif_data?.camera_model}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Information */}
          {metadata.exif_data?.gps_coordinates && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </h4>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">GPS Coordinates:</span>
                  <span className="font-medium font-mono">
                    {formatCoordinates(metadata.exif_data.gps_coordinates)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          {(metadata.creation_time || metadata.exif_data?.creation_time) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Dates</span>
              </h4>
              
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Taken:</span>
                  <span className="font-medium">
                    {formatDate(metadata.creation_time || metadata.exif_data?.creation_time)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {(metadata.caption || metadata.extracted_text) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>AI Analysis</span>
              </h4>
              
              {metadata.caption && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Caption</span>
                    {metadata.confidence_scores?.caption_confidence && 
                      getConfidenceBadge(metadata.confidence_scores.caption_confidence, 'Confidence')
                    }
                  </div>
                  <p className="text-sm text-blue-800 italic">&ldquo;{metadata.caption}&rdquo;</p>
                </div>
              )}
              
              {metadata.extracted_text && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900 flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>Extracted Text (OCR)</span>
                    </span>
                    {metadata.confidence_scores?.ocr_confidence && 
                      getConfidenceBadge(metadata.confidence_scores.ocr_confidence, 'OCR')
                    }
                  </div>
                  <p className="text-sm text-green-800 font-mono">&ldquo;{metadata.extracted_text}&rdquo;</p>
                </div>
              )}
              
              {/* Overall Confidence */}
              {metadata.confidence_scores?.overall_confidence && (
                <div className="flex items-center space-x-2 text-sm">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Overall Analysis Confidence:</span>
                  {getConfidenceBadge(metadata.confidence_scores.overall_confidence, 'Overall')}
                </div>
              )}
            </div>
          )}

          {/* EXIF Data Available */}
          {metadata.has_exif && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">EXIF metadata is available for this image</span>
              </div>
            </div>
          )}
        </>
      )}
    </BaseMetadataCard>
  );
}
