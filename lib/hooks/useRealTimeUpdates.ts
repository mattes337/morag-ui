/**
 * Real-time Updates Hook
 * Provides real-time updates for job status changes and document processing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockWebSocket } from '../websocket/mockWebSocket';
import { EventType, WebSocketEvent, JobStatusEvent, DocumentEvent, ConnectionState } from '../websocket/eventTypes';

export interface JobUpdate {
  jobId: string;
  status: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  error?: string;
  duration?: number;
  remainingTime?: number;
  documentId?: string;
  stage?: string;
  timestamp: number;
}

export interface DocumentUpdate {
  documentId: string;
  action: 'uploaded' | 'processed' | 'deleted' | 'updated';
  title: string;
  type: string;
  size?: number;
  chunksCount?: number;
  factsCount?: number;
  timestamp: number;
}

export interface UseRealTimeUpdatesOptions {
  realmId?: string;
  jobIds?: string[];
  documentIds?: string[];
  autoConnect?: boolean;
  onJobUpdate?: (update: JobUpdate) => void;
  onDocumentUpdate?: (update: DocumentUpdate) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export interface UseRealTimeUpdatesReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;

  // Recent updates
  jobUpdates: JobUpdate[];
  documentUpdates: DocumentUpdate[];

  // Actions
  connect: () => void;
  disconnect: () => void;
  clearUpdates: () => void;
  retryConnection: () => void;

  // Subscription management
  subscribeToJobs: (jobIds: string[]) => void;
  subscribeToDocuments: (documentIds: string[]) => void;
  unsubscribeFromJobs: () => void;
  unsubscribeFromDocuments: () => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}): UseRealTimeUpdatesReturn => {
  const {
    realmId,
    jobIds = [],
    documentIds = [],
    autoConnect = true,
    onJobUpdate,
    onDocumentUpdate,
    onConnectionStateChange
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    connecting: false,
    reconnecting: false,
    connectionQuality: 'excellent',
    latency: 0,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });

  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([]);
  const [documentUpdates, setDocumentUpdates] = useState<DocumentUpdate[]>([]);

  // Refs for subscriptions
  const jobSubscriptionRef = useRef<string | null>(null);
  const documentSubscriptionRef = useRef<string | null>(null);
  const connectionSubscriptionRef = useRef<string | null>(null);

  // WebSocket instance
  const ws = mockWebSocket();

  // Handle job status events
  const handleJobEvent = useCallback((event: WebSocketEvent) => {
    if (!event.type.startsWith('job:')) return;

    const jobEvent = event as JobStatusEvent;
    const update: JobUpdate = {
      jobId: jobEvent.data.jobId,
      status: event.type.replace('job:', '') as JobUpdate['status'],
      progress: jobEvent.data.progress,
      message: jobEvent.data.message,
      error: jobEvent.data.error,
      duration: jobEvent.data.duration,
      remainingTime: jobEvent.data.remainingTime,
      documentId: jobEvent.data.documentId,
      stage: jobEvent.data.stage,
      timestamp: event.timestamp
    };

    // Filter by jobIds if specified
    if (jobIds.length > 0 && !jobIds.includes(update.jobId)) {
      return;
    }

    setJobUpdates(prev => {
      // Keep only last 50 updates
      const newUpdates = [update, ...prev].slice(0, 50);
      return newUpdates;
    });

    // Call callback if provided
    onJobUpdate?.(update);
  }, [jobIds, onJobUpdate]);

  // Handle document events
  const handleDocumentEvent = useCallback((event: WebSocketEvent) => {
    if (!event.type.startsWith('document:')) return;

    const docEvent = event as DocumentEvent;
    const update: DocumentUpdate = {
      documentId: docEvent.data.documentId,
      action: event.type.replace('document:', '') as DocumentUpdate['action'],
      title: docEvent.data.documentTitle,
      type: docEvent.data.documentType,
      size: docEvent.data.size,
      chunksCount: docEvent.data.chunksCount,
      factsCount: docEvent.data.factsCount,
      timestamp: event.timestamp
    };

    // Filter by documentIds if specified
    if (documentIds.length > 0 && !documentIds.includes(update.documentId)) {
      return;
    }

    setDocumentUpdates(prev => {
      // Keep only last 30 updates
      const newUpdates = [update, ...prev].slice(0, 30);
      return newUpdates;
    });

    // Call callback if provided
    onDocumentUpdate?.(update);
  }, [documentIds, onDocumentUpdate]);

  // Handle connection events
  const handleConnectionEvent = useCallback((event: WebSocketEvent) => {
    const newState = ws.getConnectionState();
    setConnectionState(newState);
    onConnectionStateChange?.(newState);
  }, [ws, onConnectionStateChange]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    ws.connect();
  }, [ws]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Unsubscribe from all events
    if (jobSubscriptionRef.current) {
      ws.unsubscribe(jobSubscriptionRef.current);
      jobSubscriptionRef.current = null;
    }
    if (documentSubscriptionRef.current) {
      ws.unsubscribe(documentSubscriptionRef.current);
      documentSubscriptionRef.current = null;
    }
    if (connectionSubscriptionRef.current) {
      ws.unsubscribe(connectionSubscriptionRef.current);
      connectionSubscriptionRef.current = null;
    }

    ws.disconnect();
  }, [ws]);

  // Clear all updates
  const clearUpdates = useCallback(() => {
    setJobUpdates([]);
    setDocumentUpdates([]);
  }, []);

  // Retry connection
  const retryConnection = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [connect, disconnect]);

  // Subscribe to job events
  const subscribeToJobs = useCallback((newJobIds: string[]) => {
    if (jobSubscriptionRef.current) {
      ws.unsubscribe(jobSubscriptionRef.current);
    }

    jobSubscriptionRef.current = ws.subscribe(
      [
        EventType.JOB_STARTED,
        EventType.JOB_PROGRESS,
        EventType.JOB_COMPLETED,
        EventType.JOB_FAILED,
        EventType.JOB_CANCELLED
      ],
      handleJobEvent,
      realmId
    );
  }, [ws, handleJobEvent, realmId]);

  // Subscribe to document events
  const subscribeToDocuments = useCallback((newDocumentIds: string[]) => {
    if (documentSubscriptionRef.current) {
      ws.unsubscribe(documentSubscriptionRef.current);
    }

    documentSubscriptionRef.current = ws.subscribe(
      [
        EventType.DOCUMENT_UPLOADED,
        EventType.DOCUMENT_PROCESSED,
        EventType.DOCUMENT_DELETED,
        EventType.DOCUMENT_UPDATED
      ],
      handleDocumentEvent,
      realmId
    );
  }, [ws, handleDocumentEvent, realmId]);

  // Unsubscribe from job events
  const unsubscribeFromJobs = useCallback(() => {
    if (jobSubscriptionRef.current) {
      ws.unsubscribe(jobSubscriptionRef.current);
      jobSubscriptionRef.current = null;
    }
  }, [ws]);

  // Unsubscribe from document events
  const unsubscribeFromDocuments = useCallback(() => {
    if (documentSubscriptionRef.current) {
      ws.unsubscribe(documentSubscriptionRef.current);
      documentSubscriptionRef.current = null;
    }
  }, [ws]);

  // Setup connection monitoring
  useEffect(() => {
    const monitorConnection = () => {
      const newState = ws.getConnectionState();
      setConnectionState(newState);
    };

    // Monitor connection state every second
    const interval = setInterval(monitorConnection, 1000);

    // Subscribe to connection events
    connectionSubscriptionRef.current = ws.subscribe(
      [
        EventType.CONNECTION_ESTABLISHED,
        EventType.CONNECTION_LOST,
        EventType.CONNECTION_RESTORED,
        EventType.HEARTBEAT
      ],
      handleConnectionEvent,
      realmId
    );

    return () => {
      clearInterval(interval);
      if (connectionSubscriptionRef.current) {
        ws.unsubscribe(connectionSubscriptionRef.current);
      }
    };
  }, [ws, handleConnectionEvent, realmId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (!autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Subscribe to initial job and document IDs
  useEffect(() => {
    if (jobIds.length > 0) {
      subscribeToJobs(jobIds);
    }
  }, [jobIds, subscribeToJobs]);

  useEffect(() => {
    if (documentIds.length > 0) {
      subscribeToDocuments(documentIds);
    }
  }, [documentIds, subscribeToDocuments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromJobs();
      unsubscribeFromDocuments();
    };
  }, [unsubscribeFromJobs, unsubscribeFromDocuments]);

  return {
    // Connection state
    connectionState,
    isConnected: connectionState.connected,
    isConnecting: connectionState.connecting,
    isReconnecting: connectionState.reconnecting,

    // Recent updates
    jobUpdates,
    documentUpdates,

    // Actions
    connect,
    disconnect,
    clearUpdates,
    retryConnection,

    // Subscription management
    subscribeToJobs,
    subscribeToDocuments,
    unsubscribeFromJobs,
    unsubscribeFromDocuments
  };
};

// Helper hook for specific job monitoring
export const useJobMonitoring = (jobIds: string[], realmId?: string) => {
  return useRealTimeUpdates({
    jobIds,
    realmId,
    autoConnect: true
  });
};

// Helper hook for document monitoring
export const useDocumentMonitoring = (documentIds: string[], realmId?: string) => {
  return useRealTimeUpdates({
    documentIds,
    realmId,
    autoConnect: true
  });
};

export default useRealTimeUpdates;