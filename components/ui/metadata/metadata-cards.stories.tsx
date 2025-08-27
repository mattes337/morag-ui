import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { 
  PDFMetadataCard, 
  WordMetadataCard, 
  TextMetadataCard, 
  AudioMetadataCard, 
  VideoMetadataCard, 
  ImageMetadataCard, 
  WebMetadataCard, 
  YouTubeMetadataCard 
} from './index';

const meta: Meta = {
  title: 'Components/Metadata Cards',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// PDF Metadata Card Stories
export const PDFDocument: StoryObj<typeof PDFMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <PDFMetadataCard
        metadata={{
          filename: "research-paper.pdf",
          file_size: 2048576,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "application/pdf",
          processing_time: 45.2,
          quality_score: 0.95,
          page_count: 15,
          title: "Advanced Machine Learning Techniques in Natural Language Processing",
          author: "Dr. Jane Smith, Prof. John Doe",
          subject: "Machine Learning Research",
          creator: "LaTeX with hyperref package",
          producer: "pdfTeX-1.40.21",
          creation_date: "2024-01-15T10:30:00Z",
          modification_date: "2024-01-15T11:45:00Z",
          language: "en",
          processing_method: "docling",
          extraction_quality: 0.95,
          has_images: true,
          has_tables: true,
          text_length: 45000,
          chunk_count: 12,
          warnings: ["Some images may have low resolution"]
        }}
        onView={() => console.log('View PDF')}
        onDownload={() => console.log('Download PDF')}
      />
    </div>
  ),
};

// Word Document Card
export const WordDocument: StoryObj<typeof WordMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <WordMetadataCard
        metadata={{
          filename: "project-proposal.docx",
          file_size: 1024000,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          processing_time: 25.1,
          quality_score: 0.92,
          title: "Q1 2024 Project Proposal",
          author: "Marketing Team",
          subject: "Strategic Planning",
          keywords: ["strategy", "planning", "Q1", "goals"],
          creation_date: "2024-01-15T10:30:00Z",
          modification_date: "2024-01-16T14:20:00Z",
          language: "en",
          word_count: 2500,
          paragraph_count: 45,
          page_count: 8,
          has_images: false,
          has_tables: true,
          text_length: 15000,
          chunk_count: 8
        }}
        onView={() => console.log('View Word document')}
        onDownload={() => console.log('Download Word document')}
      />
    </div>
  ),
};

// Audio File Card
export const AudioFile: StoryObj<typeof AudioMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <AudioMetadataCard
        metadata={{
          filename: "meeting-recording.mp3",
          file_size: 5242880,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "audio/mpeg",
          processing_time: 85.3,
          confidence_score: 0.92,
          duration: 300.5,
          sample_rate: 44100,
          channels: 2,
          bit_depth: 16,
          bitrate: 128000,
          format: "MP3",
          language: "en",
          model_used: "whisper-large-v3",
          word_count: 1250,
          segment_count: 25,
          has_speaker_info: true,
          has_topic_info: true,
          num_speakers: 2,
          speakers: ["SPEAKER_00", "SPEAKER_01"],
          num_topics: 3,
          topics: [
            {
              id: 0,
              title: "Project Introduction",
              summary: "Opening remarks and project overview discussion",
              start_time: 0.0,
              end_time: 45.2,
              duration: 45.2,
              keywords: ["introduction", "project", "overview"],
              speaker_distribution: {"SPEAKER_00": 0.8, "SPEAKER_01": 0.2}
            },
            {
              id: 1,
              title: "Technical Requirements",
              summary: "Detailed discussion of technical specifications",
              start_time: 45.2,
              end_time: 180.5,
              duration: 135.3,
              keywords: ["technical", "requirements", "specifications"],
              speaker_distribution: {"SPEAKER_00": 0.4, "SPEAKER_01": 0.6}
            }
          ]
        }}
        onView={() => console.log('View audio transcript')}
        onDownload={() => console.log('Download audio file')}
        onPlayAudio={() => console.log('Play audio')}
      />
    </div>
  ),
};

