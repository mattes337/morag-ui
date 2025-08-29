import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const realmIdSchema = z.string().min(1, 'Realm ID is required');
export const documentIdSchema = z.string().min(1, 'Document ID is required');

// File validation schemas
export const fileTypeSchema = z.enum(['document', 'image', 'video', 'audio', 'youtube', 'website', 'markdown', 'pdf']);
export const fileSubTypeSchema = z.string().min(1, 'File subtype is required');
export const processingModeSchema = z.enum(['AUTOMATIC', 'MANUAL', 'SCHEDULED']);

// File upload validation
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Additional MIME types that browsers might send for markdown files
  'application/octet-stream', // Generic binary, often used for .md files
  '', // Empty MIME type, sometimes sent by browsers
];

export const DANGEROUS_FILE_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.dll', '.so', '.dylib'
];

// Document upload validation schema
export const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255, 'Document name too long'),
  realmId: uuidSchema,
  processingMode: processingModeSchema.optional().default('AUTOMATIC'),
  type: fileTypeSchema,
  subType: fileSubTypeSchema,
});

// User registration/update validation
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  role: z.enum(['ADMIN', 'USER', 'VIEWER']),
  password: passwordSchema.optional(),
});

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Realm validation
export const realmSchema = z.object({
  name: z.string().min(1, 'Realm name is required').max(100, 'Realm name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(1000, 'Query too long'),
  realmId: uuidSchema.optional(),
  documentId: uuidSchema.optional(),
  numResults: z.number().int().min(1).max(100).optional().default(10),
  minSimilarity: z.number().min(0).max(1).optional(),
});

// API key validation
export const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name too long'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime().optional(),
});

// File validation functions
export function validateFileType(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }
  return { isValid: true };
}

export function validateFileSize(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  return { isValid: true };
}

export function validateFileName(fileName: string): { isValid: boolean; error?: string } {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

  if (DANGEROUS_FILE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed for security reasons`
    };
  }

  // Check for path traversal attempts - look for actual path traversal patterns
  if (fileName.includes('../') || fileName.includes('..\\') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: 'File name contains invalid characters'
    };
  }

  return { isValid: true };
}

export function validateFile(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    errors.push(typeValidation.error!);
  }
  
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    errors.push(sizeValidation.error!);
  }
  
  const nameValidation = validateFileName(file.name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 1000); // Limit length
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>'"]/g, '') // Remove potential HTML/SQL injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}

// URL validation
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }
    
    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return {
          isValid: false,
          error: 'Private and localhost URLs are not allowed in production'
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

// Rate limiting helper
export function createRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${identifier}:${endpoint}`;
}

// Input validation middleware helper
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw new Error('Invalid request body');
  }
}
