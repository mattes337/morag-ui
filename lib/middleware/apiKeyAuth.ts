import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ApiKeyAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  realm?: {
    id: string;
    name: string;
  };
  apiKey?: {
    id: string;
    name: string;
    isGeneric: boolean;
  };
  error?: string;
}

/**
 * Authenticate API key from request headers
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiKeyAuthResult> {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return {
        success: false,
        error: 'Authorization header is required'
      };
    }

    // Extract API key (format: "Bearer <api-key>" or just "<api-key>")
    const apiKey = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : authHeader;

    if (!apiKey) {
      return {
        success: false,
        error: 'API key is required'
      };
    }

    // Look up API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        },
        realm: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!apiKeyRecord) {
      return {
        success: false,
        error: 'Invalid API key'
      };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() }
    });

    return {
      success: true,
      user: {
        id: apiKeyRecord.user.id,
        email: apiKeyRecord.user.email,
        name: apiKeyRecord.user.name,
        role: apiKeyRecord.user.role,
      },
      realm: apiKeyRecord.realm ? {
        id: apiKeyRecord.realm.id,
        name: apiKeyRecord.realm.name,
      } : undefined,
      apiKey: {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        isGeneric: apiKeyRecord.isGeneric,
      }
    };
  } catch (error) {
    console.error('API key authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Middleware function to require API key authentication
 */
export async function requireApiKey(request: NextRequest): Promise<ApiKeyAuthResult> {
  const result = await authenticateApiKey(request);
  
  if (!result.success) {
    throw new Error(result.error || 'Authentication failed');
  }
  
  return result;
}

/**
 * Get API key from request for logging/tracking
 */
export function getApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  return authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7)
    : authHeader;
}
