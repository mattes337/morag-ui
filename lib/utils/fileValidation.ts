/**
 * File validation utilities for document upload
 * Implements magic byte checking to prevent MIME type spoofing attacks
 */

// Enhanced file type detection with fallback to manual detection
async function detectFileTypeFromBuffer(buffer: Uint8Array): Promise<{ mime: string; ext: string } | null> {
  try {
    // Try to use file-type library for robust magic byte detection
    const { fileTypeFromBuffer } = await import('file-type').catch(() => ({ fileTypeFromBuffer: null }));
    
    if (fileTypeFromBuffer) {
      const result = await fileTypeFromBuffer(buffer);
      if (result) {
        return { mime: result.mime, ext: result.ext };
      }
    }
  } catch (error) {
    console.warn('file-type library not available, using manual detection:', error);
  }
  
  // Fallback to manual detection for supported types
  return detectFileTypeManually(buffer);
}

// Manual file type detection as fallback (client-safe implementation)
function detectFileTypeManually(buffer: Uint8Array): { mime: string; ext: string } | null {
  // PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf' };
  }
  
  // ZIP-based formats (Office documents)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    // This is a ZIP file, could be Office document
    return { mime: 'application/zip', ext: 'zip' };
  }
  
  // DOC (Legacy Office)
  if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
    return { mime: 'application/msword', ext: 'doc' };
  }
  
  // RTF
  if (buffer[0] === 0x7B && buffer[1] === 0x5C && buffer[2] === 0x72 && buffer[3] === 0x74) {
    return { mime: 'application/rtf', ext: 'rtf' };
  }
  
  // Check if it's text (UTF-8)
  const decoder = new TextDecoder('utf-8', { fatal: false });
  try {
    const text = decoder.decode(buffer.slice(0, 512));
    if (/^[\x00-\x7F\s\n\r\t]*$/.test(text) && text.trim().length > 0) {
      // Basic text validation
      if (text.includes('{') && text.includes('}')) {
        return { mime: 'application/json', ext: 'json' };
      }
      if (text.includes(',') && text.includes('\n')) {
        return { mime: 'text/csv', ext: 'csv' };
      }
      if (text.includes('#') || text.includes('*') || text.includes('[')) {
        return { mime: 'text/markdown', ext: 'md' };
      }
      return { mime: 'text/plain', ext: 'txt' };
    }
  } catch {
    // Not text
  }
  
  return null;
}

export interface FileValidationError {
  code: string;
  message: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
}

// Supported file types with their MIME types and magic byte signatures
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': { 
    extension: 'pdf', 
    name: 'PDF Document',
    magicBytes: ['PDF']
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extension: 'docx', 
    name: 'Word Document',
    magicBytes: ['docx']
  },
  'application/msword': { 
    extension: 'doc', 
    name: 'Word Document (Legacy)',
    magicBytes: ['doc']
  },
  'text/plain': { 
    extension: 'txt', 
    name: 'Text File',
    magicBytes: ['txt']
  },
  'application/rtf': { 
    extension: 'rtf', 
    name: 'Rich Text Format',
    magicBytes: ['rtf']
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { 
    extension: 'pptx', 
    name: 'PowerPoint Presentation',
    magicBytes: ['pptx']
  },
  'application/vnd.ms-powerpoint': { 
    extension: 'ppt', 
    name: 'PowerPoint Presentation (Legacy)',
    magicBytes: ['ppt']
  },
  'text/markdown': { 
    extension: 'md', 
    name: 'Markdown Document',
    magicBytes: ['md']
  },
  'text/csv': { 
    extension: 'csv', 
    name: 'CSV File',
    magicBytes: ['csv']
  },
  'application/json': { 
    extension: 'json', 
    name: 'JSON File',
    magicBytes: ['json']
  },
} as const;

// Maximum file size (50MB in bytes)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Maximum number of files that can be uploaded at once
export const MAX_FILES_COUNT = 10;

/**
 * Validates file content using magic byte detection to prevent MIME spoofing attacks
 */
