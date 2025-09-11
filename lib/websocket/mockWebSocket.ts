/**
 * Mock WebSocket Implementation for Real-time Updates
 * Simulates WebSocket connection with event generation and cross-tab sync
 */

import { 
  EventType, 
  WebSocketEvent, 
  EventSubscription, 
  ConnectionState, 
  WebSocketConfig,
  EventProbabilityConfig,
  JobStatusEvent,
  DocumentEvent,
  UserCollaborationEvent,
  ErrorWarningEvent,
  ConnectionEvent
} from './eventTypes';

// Default configuration
const DEFAULT_CONFIG: WebSocketConfig = {
  url: 'ws://localhost:3001/ws',
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  messageQueueSize: 100,
  enableCrossTabs: true,
  debug: false
};

// Event probability configuration (per minute)
const EVENT_PROBABILITIES: EventProbabilityConfig = {
  [EventType.JOB_STARTED]: 0.3,
  [EventType.JOB_PROGRESS]: 2.0,
  [EventType.JOB_COMPLETED]: 0.2,
  [EventType.JOB_FAILED]: 0.05,
  [EventType.DOCUMENT_UPLOADED]: 0.1,
  [EventType.DOCUMENT_PROCESSED]: 0.1,
  [EventType.USER_JOINED_REALM]: 0.02,
  [EventType.SYSTEM_MAINTENANCE]: 0.001,
  [EventType.PROCESSING_ERROR]: 0.03,
  [EventType.CONNECTION_LOST]: 0.01
};

class MockWebSocket {
  private static instance: MockWebSocket | null = null;
  
  private config: WebSocketConfig;
  private connectionState: ConnectionState;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventQueue: WebSocketEvent[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventGenerationInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  
  // Active job tracking for realistic progress events
  private activeJobs: Map<string, { documentId: string; stage: string; progress: number }> = new Map();
  
  // Event listeners
  private eventListeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map();

  private constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.connectionState = {
      connected: false,
      connecting: false,
      reconnecting: false,
      connectionQuality: 'excellent',
      latency: 50,
      reconnectAttempts: 0,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };

    this.initializeBroadcastChannel();
  }

  static getInstance(config?: Partial<WebSocketConfig>): MockWebSocket {
    if (!MockWebSocket.instance) {
      MockWebSocket.instance = new MockWebSocket(config);
    }
    return MockWebSocket.instance;
  }

