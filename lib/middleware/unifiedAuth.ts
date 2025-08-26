import { NextRequest } from 'next/server';
import { getAuthUser, AuthUser } from '../auth';
import { authenticateApiKey, ApiKeyAuthResult } from './apiKeyAuth';
import { UserService } from '../services/userService';
import { RealmService } from '../services/realmService';
import { StartupService } from '../services/startupService';
import { jobScheduler } from '../services/jobScheduler';

export interface UnifiedAuthResult {
  success: boolean;
  user?: AuthUser;
  realm?: {
    id: string;
    name: string;
  };
  authMethod?: 'session' | 'apikey';
  isGenericApiKey?: boolean;
  error?: string;
}

/**
 * Unified authentication that supports both session and API key authentication
 * This allows endpoints to work with both UI (session) and automation (API key)
 */
export async function authenticateUnified(request: NextRequest): Promise<UnifiedAuthResult> {
  try {
    // Ensure database is initialized
    await StartupService.initialize();

    // Initialize background services on first API call (singleton pattern)
    // Use the job scheduler's isRunning check to prevent multiple initializations
    if (!jobScheduler.isRunning()) {
      // Don't await this - let it initialize in the background
      jobScheduler.start().catch(error => {
        console.warn('Background services initialization failed:', error);
      });
    }

    // First try API key authentication (for automation)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const apiKeyResult = await authenticateApiKey(request);
      if (apiKeyResult.success) {
        return {
          success: true,
          user: {
            userId: apiKeyResult.user!.id,
            email: apiKeyResult.user!.email,
            name: apiKeyResult.user!.name,
            role: apiKeyResult.user!.role, // Use actual user role
            authMethod: 'jwt' // Keep consistent with AuthUser interface
          },
          realm: apiKeyResult.realm,
          authMethod: 'apikey',
          isGenericApiKey: apiKeyResult.apiKey?.isGeneric || false
        };
      }
    }

    // Fall back to session authentication (for UI)
    const sessionUser = await getAuthUser(request);
    if (sessionUser) {
      // For session auth, get the current realm from user settings
      let currentRealm = null;
      try {
        // Check for realm ID in headers (for API calls with session auth)
        const realmIdFromHeader = request.headers.get('x-realm-id');
        if (realmIdFromHeader) {
          currentRealm = await RealmService.getRealmById(realmIdFromHeader, sessionUser.userId);
        }

        // If no header realm, get from user settings
        if (!currentRealm) {
          const userSettings = await UserService.getUserSettings(sessionUser.userId);
          if (userSettings?.currentRealmId) {
            currentRealm = await RealmService.getRealmById(userSettings.currentRealmId, sessionUser.userId);
          }
        }

        // If still no realm, ensure user has a default realm
        if (!currentRealm) {
          currentRealm = await RealmService.ensureUserHasDefaultRealm(sessionUser.userId);
        }
      } catch (error) {
        console.error('Error getting realm context for session user:', error);
        // Continue without realm context - some endpoints might not need it
      }

      return {
        success: true,
        user: sessionUser,
        realm: currentRealm ? {
          id: currentRealm.id,
          name: currentRealm.name
        } : undefined,
        authMethod: 'session'
      };
    }

    return {
      success: false,
      error: 'Authentication required'
    };
  } catch (error) {
    console.error('Unified authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Require unified authentication - throws error if not authenticated
 */
export async function requireUnifiedAuth(request: NextRequest): Promise<UnifiedAuthResult> {
  const result = await authenticateUnified(request);
  
  if (!result.success) {
    throw new Error(result.error || 'Authentication required');
  }
  
  return result;
}

/**
 * Optional unified authentication - returns null if not authenticated
 */
export async function getUnifiedAuth(request: NextRequest): Promise<UnifiedAuthResult | null> {
  const result = await authenticateUnified(request);
  return result.success ? result : null;
}