export async function validateFileContent(file: File): Promise<FileValidationResult> {
  const errors: FileValidationError[] = [];

  try {
    // Read the first 4KB of the file to check magic bytes
    const buffer = await file.slice(0, 4096).arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Use enhanced file type detection with file-type library
    const detectedType = await detectFileTypeFromBuffer(uint8Array);
    
    // Check if detected type matches declared MIME type
    if (!detectedType) {
      // For text files, check if they contain valid text
      const textDecoder = new TextDecoder();
      try {
        const text = textDecoder.decode(uint8Array);
        
        // Check if it's a valid text file (markdown, csv, json, txt)
        const isTextFile = ['text/plain', 'text/markdown', 'text/csv', 'application/json'].includes(file.type);
        const hasValidTextContent = /^[\x00-\x7F\s]*$/.test(text.slice(0, 1000)); // ASCII check
        
        if (isTextFile && hasValidTextContent) {
          return { isValid: true, errors: [] };
        }
      } catch {
        // If can't decode as text, it's not a valid text file
      }
      
      errors.push({
        code: 'INVALID_FILE_CONTENT',
        message: 'File content does not match the declared file type. This could indicate a malicious file.',
      });
    } else if (detectedType.mime !== file.type) {
      // Special handling for Office documents (they're detected as zip)
      const isOfficeFile = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ].includes(file.type);
      
      const isZipDetected = detectedType.mime === 'application/zip';
      
      if (!(isOfficeFile && isZipDetected)) {
        errors.push({
          code: 'MIME_TYPE_MISMATCH',
          message: `File content (${detectedType.mime}) does not match declared type (${file.type}). Potential security risk.`,
        });
      }
    }
    
    // Enhanced security check: scan for suspicious patterns and executables
    const suspiciousPatterns = [
      /%PDF-/,      // PDF header but claimed as different type
      /PK\x03\x04/, // ZIP header but claimed as different type
      /<\?php/i,    // PHP code
      /<script/i,   // JavaScript
      /javascript:/i, // JavaScript protocol
      /on\w+\s*=/i, // Event handlers (onclick, onload, etc.)
      /eval\s*\(/i, // Eval function calls
      /document\./i, // DOM manipulation
      /window\./i,  // Window object access
      /<iframe/i,   // Iframe injection
      /<object/i,   // Object embedding
      /<embed/i,    // Embed elements
      /<form/i,     // Form elements
      /<meta/i,     // Meta tags
      /<link/i,     // Link elements
      /@import/i,   // CSS imports
      /expression\s*\(/i, // CSS expressions
      /url\s*\(/i,  // CSS URL functions
      /\x00PE\x00\x00/, // Windows PE executable
      /\x7fELF/,    // Linux ELF executable
      /MZ/,         // DOS executable header
      /\x89PNG/,    // PNG but claimed as different type
      /\xff\xd8\xff/, // JPEG but claimed as different type
      /GIF8[79]a/,  // GIF but claimed as different type
      /RIFF.*WEBP/, // WebP format
      /\x1f\x8b/,   // GZIP archive
      /Rar!/,       // RAR archive
      /7z\xbc\xaf\x27\x1c/, // 7-Zip archive
      /\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1/, // Microsoft Office compound document
      /\x50\x4b\x05\x06/, // ZIP end of central directory
      /\x50\x4b\x07\x08/, // ZIP data descriptor
    ];
    
    const fileHeader = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array.slice(0, 512));
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fileHeader)) {
        errors.push({
          code: 'SUSPICIOUS_CONTENT',
          message: 'File contains suspicious content patterns that may pose a security risk.',
        });
        break;
      }
    }
    
  } catch (error) {
    errors.push({
      code: 'CONTENT_VALIDATION_ERROR',
      message: 'Failed to validate file content. Please ensure the file is not corrupted.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single file with both MIME type and content validation
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const errors: FileValidationError[] = [];

  // Check file type (MIME type validation - still needed but not sufficient)
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

  // Perform deep content validation
  const contentValidation = await validateFileContent(file);
  errors.push(...contentValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files
 */
export async function validateFiles(files: File[]): Promise<FileValidationResult> {
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
      message: `Duplicate file names detected: ${Array.from(new Set(duplicateNames)).join(', ')}`,
    });
  }

  // Validate each file individually (with async content validation)
  const validationPromises = files.map(async (file) => {
    try {
      const fileValidation = await validateFile(file);
      if (!fileValidation.isValid) {
        return fileValidation.errors.map(error => ({
          ...error,
          message: `File "${file.name}": ${error.message}`,
        }));
      }
      return [];
    } catch (error) {
      return [{
        code: 'VALIDATION_ERROR',
        field: 'file',
        message: `File "${file.name}": Failed to validate file content`,
      }];
    }
  });

  const validationResults = await Promise.all(validationPromises);
  const fileErrors = validationResults.flat();
  
  errors.push(...fileErrors);

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