  private initializeBroadcastChannel(): void {
    if (this.config.enableCrossTabs && typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('morag-websocket-sync');
      this.broadcastChannel.addEventListener('message', (event) => {
        const wsEvent = event.data as WebSocketEvent;
        this.handleIncomingEvent(wsEvent, false); // Don't broadcast back
      });
    }
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[MockWebSocket] ${message}`, ...args);
    }
  }

  async connect(): Promise<void> {
    if (this.connectionState.connected || this.connectionState.connecting) {
      return;
    }

    this.connectionState.connecting = true;
    this.log('Connecting to WebSocket...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate connection success/failure (95% success rate)
    const connectionSuccess = Math.random() > 0.05;

    if (connectionSuccess) {
      this.connectionState.connected = true;
      this.connectionState.connecting = false;
      this.connectionState.reconnecting = false;
      this.connectionState.reconnectAttempts = 0;
      this.connectionState.lastConnected = Date.now();

      this.startHeartbeat();
      this.startEventGeneration();

      const connectionEvent: ConnectionEvent = {
        id: this.generateEventId(),
        type: EventType.CONNECTION_ESTABLISHED,
        timestamp: Date.now(),
        data: {
          connectionId: this.generateConnectionId(),
          latency: this.connectionState.latency,
          quality: this.connectionState.connectionQuality
        }
      };

      this.handleIncomingEvent(connectionEvent);
      this.log('Connected successfully');
    } else {
      this.handleConnectionFailure();
    }
  }

  disconnect(): void {
    this.log('Disconnecting...');
    
    this.connectionState.connected = false;
    this.connectionState.connecting = false;
    this.stopHeartbeat();
    this.stopEventGeneration();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const disconnectionEvent: ConnectionEvent = {
      id: this.generateEventId(),
      type: EventType.CONNECTION_LOST,
      timestamp: Date.now(),
      data: {
        connectionId: this.generateConnectionId(),
        reconnectAttempts: this.connectionState.reconnectAttempts
      }
    };

    this.handleIncomingEvent(disconnectionEvent);
  }

  private handleConnectionFailure(): void {
    this.connectionState.connecting = false;
    this.connectionState.connected = false;
    this.connectionState.reconnectAttempts++;

    if (this.connectionState.reconnectAttempts < this.connectionState.maxReconnectAttempts) {
      this.connectionState.reconnecting = true;
      const delay = Math.min(
        this.config.reconnectInterval * Math.pow(2, this.connectionState.reconnectAttempts - 1),
        30000
      );

      this.log(`Reconnection attempt ${this.connectionState.reconnectAttempts} in ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      this.log('Max reconnection attempts reached');
    }
  }

  subscribe(eventTypes: EventType[], callback: (event: WebSocketEvent) => void, realmId?: string): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventTypes,
      callback,
      ...(realmId && { realmId })
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.log(`Subscribed to events: ${eventTypes.join(', ')}`);

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId);
    if (removed) {
      this.log(`Unsubscribed: ${subscriptionId}`);
    }
    return removed;
  }

  addEventListener(eventType: EventType, callback: (event: WebSocketEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  removeEventListener(eventType: EventType, callback: (event: WebSocketEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Simulate sending a message (for testing)
  simulateEvent(event: WebSocketEvent): void {
    this.handleIncomingEvent(event);
  }

  private handleIncomingEvent(event: WebSocketEvent, broadcast: boolean = true): void {
    // Add to event queue
    this.eventQueue.push(event);
    if (this.eventQueue.length > this.config.messageQueueSize) {
      this.eventQueue.shift();
    }

    // Broadcast to other tabs
    if (broadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    // Track job progress for realistic simulation
    if (event.type === EventType.JOB_STARTED) {
      const jobEvent = event as JobStatusEvent;
      this.activeJobs.set(jobEvent.data.jobId, {
        documentId: jobEvent.data.documentId || '',
        stage: jobEvent.data.stage || 'processing',
        progress: 0
      });
    } else if (event.type === EventType.JOB_COMPLETED || event.type === EventType.JOB_FAILED) {
      const jobEvent = event as JobStatusEvent;
      this.activeJobs.delete(jobEvent.data.jobId);
    }

    // Notify subscribers
    for (const subscription of this.subscriptions.values()) {
      if (this.shouldNotifySubscription(subscription, event)) {
        try {
          subscription.callback(event);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      }
    }

    // Notify event listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }

  private shouldNotifySubscription(subscription: EventSubscription, event: WebSocketEvent): boolean {
    // Check event type
    if (!subscription.eventTypes.includes(event.type)) {
      return false;
    }

    // Check realm filtering
    if (subscription.realmId && event.realmId && subscription.realmId !== event.realmId) {
      return false;
    }

    return true;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState.connected) {
        // Simulate latency variation
        this.connectionState.latency = 30 + Math.random() * 40;
        
        // Simulate connection quality
        if (this.connectionState.latency < 50) {
          this.connectionState.connectionQuality = 'excellent';
        } else if (this.connectionState.latency < 100) {
          this.connectionState.connectionQuality = 'good';
        } else if (this.connectionState.latency < 200) {
          this.connectionState.connectionQuality = 'fair';
        } else {
          this.connectionState.connectionQuality = 'poor';
        }

        const heartbeatEvent: ConnectionEvent = {
          id: this.generateEventId(),
          type: EventType.HEARTBEAT,
          timestamp: Date.now(),
          data: {
            connectionId: this.generateConnectionId(),
            latency: this.connectionState.latency,
            quality: this.connectionState.connectionQuality
          }
        };

        this.handleIncomingEvent(heartbeatEvent);
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private startEventGeneration(): void {
    // Generate events every 5 seconds
    this.eventGenerationInterval = setInterval(() => {
      if (this.connectionState.connected) {
        this.generateRandomEvents();
        this.generateJobProgressEvents();
      }
    }, 5000);
  }

  private stopEventGeneration(): void {
    if (this.eventGenerationInterval) {
      clearInterval(this.eventGenerationInterval);
      this.eventGenerationInterval = null;
    }
  }

  private generateRandomEvents(): void {
    for (const [eventType, probability] of Object.entries(EVENT_PROBABILITIES)) {
      // Convert per-minute probability to per-5-second probability
      const adjustedProbability = (probability / 12) / 100;
      
      if (Math.random() < adjustedProbability) {
        const event = this.generateMockEvent(eventType as EventType);
        if (event) {
          this.handleIncomingEvent(event);
        }
      }
    }
  }

  private generateJobProgressEvents(): void {
    for (const [jobId, job] of this.activeJobs) {
      if (Math.random() < 0.7) { // 70% chance of progress update
        job.progress = Math.min(job.progress + Math.random() * 20, 100);
        
        const progressEvent: JobStatusEvent = {
          id: this.generateEventId(),
          type: EventType.JOB_PROGRESS,
          timestamp: Date.now(),
          realmId: this.generateRealmId(),
          data: {
            jobId,
            documentId: job.documentId,
            stage: job.stage,
            progress: Math.round(job.progress),
            remainingTime: Math.round((100 - job.progress) * 2000) // 2 seconds per percent
          }
        };

        this.handleIncomingEvent(progressEvent);

        // Complete job if progress reaches 100%
        if (job.progress >= 100) {
          setTimeout(() => {
            const completionEvent: JobStatusEvent = {
              id: this.generateEventId(),
              type: EventType.JOB_COMPLETED,
              timestamp: Date.now(),
              realmId: this.generateRealmId(),
              data: {
                jobId,
                documentId: job.documentId,
                stage: 'completed',
                progress: 100,
                duration: Math.round(Math.random() * 30000 + 10000) // 10-40 seconds
              }
            };
            this.handleIncomingEvent(completionEvent);
          }, 1000);
        }
      }
    }
  }

  private generateMockEvent(eventType: EventType): WebSocketEvent | null {
    const baseEvent = {
      id: this.generateEventId(),
      type: eventType,
      timestamp: Date.now(),
      realmId: this.generateRealmId(),
      userId: this.generateUserId()
    };

    switch (eventType) {
      case EventType.JOB_STARTED:
        const jobId = this.generateJobId();
        return {
          ...baseEvent,
          data: {
            jobId,
            documentId: this.generateDocumentId(),
            stage: this.getRandomStage(),
            progress: 0,
            message: 'Processing started'
          }
        } as JobStatusEvent;

      case EventType.DOCUMENT_UPLOADED:
        return {
          ...baseEvent,
          data: {
            documentId: this.generateDocumentId(),
            documentTitle: this.getRandomDocumentTitle(),
            documentType: this.getRandomDocumentType(),
            size: Math.round(Math.random() * 10000000 + 100000)
          }
        } as DocumentEvent;

      case EventType.USER_JOINED_REALM:
        return {
          ...baseEvent,
          data: {
            userId: this.generateUserId(),
            userName: this.getRandomUserName(),
            userAvatar: this.getRandomAvatar(),
            role: this.getRandomRole()
          }
        } as UserCollaborationEvent;

      case EventType.PROCESSING_ERROR:
        return {
          ...baseEvent,
          data: {
            message: 'Processing failed',
            error: this.getRandomError(),
            code: 'PROC_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            recoverable: Math.random() > 0.3,
            jobId: this.generateJobId()
          }
        } as ErrorWarningEvent;

      default:
        return null;
    }
  }

  private generateEventId(): string {
    return 'evt_' + Math.random().toString(36).substr(2, 12);
  }

  private generateSubscriptionId(): string {
    return 'sub_' + Math.random().toString(36).substr(2, 12);
  }

  private generateConnectionId(): string {
    return 'conn_' + Math.random().toString(36).substr(2, 8);
  }

  private generateJobId(): string {
    return 'job_' + Math.random().toString(36).substr(2, 10);
  }

  private generateDocumentId(): string {
    return 'doc_' + Math.random().toString(36).substr(2, 10);
  }

  private generateRealmId(): string {
    const realms = ['realm_marketing', 'realm_engineering', 'realm_research', 'realm_support'];
    return realms[Math.floor(Math.random() * realms.length)]!;
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 8);
  }

  private getRandomStage(): string {
    const stages = ['markdown-conversion', 'chunker', 'fact-generator', 'ingestor'];
    return stages[Math.floor(Math.random() * stages.length)]!;
  }

  private getRandomDocumentTitle(): string {
    const titles = [
      'Project Requirements Document',
      'Technical Specification',
      'User Manual',
      'Marketing Analysis',
      'Financial Report',
      'Meeting Minutes',
      'Design Mockups',
      'Research Paper'
    ];
    return titles[Math.floor(Math.random() * titles.length)]!;
  }

  private getRandomDocumentType(): string {
    const types = ['PDF', 'DOCX', 'TXT', 'PPTX', 'XLSX', 'MP4', 'MP3'];
    return types[Math.floor(Math.random() * types.length)]!;
  }

  private getRandomUserName(): string {
    const names = [
      'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown',
      'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Taylor'
    ];
    return names[Math.floor(Math.random() * names.length)]!;
  }

  private getRandomAvatar(): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36)}`;
  }

  private getRandomRole(): string {
    const roles = ['admin', 'editor', 'viewer', 'contributor'];
    return roles[Math.floor(Math.random() * roles.length)]!;
  }

  private getRandomError(): string {
    const errors = [
      'Document format not supported',
      'Processing timeout exceeded',
      'Insufficient storage space',
      'Network connection failed',
      'Authentication expired',
      'Rate limit exceeded'
    ];
    return errors[Math.floor(Math.random() * errors.length)]!;
  }

  // Cleanup method
  destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.eventListeners.clear();
    this.activeJobs.clear();
    
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    MockWebSocket.instance = null;
  }
}

// Export singleton instance getter
export const mockWebSocket = () => MockWebSocket.getInstance();

export default MockWebSocket;