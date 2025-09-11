/**
 * useUserSettings Hook
 * Manages user profile, account settings, notifications, and API keys
 * with auto-save functionality and comprehensive state management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  AccountSecurity, 
  NotificationPreferences, 
  APIKey,
  UserDataExport,
  mockUserProfile,
  mockAccountSecurity,
  mockNotificationPreferences,
  mockApiKeys,
  mockDataExports,
  passwordValidationRules
} from '../mockData/userSettings';

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiKeyCreateRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
  ipRestrictions: string[];
}

interface UseUserSettingsReturn {
  // Profile data
  profile: UserProfile;
  security: AccountSecurity;
  notifications: NotificationPreferences;
  apiKeys: APIKey[];
  dataExports: UserDataExport[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string>;
  
  // Security actions
  changePassword: (request: PasswordChangeRequest) => Promise<boolean>;
  enable2FA: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  disable2FA: (confirmationCode: string) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  
  // Notification actions
  updateNotifications: (updates: Partial<NotificationPreferences>) => Promise<boolean>;
  testNotification: (type: keyof NotificationPreferences['email']) => Promise<boolean>;
  
  // API key actions
  createApiKey: (request: ApiKeyCreateRequest) => Promise<APIKey>;
  revokeApiKey: (keyId: string) => Promise<boolean>;
  regenerateApiKey: (keyId: string) => Promise<APIKey>;
  updateApiKeyPermissions: (keyId: string, permissions: string[]) => Promise<boolean>;
  
  // Data export actions
  requestDataExport: (options: {
    format: 'json' | 'csv' | 'xml';
    includeDocuments: boolean;
    includeAnalytics: boolean;
    includeActivityLogs: boolean;
  }) => Promise<UserDataExport>;
  
  // Utility functions
  validatePassword: (password: string) => PasswordStrength;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  deleteAccount: (confirmationText: string) => Promise<boolean>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useUserSettings(): UseUserSettingsReturn {
  // State management
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [security, setSecurity] = useState<AccountSecurity>(mockAccountSecurity);
  const [notifications, setNotifications] = useState<NotificationPreferences>(mockNotificationPreferences);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockApiKeys);
  const [dataExports, setDataExports] = useState<UserDataExport[]>(mockDataExports);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingChanges = useRef<boolean>(false);
  
  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    pendingChanges.current = true;
    
    autoSaveTimer.current = setTimeout(async () => {
      if (pendingChanges.current) {
        setIsSaving(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setLastSaved(new Date());
        setIsSaving(false);
        pendingChanges.current = false;
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, []);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);
  
  // Profile actions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      setError(null);
      setProfile(prev => ({ ...prev, ...updates }));
      scheduleAutoSave();
      return true;
    } catch (error) {
      setError('Failed to update profile');
      return false;
    }
  }, [scheduleAutoSave]);
  
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Simulate upload with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock avatar URL
      const avatarUrl = `https://images.unsplash.com/photo-${Date.now()}?w=100&h=100&fit=crop&crop=face`;
      
      await updateProfile({ avatar: avatarUrl });
      setIsLoading(false);
      
      return avatarUrl;
    } catch (error) {
      setIsLoading(false);
      setError('Failed to upload avatar');
      throw error;
    }
  }, [updateProfile]);
  
  // Security actions
  const validatePassword = useCallback((password: string): PasswordStrength => {
    const rules = passwordValidationRules;
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length < rules.minLength) {
      feedback.push(`Password must be at least ${rules.minLength} characters long`);
    } else if (password.length >= rules.minLength) {
      score += 20;
    }
    
    // Uppercase check
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 20;
    }
    
    // Lowercase check
    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 20;
    }
    
    // Number check
    if (rules.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 20;
    }
    
    // Special character check
    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    }
    
    // Common password check
    if (rules.commonPasswords.includes(password.toLowerCase())) {
      feedback.push('This password is too common');
      score = Math.max(0, score - 40);
    }
    
    // Determine level
    let level: PasswordStrength['level'];
    if (score < 40) level = 'weak';
    else if (score < 60) level = 'fair';
    else if (score < 80) level = 'good';
    else level = 'strong';
    
    return {
      score,
      level,
      feedback,
      isValid: feedback.length === 0 && score >= 60
    };
  }, []);
  
  const changePassword = useCallback(async (request: PasswordChangeRequest): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Validate new password
      const strength = validatePassword(request.newPassword);
      if (!strength.isValid) {
        setError('New password does not meet requirements');
        setIsLoading(false);
        return false;
      }
      
      // Check password confirmation
      if (request.newPassword !== request.confirmPassword) {
        setError('Password confirmation does not match');
        setIsLoading(false);
        return false;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurity(prev => ({
        ...prev,
        lastPasswordChange: new Date().toISOString()
      }));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      setError('Failed to change password');
      return false;
    }
  }, [validatePassword]);
  
  const enable2FA = useCallback(async (): Promise<{ qrCode: string; backupCodes: string[] }> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const backupCodes = [
        '12345-67890', '09876-54321', '11111-22222', '33333-44444',
        '55555-66666', '77777-88888', '99999-00000', '12121-34343'
      ];
      
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: true,
        backupCodesGenerated: true
      }));
      
      setIsLoading(false);
      return { qrCode, backupCodes };
    } catch (error) {
      setIsLoading(false);
      setError('Failed to enable 2FA');
      throw error;
    }
  }, []);
  
  const disable2FA = useCallback(async (confirmationCode: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate code validation
      if (confirmationCode.length !== 6) {
        setError('Invalid confirmation code');
        setIsLoading(false);
        return false;
      }
      
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: false
      }));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      setError('Failed to disable 2FA');
      return false;
    }
  }, []);
  
  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const codes = Array.from({ length: 8 }, (_, i) => 
        `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 90000) + 10000}`
      );
      
      return codes;
    } catch (error) {
      setError('Failed to generate backup codes');
      throw error;
    }
  }, []);
  
  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSecurity(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.id !== sessionId)
      }));
      
      return true;
    } catch (error) {
      setError('Failed to revoke session');
      return false;
    }
  }, []);
  
  // Notification actions
  const updateNotifications = useCallback(async (updates: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      setError(null);
      setNotifications(prev => ({ 
        ...prev, 
        ...updates,
        email: { ...prev.email, ...updates.email },
        inApp: { ...prev.inApp, ...updates.inApp },
        push: { ...prev.push, ...updates.push },
        quietHours: { ...prev.quietHours, ...updates.quietHours }
      }));
      scheduleAutoSave();
      return true;
    } catch (error) {
      setError('Failed to update notifications');
      return false;
    }
  }, [scheduleAutoSave]);
  
  const testNotification = useCallback(async (type: keyof NotificationPreferences['email']): Promise<boolean> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      setError('Failed to send test notification');
      return false;
    }
  }, []);
  
  // API key actions
  const createApiKey = useCallback(async (request: ApiKeyCreateRequest): Promise<APIKey> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newKey: APIKey = {
        id: `key_${Date.now()}`,
        name: request.name,
        key: `mk_live_${Math.random().toString(36).substr(2, 32)}`,
        keyPreview: 'mk_live_xx...xxxx',
        permissions: request.permissions,
        usageStats: {
          totalRequests: 0,
          requestsThisMonth: 0,
          lastUsed: null,
          averageRequestsPerDay: 0
        },
        rateLimit: {
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          currentHourlyUsage: 0,
          currentDailyUsage: 0
        },
        createdAt: new Date().toISOString(),
        expiresAt: request.expiresAt || null,
        status: 'active',
        ipRestrictions: request.ipRestrictions,
        scopes: request.permissions.map(p => p.split(':')[1]).filter(Boolean)
      };
      
      setApiKeys(prev => [newKey, ...prev]);
      return newKey;
    } catch (error) {
      setError('Failed to create API key');
      throw error;
    }
  }, []);
  
  const revokeApiKey = useCallback(async (keyId: string): Promise<boolean> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' as const } : key
      ));
      
      return true;
    } catch (error) {
      setError('Failed to revoke API key');
      return false;
    }
  }, []);
  
  const regenerateApiKey = useCallback(async (keyId: string): Promise<APIKey> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newKey = `mk_live_${Math.random().toString(36).substr(2, 32)}`;
      const updatedKey = apiKeys.find(key => key.id === keyId);
      
      if (!updatedKey) {
        throw new Error('API key not found');
      }
      
      const regenerated = {
        ...updatedKey,
        key: newKey,
        keyPreview: `${newKey.substr(0, 10)}...${newKey.substr(-4)}`
      };
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? regenerated : key
      ));
      
      return regenerated;
    } catch (error) {
      setError('Failed to regenerate API key');
      throw error;
    }
  }, [apiKeys]);
  
  const updateApiKeyPermissions = useCallback(async (keyId: string, permissions: string[]): Promise<boolean> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, permissions } : key
      ));
      
      return true;
    } catch (error) {
      setError('Failed to update API key permissions');
      return false;
    }
  }, []);
  
  // Data export actions
  const requestDataExport = useCallback(async (options: {
    format: 'json' | 'csv' | 'xml';
    includeDocuments: boolean;
    includeAnalytics: boolean;
    includeActivityLogs: boolean;
  }): Promise<UserDataExport> => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exportRequest: UserDataExport = {
        requestedAt: new Date().toISOString(),
        status: 'processing',
        format: options.format,
        includeDocuments: options.includeDocuments,
        includeAnalytics: options.includeAnalytics,
        includeActivityLogs: options.includeActivityLogs,
        fileSizeEstimate: '1.2 MB'
      };
      
      setDataExports(prev => [exportRequest, ...prev]);
      
      // Simulate processing completion
      setTimeout(() => {
        setDataExports(prev => prev.map(exp => 
          exp.requestedAt === exportRequest.requestedAt 
            ? { 
                ...exp, 
                status: 'ready',
                downloadUrl: `/api/exports/user-data-${Date.now()}.${options.format}`,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            : exp
        ));
      }, 3000);
      
      return exportRequest;
    } catch (error) {
      setError('Failed to request data export');
      throw error;
    }
  }, []);
  
  // Utility functions
  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Simulate some emails being unavailable
    const unavailableEmails = ['admin@company.com', 'test@company.com', 'user@company.com'];
    return !unavailableEmails.includes(email);
  }, []);
  
  const deleteAccount = useCallback(async (confirmationText: string): Promise<boolean> => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return false;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real implementation, this would delete the account and log out
      setIsLoading(false);
      return true;
    } catch (error) {
      setError('Failed to delete account');
      setIsLoading(false);
      return false;
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Data
    profile,
    security,
    notifications,
    apiKeys,
    dataExports,
    
    // States
    isLoading,
    isSaving,
    lastSaved,
    error,
    
    // Profile actions
    updateProfile,
    uploadAvatar,
    
    // Security actions
    changePassword,
    enable2FA,
    disable2FA,
    generateBackupCodes,
    revokeSession,
    
    // Notification actions
    updateNotifications,
    testNotification,
    
    // API key actions
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    updateApiKeyPermissions,
    
    // Data export actions
    requestDataExport,
    
    // Utility functions
    validatePassword,
    checkEmailAvailability,
    deleteAccount,
    clearError
  };
}