'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Alert, AlertDescription } from '../alert';
import { Loader2, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { YouTubeVideoInfoExtractor } from './YouTubeVideoInfoExtractor';
import { YouTubeVideoPreview } from './YouTubeVideoPreview';
import { isYouTubeUrl, generateDocumentNameFromTitle, YouTubeVideoInfo } from '../../../lib/utils/youtubeUtils';

interface YouTubeInputHandlerProps {
  initialUrl?: string;
  onUrlProcessed: (data: {
    url: string;
    videoInfo: YouTubeVideoInfo;
    suggestedName: string;
  }) => void;
  onError: (error: string) => void;
  className?: string;
}

export function YouTubeInputHandler({
  initialUrl = '',
  onUrlProcessed,
  onError,
  className
}: YouTubeInputHandlerProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedVideoInfo, setExtractedVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'processing'>(initialUrl ? 'processing' : 'input');
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError(null);
    setCurrentStep('processing');
    setIsProcessing(true);
  };

  const handleVideoInfoExtracted = (videoInfo: YouTubeVideoInfo) => {
    setExtractedVideoInfo(videoInfo);
    setCurrentStep('preview');
    setIsProcessing(false);
  };

  const handleExtractionError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
    setCurrentStep('input');
    onError(errorMessage);
  };

  const handleConfirmVideo = () => {
    if (!extractedVideoInfo) return;

    const suggestedName = generateDocumentNameFromTitle(extractedVideoInfo.title);

    onUrlProcessed({
      url,
      videoInfo: extractedVideoInfo,
      suggestedName
    });
  };

  const handleReset = () => {
    setUrl('');
    setExtractedVideoInfo(null);
    setCurrentStep('input');
    setError(null);
    setIsProcessing(false);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'input', label: 'Enter URL', completed: currentStep !== 'input' },
      { id: 'processing', label: 'Extract Info', completed: currentStep === 'preview' },
      { id: 'preview', label: 'Verify Video', completed: false },
    ];

    return (
      <div className="flex items-center space-x-2 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step.completed ? <CheckCircle className="w-3 h-3" /> : index + 1}
              </div>
              <span className={`text-sm ${
                step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${
                steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-red-600" />
          <span>YouTube Video Processing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: URL Input */}
        {currentStep === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={!url.trim()}>
                  Next
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Enter a YouTube video URL to extract metadata and content for processing.
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Extracting video information from YouTube...
              </span>
            </div>

            <YouTubeVideoInfoExtractor
              url={url}
              onVideoInfoExtracted={handleVideoInfoExtracted}
              onError={handleExtractionError}
            />
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 'preview' && extractedVideoInfo && (
          <div className="space-y-4">
            <YouTubeVideoPreview
              videoInfo={extractedVideoInfo}
              onConfirm={handleConfirmVideo}
              onCancel={handleReset}
              isLoading={isProcessing}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