// Video File Card
export const VideoFile: StoryObj<typeof VideoMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <VideoMetadataCard
        metadata={{
          filename: "presentation.mp4",
          file_size: 104857600,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "video/mp4",
          processing_time: 120.5,
          quality_score: 0.88,
          duration: 600.0,
          width: 1920,
          height: 1080,
          fps: 30.0,
          codec: "h264",
          bitrate: 5000000,
          format: "mp4",
          has_audio: true,
          audio_codec: "aac",
          creation_time: "2024-01-15T14:30:00Z",
          audio_processing_result: {
            transcript: "Welcome to today's presentation...",
            segments: [],
            metadata: {
              processing_time: 85.3,
              word_count: 2500,
              segment_count: 45,
              has_speaker_info: true,
              has_topic_info: true,
              num_speakers: 1,
              speakers: ["SPEAKER_00"],
              num_topics: 8
            }
          },
          thumbnails: ["/api/thumbnails/thumb1.jpg", "/api/thumbnails/thumb2.jpg"],
          ocr_results: {
            text_detected: true,
            extracted_text: "Quarterly Results - Q4 2023",
            confidence: 0.87
          }
        }}
        onView={() => console.log('View video')}
        onDownload={() => console.log('Download video')}
        onPlayVideo={() => console.log('Play video')}
      />
    </div>
  ),
};

// Image File Card
export const ImageFile: StoryObj<typeof ImageMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <ImageMetadataCard
        metadata={{
          filename: "vacation-photo.jpg",
          file_size: 2048000,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "image/jpeg",
          processing_time: 3.2,
          confidence_score: 0.94,
          width: 2048,
          height: 1536,
          format: "JPEG",
          mode: "RGB",
          has_exif: true,
          exif_data: {
            camera_make: "Canon",
            camera_model: "EOS R5",
            creation_time: "2024-01-15T14:30:00Z",
            gps_coordinates: [40.7128, -74.0060],
            orientation: 1,
            color_space: "sRGB",
            dpi: [300, 300]
          },
          creation_time: "2024-01-15T14:30:00Z",
          camera_make: "Canon",
          camera_model: "EOS R5",
          caption: "A beautiful sunset over the mountains with a lake in the foreground",
          extracted_text: "Welcome to Yellowstone National Park",
          confidence_scores: {
            caption_confidence: 0.94,
            ocr_confidence: 0.87,
            overall_confidence: 0.90
          }
        }}
        onView={() => console.log('View image')}
        onDownload={() => console.log('Download image')}
      />
    </div>
  ),
};

// Web Page Card
export const WebPage: StoryObj<typeof WebMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <WebMetadataCard
        metadata={{
          filename: "article.html",
          file_size: 52428,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "text/html",
          processing_time: 2.1,
          url: "https://example.com/article/machine-learning-trends-2024",
          title: "Machine Learning Trends to Watch in 2024",
          content: "The field of machine learning continues to evolve...",
          markdown_content: "# Machine Learning Trends to Watch in 2024\n\nThe field of machine learning...",
          metadata: {
            description: "Explore the latest trends and developments in machine learning for 2024",
            author: "Tech Insights Team",
            publication_date: "2024-01-15T10:00:00Z",
            language: "en",
            domain: "example.com",
            content_type: "text/html",
            status_code: 200,
            word_count: 1500,
            paragraph_count: 25,
            heading_count: 8,
            has_structured_data: true,
            schema_types: ["Article", "Organization"]
          },
          links: [
            "https://example.com/related-article-1",
            "https://example.com/related-article-2",
            "https://example.com/author/tech-insights"
          ],
          images: [
            "https://example.com/images/ml-trends.jpg",
            "https://example.com/images/ai-chart.png"
          ],
          extraction_time: 2.1,
          content_length: 8500
        }}
        onView={() => console.log('View web content')}
        onDownload={() => console.log('Download web content')}
        onOpenUrl={() => console.log('Open original URL')}
      />
    </div>
  ),
};

