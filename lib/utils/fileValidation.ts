/**
 * File validation utilities for document upload
 */

export interface FileValidationError {
  code: string;
  message: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
}

// Supported file types with their MIME types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': { extension: 'pdf', name: 'PDF Document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: 'docx', name: 'Word Document' },
  'application/msword': { extension: 'doc', name: 'Word Document (Legacy)' },
  'text/plain': { extension: 'txt', name: 'Text File' },
  'application/rtf': { extension: 'rtf', name: 'Rich Text Format' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { extension: 'pptx', name: 'PowerPoint Presentation' },
  'application/vnd.ms-powerpoint': { extension: 'ppt', name: 'PowerPoint Presentation (Legacy)' },
  'text/markdown': { extension: 'md', name: 'Markdown Document' },
  'text/csv': { extension: 'csv', name: 'CSV File' },
  'application/json': { extension: 'json', name: 'JSON File' },
} as const;

// Maximum file size (50MB in bytes)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Maximum number of files that can be uploaded at once
export const MAX_FILES_COUNT = 10;

/**
 * Validates a single file
 */
export function validateFile(file: File): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check file type
  if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
    errors.push({
      code: 'UNSUPPORTED_FILE_TYPE',
      message: `File type "${file.type}" is not supported. Please upload a PDF, Word document, text file, or other supported format.`,
    });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.`,
    });
  }

  // Check for empty file
  if (file.size === 0) {
    errors.push({
      code: 'EMPTY_FILE',
      message: 'File is empty and cannot be uploaded.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files
 */
export function validateFiles(files: File[]): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check files count
  if (files.length > MAX_FILES_COUNT) {
    errors.push({
      code: 'TOO_MANY_FILES',
      message: `You can upload a maximum of ${MAX_FILES_COUNT} files at once. You selected ${files.length} files.`,
    });
  }

  // Check for duplicate file names
  const fileNames = files.map(file => file.name);
  const duplicateNames = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push({
      code: 'DUPLICATE_FILES',
      message: `Duplicate file names detected: ${[...new Set(duplicateNames)].join(', ')}`,
    });
  }

  // Validate each file individually
  files.forEach((file) => {
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      fileValidation.errors.forEach(error => {
        errors.push({
          ...error,
          message: `File "${file.name}": ${error.message}`,
        });
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the file type display name
 */
export function getFileTypeDisplayName(mimeType: string): string {
  const fileType = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES];
  return fileType?.name || 'Unknown file type';
}

/**
 * Gets the file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const fileType = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES];
  return fileType?.extension || '';
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Gets the appropriate icon name for a file type
 */
export function getFileIcon(mimeType: string): string {
  const fileType = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES];
  
  if (!fileType) return 'file';
  
  switch (fileType.extension) {
    case 'pdf':
      return 'file-text';
    case 'docx':
    case 'doc':
      return 'file-text';
    case 'pptx':
    case 'ppt':
      return 'presentation';
    case 'txt':
    case 'md':
      return 'file-text';
    case 'csv':
    case 'json':
      return 'file-code';
    default:
      return 'file';
  }
}

/**
 * Checks if drag and drop is supported
 */
export function isDragAndDropSupported(): boolean {
  return (
    'draggable' in document.createElement('div') &&
    'ondrop' in document.createElement('div') &&
    'FormData' in window &&
    'FileReader' in window
  );
}