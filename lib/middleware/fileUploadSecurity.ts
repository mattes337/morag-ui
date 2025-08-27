import { NextRequest } from 'next/server';
import { validateFile, validateFileName } from '../validation';

export interface FileUploadSecurityOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  scanForViruses?: boolean;
  checkMagicBytes?: boolean;
}

export interface FileSecurityResult {
  isSecure: boolean;
  errors: string[];
  warnings: string[];
}

// MIME type to magic bytes mapping for file type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]], // ZIP
  'text/plain': [], // Text files don't have reliable magic bytes
  'text/markdown': [], // Markdown files don't have reliable magic bytes
};

/**
 * Validate file upload security
 */
export async function validateFileUploadSecurity(
  file: File,
  options: FileUploadSecurityOptions = {}
): Promise<FileSecurityResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic file validation
  const basicValidation = validateFile(file);
  if (!basicValidation.isValid) {
    errors.push(...basicValidation.errors);
  }

  // File name validation
  const nameValidation = validateFileName(file.name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }

  // Check for double extensions (potential security risk)
  const fileName = file.name.toLowerCase();

  // Count meaningful extensions (not consecutive dots)
  // Split by dots and filter out empty strings (consecutive dots)
  const parts = fileName.split('.');
  const meaningfulParts = parts.filter(part => part.length > 0);

  // If we have more than 2 meaningful parts (name + extension), it might be suspicious
  // But allow cases like "file....md" where there are just extra dots before the extension
  if (meaningfulParts.length > 2) {
    // Check if it's just extra dots before a single extension
    const lastPart = meaningfulParts[meaningfulParts.length - 1];
    const beforeLastPart = meaningfulParts[meaningfulParts.length - 2];

    // If the second-to-last part is very short, it might just be extra dots
    if (beforeLastPart.length > 3) {
      warnings.push('File has multiple extensions, which could be a security risk');
    }
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
    /^\./,  // Hidden files
    /\s+$/, // Trailing whitespace
    /[<>:"|?*]/, // Invalid characters
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      errors.push('File name contains suspicious patterns');
      break;
    }
  }

  // Verify MIME type matches file extension (but be lenient with markdown files)
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const mimeTypeValidation = validateMimeTypeExtensionMatch(file.type, extension);
  if (!mimeTypeValidation.isValid) {
    // Be more lenient with markdown files as browsers send different MIME types
    if (extension.toLowerCase() === '.md' && (file.type === 'application/octet-stream' || file.type === '' || file.type === 'text/plain')) {
      warnings.push('Markdown file detected with generic MIME type - this is normal');
    } else {
      errors.push(mimeTypeValidation.error!);
    }
  }

  // Check magic bytes if enabled
  if (options.checkMagicBytes !== false) {
    try {
      const magicBytesValidation = await validateMagicBytes(file);
      if (!magicBytesValidation.isValid) {
        errors.push(magicBytesValidation.error!);
      }
    } catch (error) {
      warnings.push('Could not verify file magic bytes');
    }
  }

  // Check for embedded executables or scripts
  try {
    if (await containsSuspiciousContent(file)) {
      errors.push('File contains suspicious content that could be malicious');
    }
  } catch (error) {
    // If we can't analyze the file, add a warning but don't fail the validation
    warnings.push('Could not analyze file content for suspicious patterns');
  }

  return {
    isSecure: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate that MIME type matches file extension
 */
function validateMimeTypeExtensionMatch(mimeType: string, extension: string): { isValid: boolean; error?: string } {
  const mimeToExtension: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt', '.text', '.md'], // Allow .md files with text/plain MIME type
    'text/markdown': ['.md', '.markdown'],
    'application/octet-stream': ['.md', '.markdown'], // Allow .md files with generic MIME type
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    '': ['.md', '.markdown'], // Allow .md files with empty MIME type
  };

  const expectedExtensions = mimeToExtension[mimeType];
  if (!expectedExtensions) {
    // Special case for markdown files with empty or unknown MIME types
    if (extension.toLowerCase() === '.md' || extension.toLowerCase() === '.markdown') {
      return { isValid: true };
    }
    return { isValid: true }; // Unknown MIME type, let other validation handle it
  }

  if (!expectedExtensions.includes(extension.toLowerCase())) {
    return {
      isValid: false,
      error: `File extension ${extension} does not match MIME type ${mimeType}`
    };
  }

  return { isValid: true };
}

/**
 * Validate file magic bytes
 */
async function validateMagicBytes(file: File): Promise<{ isValid: boolean; error?: string }> {
  const expectedMagicBytes = MAGIC_BYTES[file.type];
  if (!expectedMagicBytes || expectedMagicBytes.length === 0) {
    return { isValid: true }; // No magic bytes to check
  }

  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check if any of the expected magic byte patterns match
    for (const pattern of expectedMagicBytes) {
      if (pattern.length <= bytes.length) {
        let matches = true;
        for (let i = 0; i < pattern.length; i++) {
          if (bytes[i] !== pattern[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return { isValid: true };
        }
      }
    }

    return {
      isValid: false,
      error: `File magic bytes do not match declared MIME type ${file.type}`
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Could not read file magic bytes'
    };
  }
}

/**
 * Check for suspicious content in files
 */
async function containsSuspiciousContent(file: File): Promise<boolean> {
  try {
    // For text-based files, check for suspicious patterns
    if (file.type.startsWith('text/') || file.type === 'application/javascript') {
      const text = await file.text();
      
      // Check for common script injection patterns
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
        /eval\(/i,
        /document\.write/i,
        /innerHTML/i,
        /\bexec\b/i,
        /\bsystem\b/i,
        /\bshell\b/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(text)) {
          return true;
        }
      }
    }

    // For binary files, check for embedded executables
    if (file.size > 0) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check for PE header (Windows executable)
      if (bytes.length > 64) {
        const peOffset = bytes[60] | (bytes[61] << 8) | (bytes[62] << 16) | (bytes[63] << 24);
        if (peOffset < bytes.length - 4) {
          if (bytes[peOffset] === 0x50 && bytes[peOffset + 1] === 0x45) {
            return true; // PE executable found
          }
        }
      }
      
      // Check for ELF header (Linux executable)
      if (bytes.length > 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
        return true; // ELF executable found
      }
      
      // Check for Mach-O header (macOS executable)
      if (bytes.length > 4) {
        const magic = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
        if (magic === 0xFEEDFACE || magic === 0xFEEDFACF || magic === 0xCAFEBABE) {
          return true; // Mach-O executable found
        }
      }
    }

    return false;
  } catch (error) {
    // If we can't analyze the file, don't assume it's malicious
    // Let other validation layers handle security
    throw error; // Re-throw so the caller can handle it appropriately
  }
}

/**
 * Sanitize file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

/**
 * Generate secure file path
 */
export function generateSecureFilePath(originalName: string, documentId: string): string {
  const sanitizedName = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${documentId}/${timestamp}_${random}_${sanitizedName}`;
}