// YouTube Video Card
export const YouTubeVideo: StoryObj<typeof YouTubeMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <YouTubeMetadataCard
        metadata={{
          filename: "youtube-video.mp4",
          file_size: 104857600,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "video/mp4",
          processing_time: 180.3,
          video_path: "/downloads/video.mp4",
          audio_path: "/downloads/audio.mp3",
          subtitle_paths: ["/downloads/subtitles.vtt"],
          thumbnail_paths: ["/downloads/thumb1.jpg", "/downloads/thumb2.jpg"],
          transcript_path: "/downloads/transcript.txt",
          transcript_text: "Welcome to today's tutorial on machine learning...",
          transcript_language: "en",
          metadata: {
            id: "dQw4w9WgXcQ",
            title: "Machine Learning Tutorial: Getting Started with Neural Networks",
            description: "In this comprehensive tutorial, we'll explore the fundamentals of neural networks...",
            uploader: "AI Education Channel",
            upload_date: "20240115",
            duration: 900.0,
            view_count: 50000,
            like_count: 1200,
            comment_count: 85,
            tags: ["machine learning", "neural networks", "AI", "tutorial", "education"],
            categories: ["Education"],
            thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            webpage_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
            channel_id: "UC1234567890",
            channel_url: "https://youtube.com/channel/UC1234567890",
            playlist_id: "PLrAXtmRdnEQy1234567890",
            playlist_title: "Machine Learning Fundamentals",
            playlist_index: 3
          },
          success: true
        }}
        onView={() => console.log('View YouTube content')}
        onDownload={() => console.log('Download YouTube files')}
        onPlayVideo={() => console.log('Play YouTube video')}
        onOpenYouTube={() => console.log('Open on YouTube')}
      />
    </div>
  ),
};

// Text File Card
export const TextFile: StoryObj<typeof TextMetadataCard> = {
  render: () => (
    <div className="max-w-2xl">
      <TextMetadataCard
        metadata={{
          filename: "notes.md",
          file_size: 8192,
          created_at: "2024-01-15T10:30:00Z",
          content_type: "text/markdown",
          processing_time: 1.2,
          quality_score: 1.0,
          encoding: "utf-8",
          line_count: 150,
          language: "en",
          text_length: 7500,
          chunk_count: 3
        }}
        onView={() => console.log('View text file')}
        onDownload={() => console.log('Download text file')}
      />
    </div>
  ),
};

// Compact variants showcase
export const CompactVariants: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compact Card Variants</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PDFMetadataCard
          variant="compact"
          metadata={{
            filename: "document.pdf",
            file_size: 1024000,
            created_at: "2024-01-15T10:30:00Z",
            content_type: "application/pdf",
            quality_score: 0.95,
            page_count: 10
          }}
        />
        <AudioMetadataCard
          variant="compact"
          metadata={{
            filename: "audio.mp3",
            file_size: 5242880,
            created_at: "2024-01-15T10:30:00Z",
            content_type: "audio/mpeg",
            confidence_score: 0.92,
            duration: 300.5,
            sample_rate: 44100,
            channels: 2,
            format: "MP3"
          }}
        />
        <ImageMetadataCard
          variant="compact"
          metadata={{
            filename: "photo.jpg",
            file_size: 2048000,
            created_at: "2024-01-15T10:30:00Z",
            content_type: "image/jpeg",
            confidence_score: 0.94,
            width: 2048,
            height: 1536,
            format: "JPEG",
            mode: "RGB",
            has_exif: true
          }}
        />
        <TextMetadataCard
          variant="compact"
          metadata={{
            filename: "notes.txt",
            file_size: 8192,
            created_at: "2024-01-15T10:30:00Z",
            content_type: "text/plain",
            quality_score: 1.0,
            encoding: "utf-8",
            line_count: 150,
            text_length: 7500
          }}
        />
      </div>
    </div>
  ),
};
