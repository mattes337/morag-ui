import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Youtube, ExternalLink, Clock, User, Eye, ThumbsUp } from 'lucide-react';
import { 
  extractYouTubeVideoId, 
  isYouTubeUrl, 
  fetchYouTubeVideoTitle, 
  fetchVideoTitleWithFallback,
  generateDocumentNameFromTitle 
} from '../lib/utils/youtubeUtils';

const meta: Meta = {
  title: 'Utils/YouTube Utils',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive demo for YouTube utility functions that extract video metadata from URLs.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

interface VideoMetadata {
  title?: string;
  author_name?: string;
  author_url?: string;
  type?: string;
  height?: number;
  width?: number;
  version?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_height?: number;
  thumbnail_width?: number;
  thumbnail_url?: string;
  html?: string;
}

const YouTubeUtilsDemo = () => {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    videoId: string | null;
    isYouTube: boolean;
    documentName: string;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);
    setExtractedData(null);

    try {
      // Extract basic info
      const videoId = extractYouTubeVideoId(url);
      const isYouTube = isYouTubeUrl(url);
      
      setExtractedData({
        videoId,
        isYouTube,
        documentName: ''
      });

      if (!isYouTube) {
        setError('This is not a valid YouTube URL');
        return;
      }

      // Fetch metadata using oEmbed API
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const data: VideoMetadata = await response.json();
      setMetadata(data);

      // Generate document name
      if (data.title) {
        const documentName = generateDocumentNameFromTitle(data.title);
        setExtractedData(prev => prev ? { ...prev, documentName } : null);
      }

    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      
      // Try fallback method
      try {
        const title = await fetchVideoTitleWithFallback(url);
        if (title) {
          setMetadata({ title });
          const documentName = generateDocumentNameFromTitle(title);
          setExtractedData(prev => prev ? { ...prev, documentName } : null);
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const sampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    'https://youtu.be/jNQXAC9IVRw',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Youtube className="h-8 w-8 text-red-500" />
          YouTube Utils Demo
        </h1>
        <p className="text-gray-600">
          Test YouTube URL parsing and metadata extraction functionality
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>YouTube URL Input</CardTitle>
          <CardDescription>
            Enter a YouTube URL to extract video metadata and test utility functions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </div>

          {/* Sample URLs */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sample URLs:</Label>
            <div className="flex flex-wrap gap-2">
              {sampleUrls.map((sampleUrl, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setUrl(sampleUrl)}
                  className="text-xs"
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Extracted Data */}
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              URL Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Is YouTube URL</Label>
                <Badge variant={extractedData.isYouTube ? "default" : "secondary"}>
                  {extractedData.isYouTube ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Video ID</Label>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {extractedData.videoId || "Not found"}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Generated Document Name</Label>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {extractedData.documentName || "Not generated"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Display */}
      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Video Metadata
            </CardTitle>
            <CardDescription>
              Data retrieved from YouTube's oEmbed API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            {metadata.title && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Title</Label>
                <div className="text-lg font-semibold">{metadata.title}</div>
              </div>
            )}

            {/* Author */}
            {metadata.author_name && (
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Channel
                </Label>
                <div className="flex items-center gap-2">
                  <span>{metadata.author_name}</span>
                  {metadata.author_url && (
                    <a 
                      href={metadata.author_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail */}
            {metadata.thumbnail_url && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Thumbnail</Label>
                <div className="flex items-start gap-4">
                  <img 
                    src={metadata.thumbnail_url} 
                    alt="Video thumbnail"
                    className="rounded-lg shadow-md max-w-xs"
                    style={{ 
                      width: metadata.thumbnail_width ? Math.min(metadata.thumbnail_width, 300) : 'auto',
                      height: metadata.thumbnail_height ? Math.min(metadata.thumbnail_height, 200) : 'auto'
                    }}
                  />
                  <div className="text-sm text-gray-600">
                    <div>Dimensions: {metadata.thumbnail_width} × {metadata.thumbnail_height}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Provider</Label>
                <div className="text-sm">
                  {metadata.provider_name} 
                  {metadata.provider_url && (
                    <a 
                      href={metadata.provider_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Video Dimensions</Label>
                <div className="text-sm">
                  {metadata.width} × {metadata.height}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <div className="text-sm">{metadata.type}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Version</Label>
                <div className="text-sm">{metadata.version}</div>
              </div>
            </div>

            {/* Raw JSON */}
            <details className="pt-4 border-t">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Raw JSON Response
              </summary>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const Interactive: Story = {
  render: () => <YouTubeUtilsDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo for testing YouTube utility functions. Enter any YouTube URL to see extracted metadata and test the parsing functionality.',
      },
    },
  },
};

export const FunctionExamples: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">YouTube Utils Function Examples</h1>
        <p className="text-gray-600">Examples of individual utility functions</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">extractYouTubeVideoId()</CardTitle>
            <CardDescription>Extracts video ID from various YouTube URL formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') → "dQw4w9WgXcQ"</div>
              <div>extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ') → "dQw4w9WgXcQ"</div>
              <div>extractYouTubeVideoId('https://example.com') → null</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">isYouTubeUrl()</CardTitle>
            <CardDescription>Checks if a URL is a YouTube URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>isYouTubeUrl('https://www.youtube.com/watch?v=abc') → true</div>
              <div>isYouTubeUrl('https://youtu.be/abc') → true</div>
              <div>isYouTubeUrl('https://example.com') → false</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">generateDocumentNameFromTitle()</CardTitle>
            <CardDescription>Generates clean document names from video titles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>generateDocumentNameFromTitle('Amazing Video - YouTube') → "Amazing Video"</div>
              <div>generateDocumentNameFromTitle('Very Long Title That Exceeds Limits...') → "Very Long Title That Exceeds Limits..." (truncated to 100 chars)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showing the behavior of individual utility functions with different inputs.',
      },
    },
  },
};
