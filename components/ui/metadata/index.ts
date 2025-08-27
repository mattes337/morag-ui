// Base metadata card
export { BaseMetadataCard } from './base-metadata-card';
export type { BaseMetadata } from './base-metadata-card';

// Specific metadata cards
export { PDFMetadataCard } from './pdf-metadata-card';
export type { PDFMetadata } from './pdf-metadata-card';

export { WordMetadataCard } from './word-metadata-card';
export type { WordMetadata } from './word-metadata-card';

export { TextMetadataCard } from './text-metadata-card';
export type { TextMetadata } from './text-metadata-card';

export { AudioMetadataCard } from './audio-metadata-card';
export type { AudioMetadata, AudioTopic } from './audio-metadata-card';

export { VideoMetadataCard } from './video-metadata-card';
export type { VideoMetadata } from './video-metadata-card';

export { ImageMetadataCard } from './image-metadata-card';
export type { ImageMetadata, ExifData } from './image-metadata-card';

export { WebMetadataCard } from './web-metadata-card';
export type { WebMetadata } from './web-metadata-card';

export { YouTubeMetadataCard } from './youtube-metadata-card';
export type { YouTubeMetadata } from './youtube-metadata-card';

// Utility function to determine which metadata card to use
export function getMetadataCardComponent(contentType: string, filename?: string) {
  // Normalize content type
  const type = contentType.toLowerCase();
  const ext = filename?.split('.').pop()?.toLowerCase();

  // PDF documents
  if (type.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }

  // Word documents
  if (type.includes('word') || type.includes('msword') || 
      type.includes('officedocument.wordprocessingml') ||
      ext === 'doc' || ext === 'docx') {
    return 'word';
  }

  // Text files
  if (type.includes('text') || ext === 'txt' || ext === 'md' || ext === 'rtf') {
    return 'text';
  }

  // Audio files
  if (type.includes('audio') || 
      ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext || '')) {
    return 'audio';
  }

  // Video files
  if (type.includes('video') || 
      ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext || '')) {
    return 'video';
  }

  // Image files
  if (type.includes('image') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'].includes(ext || '')) {
    return 'image';
  }

  // Web content (HTML)
  if (type.includes('html') || ext === 'html' || ext === 'htm') {
    return 'web';
  }

  // YouTube (special case - would need to be determined by source URL or metadata)
  // This would typically be determined by checking if the source URL contains youtube.com
  // or if there's specific YouTube metadata present

  // Default to base metadata card
  return 'base';
}

// Helper function to determine if content is from YouTube
export function isYouTubeContent(url?: string, metadata?: any): boolean {
  if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
    return true;
  }
  
  if (metadata && (metadata.webpage_url?.includes('youtube.com') || 
                   metadata.webpage_url?.includes('youtu.be'))) {
    return true;
  }
  
  return false;
}
