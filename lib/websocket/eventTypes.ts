/**
 * WebSocket Event Types for Real-time Updates
 * Defines all event types and their payloads for the mock WebSocket system
 */

export enum EventType {
  // Job status events
  JOB_STARTED = 'job:started',
  JOB_PROGRESS = 'job:progress',
  JOB_COMPLETED = 'job:completed',
  JOB_FAILED = 'job:failed',
  JOB_CANCELLED = 'job:cancelled',

  // Document processing events
  DOCUMENT_UPLOADED = 'document:uploaded',
  DOCUMENT_PROCESSED = 'document:processed',
  DOCUMENT_DELETED = 'document:deleted',
  DOCUMENT_UPDATED = 'document:updated',

  // Team collaboration events
  USER_JOINED_REALM = 'user:joined_realm',
  USER_LEFT_REALM = 'user:left_realm',
  DOCUMENT_SHARED = 'document:shared',
  COMMENT_ADDED = 'comment:added',

  // System notifications
  SYSTEM_MAINTENANCE = 'system:maintenance',
  QUOTA_WARNING = 'system:quota_warning',
  QUOTA_EXCEEDED = 'system:quota_exceeded',
  API_RATE_LIMIT = 'system:rate_limit',

  // Error and warning events
  PROCESSING_ERROR = 'error:processing',
  STORAGE_ERROR = 'error:storage',
  NETWORK_ERROR = 'error:network',
  AUTH_WARNING = 'warning:auth',

  // Connection events
  CONNECTION_ESTABLISHED = 'connection:established',
  CONNECTION_LOST = 'connection:lost',
  CONNECTION_RESTORED = 'connection:restored',
  HEARTBEAT = 'connection:heartbeat'
}

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Base event interface
export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: number;
  realmId?: string;
  userId?: string;
  data: Record<string, any>;
}

// Job event payloads
export interface JobStatusEvent extends BaseEvent {
  type: EventType.JOB_STARTED | EventType.JOB_PROGRESS | EventType.JOB_COMPLETED | EventType.JOB_FAILED | EventType.JOB_CANCELLED;
  data: {
    jobId: string;
    documentId?: string;
    stage?: string;
    progress?: number;
    message?: string;
    error?: string;
    duration?: number;
    remainingTime?: number;
  };
}

// Document event payloads
export interface DocumentEvent extends BaseEvent {
  type: EventType.DOCUMENT_UPLOADED | EventType.DOCUMENT_PROCESSED | EventType.DOCUMENT_DELETED | EventType.DOCUMENT_UPDATED;
  data: {
    documentId: string;
    documentTitle: string;
    documentType: string;
    size?: number;
    chunksCount?: number;
    factsCount?: number;
  };
}

// User collaboration event payloads
export interface UserCollaborationEvent extends BaseEvent {
  type: EventType.USER_JOINED_REALM | EventType.USER_LEFT_REALM | EventType.DOCUMENT_SHARED | EventType.COMMENT_ADDED;
  data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    documentId?: string;
    message?: string;
    role?: string;
  };
}

// System notification event payloads
export interface SystemNotificationEvent extends BaseEvent {
  type: EventType.SYSTEM_MAINTENANCE | EventType.QUOTA_WARNING | EventType.QUOTA_EXCEEDED | EventType.API_RATE_LIMIT;
  data: {
    message: string;
    severity: 'info' | 'warning' | 'critical';
    scheduledTime?: number;
    maintenanceDuration?: number;
    quotaUsage?: number;
    quotaLimit?: number;
    rateLimitReset?: number;
  };
}

// Error and warning event payloads
export interface ErrorWarningEvent extends BaseEvent {
  type: EventType.PROCESSING_ERROR | EventType.STORAGE_ERROR | EventType.NETWORK_ERROR | EventType.AUTH_WARNING;
  data: {
    message: string;
    error: string;
    code?: string;
    recoverable: boolean;
    retryAfter?: number;
    documentId?: string;
    jobId?: string;
  };
}

// Connection event payloads
export interface ConnectionEvent extends BaseEvent {
  type: EventType.CONNECTION_ESTABLISHED | EventType.CONNECTION_LOST | EventType.CONNECTION_RESTORED | EventType.HEARTBEAT;
  data: {
    connectionId: string;
    latency?: number;
    reconnectAttempts?: number;
    quality?: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

// Union type for all possible events
export type WebSocketEvent = 
  | JobStatusEvent 
  | DocumentEvent 
  | UserCollaborationEvent 
  | SystemNotificationEvent 
  | ErrorWarningEvent 
  | ConnectionEvent;

// Notification interface for UI display
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'destructive';
  onClick: () => void;
}

// Event subscription interface
export interface EventSubscription {
  eventTypes: EventType[];
  realmId?: string;
  callback: (event: WebSocketEvent) => void;
  id: string;
}

// Connection state interface
export interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  lastConnected?: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueSize: number;
  enableCrossTabs: boolean;
  debug: boolean;
}

// Event probability configuration for simulation
export interface EventProbabilityConfig {
  [EventType.JOB_STARTED]: number;
  [EventType.JOB_PROGRESS]: number;
  [EventType.JOB_COMPLETED]: number;
  [EventType.JOB_FAILED]: number;
  [EventType.DOCUMENT_UPLOADED]: number;
  [EventType.DOCUMENT_PROCESSED]: number;
  [EventType.USER_JOINED_REALM]: number;
  [EventType.SYSTEM_MAINTENANCE]: number;
  [EventType.PROCESSING_ERROR]: number;
  [EventType.CONNECTION_LOST]: number;
}