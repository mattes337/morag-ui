/**
 * Document preview utilities
 * Handles file type detection, thumbnail generation, and preview capabilities
 */

export interface PreviewCapability {
  canPreview: boolean;
  previewType: 'pdf' | 'image' | 'text' | 'unsupported';
  requiresPlugin: boolean;
  fallbackIcon: string;
}

export interface DocumentPreviewOptions {
  maxThumbnailSize?: number;
  supportedImageTypes?: string[];
  supportedTextTypes?: string[];
  enablePdfPreview?: boolean;
}

// File type mappings
const FILE_TYPE_MAPPINGS = {
  // PDF Documents
  'application/pdf': { icon: 'FileText', color: 'text-red-500', previewType: 'pdf' as const },
  'pdf': { icon: 'FileText', color: 'text-red-500', previewType: 'pdf' as const },
  
  // Images
  'image/jpeg': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'image/jpg': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'image/png': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'image/gif': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'image/webp': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'image/svg+xml': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'jpg': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'jpeg': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'png': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'gif': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'webp': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  'svg': { icon: 'FileImage', color: 'text-green-500', previewType: 'image' as const },
  
  // Text Files
  'text/plain': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'text/markdown': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'text/html': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'text/css': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'text/javascript': { icon: 'FileText', color: 'text-yellow-500', previewType: 'text' as const },
  'application/json': { icon: 'FileText', color: 'text-yellow-500', previewType: 'text' as const },
  'txt': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'md': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'html': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'css': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'js': { icon: 'FileText', color: 'text-yellow-500', previewType: 'text' as const },
  'ts': { icon: 'FileText', color: 'text-blue-500', previewType: 'text' as const },
  'json': { icon: 'FileText', color: 'text-yellow-500', previewType: 'text' as const },
  
  // Documents
  'application/msword': { icon: 'FileText', color: 'text-blue-600', previewType: 'unsupported' as const },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'FileText', color: 'text-blue-600', previewType: 'unsupported' as const },
  'doc': { icon: 'FileText', color: 'text-blue-600', previewType: 'unsupported' as const },
  'docx': { icon: 'FileText', color: 'text-blue-600', previewType: 'unsupported' as const },
  
  // Spreadsheets
  'application/vnd.ms-excel': { icon: 'FileText', color: 'text-green-600', previewType: 'unsupported' as const },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'FileText', color: 'text-green-600', previewType: 'unsupported' as const },
  'xls': { icon: 'FileText', color: 'text-green-600', previewType: 'unsupported' as const },
  'xlsx': { icon: 'FileText', color: 'text-green-600', previewType: 'unsupported' as const },
  
  // Presentations
  'application/vnd.ms-powerpoint': { icon: 'FileText', color: 'text-orange-600', previewType: 'unsupported' as const },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'FileText', color: 'text-orange-600', previewType: 'unsupported' as const },
  'ppt': { icon: 'FileText', color: 'text-orange-600', previewType: 'unsupported' as const },
  'pptx': { icon: 'FileText', color: 'text-orange-600', previewType: 'unsupported' as const },
  
  // Audio
  'audio/mpeg': { icon: 'FileAudio', color: 'text-purple-500', previewType: 'unsupported' as const },
  'audio/wav': { icon: 'FileAudio', color: 'text-purple-500', previewType: 'unsupported' as const },
  'mp3': { icon: 'FileAudio', color: 'text-purple-500', previewType: 'unsupported' as const },
  'wav': { icon: 'FileAudio', color: 'text-purple-500', previewType: 'unsupported' as const },
  
  // Video
  'video/mp4': { icon: 'FileVideo', color: 'text-red-600', previewType: 'unsupported' as const },
  'video/webm': { icon: 'FileVideo', color: 'text-red-600', previewType: 'unsupported' as const },
  'mp4': { icon: 'FileVideo', color: 'text-red-600', previewType: 'unsupported' as const },
  'webm': { icon: 'FileVideo', color: 'text-red-600', previewType: 'unsupported' as const },
};

const DEFAULT_FILE_INFO = { 
  icon: 'File', 
  color: 'text-gray-500', 
  previewType: 'unsupported' as const 
};

/**
 * Get file type information including icon, color, and preview capability
 */
export function getFileTypeInfo(filename: string, mimeType?: string) {
  // Try MIME type first
  if (mimeType && FILE_TYPE_MAPPINGS[mimeType as keyof typeof FILE_TYPE_MAPPINGS]) {
    return FILE_TYPE_MAPPINGS[mimeType as keyof typeof FILE_TYPE_MAPPINGS];
  }
  
  // Fall back to file extension
  const extension = getFileExtension(filename);
  if (extension && FILE_TYPE_MAPPINGS[extension as keyof typeof FILE_TYPE_MAPPINGS]) {
    return FILE_TYPE_MAPPINGS[extension as keyof typeof FILE_TYPE_MAPPINGS];
  }
  
  return DEFAULT_FILE_INFO;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Determine preview capabilities for a file
 */
export function getPreviewCapability(
  filename: string, 
  mimeType?: string,
  options: DocumentPreviewOptions = {}
): PreviewCapability {
  const {
    enablePdfPreview = true,
    supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    supportedTextTypes = ['txt', 'md', 'html', 'css', 'js', 'ts', 'json']
  } = options;

  const fileInfo = getFileTypeInfo(filename, mimeType);
  const extension = getFileExtension(filename);

  switch (fileInfo.previewType) {
    case 'pdf':
      return {
        canPreview: enablePdfPreview,
        previewType: 'pdf',
        requiresPlugin: true,
        fallbackIcon: fileInfo.icon
      };
    
    case 'image':
      return {
        canPreview: supportedImageTypes.includes(extension),
        previewType: 'image',
        requiresPlugin: false,
        fallbackIcon: fileInfo.icon
      };
    
    case 'text':
      return {
        canPreview: supportedTextTypes.includes(extension),
        previewType: 'text',
        requiresPlugin: false,
        fallbackIcon: fileInfo.icon
      };
    
    default:
      return {
        canPreview: false,
        previewType: 'unsupported',
        requiresPlugin: false,
        fallbackIcon: fileInfo.icon
      };
  }
}

/**
 * Generate a thumbnail URL for a file
 * In a real implementation, this would call a thumbnail service
 */
export function generateThumbnailUrl(filename: string, fileId: string, size = 200): string | null {
  const extension = getFileExtension(filename);
  const fileInfo = getFileTypeInfo(filename);
  
  // For images, we could return the actual image URL (scaled down)
  if (fileInfo.previewType === 'image') {
    return `/api/files/${fileId}/thumbnail?size=${size}`;
  }
  
  // For PDFs, we could generate a first-page thumbnail
  if (fileInfo.previewType === 'pdf') {
    return `/api/files/${fileId}/pdf-thumbnail?size=${size}`;
  }
  
  // For other types, return null (will use icon)
  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file can be previewed inline
 */
export function canPreviewInline(filename: string, mimeType?: string): boolean {
  const capability = getPreviewCapability(filename, mimeType);
  return capability.canPreview && !capability.requiresPlugin;
}

/**
 * Get preview URL for a file
 */
export function getPreviewUrl(filename: string, fileId: string): string | null {
  const capability = getPreviewCapability(filename);
  
  if (!capability.canPreview) {
    return null;
  }
  
  switch (capability.previewType) {
    case 'pdf':
      return `/api/files/${fileId}/preview`;
    case 'image':
      return `/api/files/${fileId}`;
    case 'text':
      return `/api/files/${fileId}/text-preview`;
    default:
      return null;
  }
}

/**
 * Get download URL for a file
 */
export function getDownloadUrl(fileId: string): string {
  return `/api/files/${fileId}/download`;
}

/**
 * Determine if file type supports full-screen preview
 */
export function supportsFullscreenPreview(filename: string, mimeType?: string): boolean {
  const fileInfo = getFileTypeInfo(filename, mimeType);
  return ['pdf', 'image'].includes(fileInfo.previewType);
}

/**
 * Get appropriate ARIA label for file type
 */
export function getFileAriaLabel(filename: string, mimeType?: string): string {
  const fileInfo = getFileTypeInfo(filename, mimeType);
  const extension = getFileExtension(filename);
  
  switch (fileInfo.previewType) {
    case 'pdf':
      return `PDF document: ${filename}`;
    case 'image':
      return `Image file: ${filename}`;
    case 'text':
      return `Text file: ${filename}`;
    default:
      return `${extension.toUpperCase()} file: ${filename}`;
  }
}