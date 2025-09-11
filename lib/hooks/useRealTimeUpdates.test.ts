/**
 * useRealTimeUpdates Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useRealTimeUpdates, useJobMonitoring, useDocumentMonitoring } from './useRealTimeUpdates';
import { mockWebSocket } from '../websocket/mockWebSocket';
import { EventType, JobStatusEvent, DocumentEvent } from '../websocket/eventTypes';

// Mock the WebSocket
jest.mock('../websocket/mockWebSocket', () => ({
  mockWebSocket: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(() => 'mock-subscription-id'),
    unsubscribe: jest.fn(),
    getConnectionState: jest.fn(() => ({
      connected: false,
      connecting: false,
      reconnecting: false,
      connectionQuality: 'excellent' as const,
      latency: 50,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
    }))
  }))
}));

const mockWs = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  subscribe: jest.fn(() => 'mock-subscription-id'),
  unsubscribe: jest.fn(),
  getConnectionState: jest.fn(() => ({
    connected: false,
    connecting: false,
    reconnecting: false,
    connectionQuality: 'excellent' as const,
    latency: 50,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  }))
};

(mockWebSocket as jest.Mock).mockReturnValue(mockWs);

describe('useRealTimeUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should auto-connect by default', () => {
      renderHook(() => useRealTimeUpdates());
      
      expect(mockWs.connect).toHaveBeenCalled();
    });

    it('should not auto-connect when disabled', () => {
      renderHook(() => useRealTimeUpdates({ autoConnect: false }));
      
      expect(mockWs.connect).not.toHaveBeenCalled();
    });

    it('should provide connection state', () => {
      mockWs.getConnectionState.mockReturnValue({
        connected: true,
        connecting: false,
        reconnecting: false,
        connectionQuality: 'good' as const,
        latency: 75,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5
      });

      const { result } = renderHook(() => useRealTimeUpdates());

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.isReconnecting).toBe(false);
    });

    it('should allow manual connect/disconnect', () => {
      const { result } = renderHook(() => useRealTimeUpdates({ autoConnect: false }));

      act(() => {
        result.current.connect();
      });
      expect(mockWs.connect).toHaveBeenCalled();

      act(() => {
        result.current.disconnect();
      });
      expect(mockWs.unsubscribe).toHaveBeenCalled();
      expect(mockWs.disconnect).toHaveBeenCalled();
    });

    it('should retry connection', async () => {
      const { result } = renderHook(() => useRealTimeUpdates());

      act(() => {
        result.current.retryConnection();
      });

      expect(mockWs.unsubscribe).toHaveBeenCalled();
      expect(mockWs.disconnect).toHaveBeenCalled();

      // Fast-forward timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockWs.connect).toHaveBeenCalledTimes(2); // Initial + retry
    });
  });

  describe('Job Monitoring', () => {
    it('should subscribe to job events', () => {
      renderHook(() => useRealTimeUpdates({ jobIds: ['job1', 'job2'] }));

      expect(mockWs.subscribe).toHaveBeenCalledWith(
        [
          EventType.JOB_STARTED,
          EventType.JOB_PROGRESS,
          EventType.JOB_COMPLETED,
          EventType.JOB_FAILED,
          EventType.JOB_CANCELLED
        ],
        expect.any(Function),
        undefined
      );
    });

    it('should handle job status events', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.JOB_STARTED)) {
          eventHandler = handler;
        }
        return 'mock-sub-id';
      });

      const mockOnJobUpdate = jest.fn();
      const { result } = renderHook(() => 
        useRealTimeUpdates({ 
          jobIds: ['job1'], 
          onJobUpdate: mockOnJobUpdate 
        })
      );

      const jobEvent: JobStatusEvent = {
        id: 'event1',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {
          jobId: 'job1',
          progress: 0,
          message: 'Job started'
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(result.current.jobUpdates).toHaveLength(1);
      expect(result.current.jobUpdates[0]).toMatchObject({
        jobId: 'job1',
        status: 'started',
        progress: 0,
        message: 'Job started'
      });
      expect(mockOnJobUpdate).toHaveBeenCalledWith(expect.objectContaining({
        jobId: 'job1',
        status: 'started'
      }));
    });

    it('should filter job updates by jobIds', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.JOB_STARTED)) {
          eventHandler = handler;
        }
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => 
        useRealTimeUpdates({ jobIds: ['job1'] })
      );

      const jobEvent: JobStatusEvent = {
        id: 'event1',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {
          jobId: 'job2', // Different job ID
          progress: 0
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(result.current.jobUpdates).toHaveLength(0);
    });

    it('should limit job updates to 50', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.JOB_STARTED)) {
          eventHandler = handler;
        }
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useRealTimeUpdates());

      // Add 55 job updates
      act(() => {
        for (let i = 0; i < 55; i++) {
          const jobEvent: JobStatusEvent = {
            id: `event${i}`,
            type: EventType.JOB_STARTED,
            timestamp: Date.now() + i,
            data: {
              jobId: `job${i}`,
              progress: 0
            }
          };
          eventHandler(jobEvent);
        }
      });

      expect(result.current.jobUpdates).toHaveLength(50);
      expect(result.current.jobUpdates[0].jobId).toBe('job54'); // Most recent
    });
  });

  describe('Document Monitoring', () => {
    it('should subscribe to document events', () => {
      renderHook(() => useRealTimeUpdates({ documentIds: ['doc1', 'doc2'] }));

      expect(mockWs.subscribe).toHaveBeenCalledWith(
        [
          EventType.DOCUMENT_UPLOADED,
          EventType.DOCUMENT_PROCESSED,
          EventType.DOCUMENT_DELETED,
          EventType.DOCUMENT_UPDATED
        ],
        expect.any(Function),
        undefined
      );
    });

    it('should handle document events', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.DOCUMENT_UPLOADED)) {
          eventHandler = handler;
        }
        return 'mock-sub-id';
      });

      const mockOnDocumentUpdate = jest.fn();
      const { result } = renderHook(() => 
        useRealTimeUpdates({ 
          documentIds: ['doc1'], 
          onDocumentUpdate: mockOnDocumentUpdate 
        })
      );

      const docEvent: DocumentEvent = {
        id: 'event1',
        type: EventType.DOCUMENT_UPLOADED,
        timestamp: Date.now(),
        data: {
          documentId: 'doc1',
          documentTitle: 'Test Document',
          documentType: 'PDF',
          size: 1024
        }
      };

      act(() => {
        eventHandler(docEvent);
      });

      expect(result.current.documentUpdates).toHaveLength(1);
      expect(result.current.documentUpdates[0]).toMatchObject({
        documentId: 'doc1',
        action: 'uploaded',
        title: 'Test Document',
        type: 'PDF',
        size: 1024
      });
      expect(mockOnDocumentUpdate).toHaveBeenCalledWith(expect.objectContaining({
        documentId: 'doc1',
        action: 'uploaded'
      }));
    });

    it('should limit document updates to 30', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.DOCUMENT_UPLOADED)) {
          eventHandler = handler;
        }
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useRealTimeUpdates());

      // Add 35 document updates
      act(() => {
        for (let i = 0; i < 35; i++) {
          const docEvent: DocumentEvent = {
            id: `event${i}`,
            type: EventType.DOCUMENT_UPLOADED,
            timestamp: Date.now() + i,
            data: {
              documentId: `doc${i}`,
              documentTitle: `Document ${i}`,
              documentType: 'PDF'
            }
          };
          eventHandler(docEvent);
        }
      });

      expect(result.current.documentUpdates).toHaveLength(30);
      expect(result.current.documentUpdates[0].documentId).toBe('doc34'); // Most recent
    });
  });

  describe('Subscription Management', () => {
    it('should manage subscriptions dynamically', () => {
      const { result } = renderHook(() => useRealTimeUpdates());

      act(() => {
        result.current.subscribeToJobs(['job1', 'job2']);
      });
      
      expect(mockWs.subscribe).toHaveBeenCalled();

      act(() => {
        result.current.unsubscribeFromJobs();
      });

      expect(mockWs.unsubscribe).toHaveBeenCalled();
    });

    it('should resubscribe when realm changes', () => {
      const { rerender } = renderHook(
        ({ realmId }) => useRealTimeUpdates({ realmId, jobIds: ['job1'] }),
        { initialProps: { realmId: 'realm1' } }
      );

      expect(mockWs.subscribe).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        'realm1'
      );

      jest.clearAllMocks();

      rerender({ realmId: 'realm2' });

      expect(mockWs.unsubscribe).toHaveBeenCalled();
      expect(mockWs.subscribe).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        'realm2'
      );
    });
  });

  describe('Utility Functions', () => {
    it('should clear updates', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useRealTimeUpdates());

      // Add some updates
      act(() => {
        const jobEvent: JobStatusEvent = {
          id: 'event1',
          type: EventType.JOB_STARTED,
          timestamp: Date.now(),
          data: { jobId: 'job1' }
        };
        eventHandler(jobEvent);
      });

      expect(result.current.jobUpdates).toHaveLength(1);

      act(() => {
        result.current.clearUpdates();
      });

      expect(result.current.jobUpdates).toHaveLength(0);
      expect(result.current.documentUpdates).toHaveLength(0);
    });
  });

  describe('Connection State Monitoring', () => {
    it('should monitor connection state periodically', () => {
      renderHook(() => useRealTimeUpdates());

      expect(mockWs.subscribe).toHaveBeenCalledWith(
        [
          EventType.CONNECTION_ESTABLISHED,
          EventType.CONNECTION_LOST,
          EventType.CONNECTION_RESTORED,
          EventType.HEARTBEAT
        ],
        expect.any(Function),
        undefined
      );
    });

    it('should call connection state change callback', () => {
      const mockOnConnectionStateChange = jest.fn();
      
      let connectionHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        if (eventTypes.includes(EventType.CONNECTION_ESTABLISHED)) {
          connectionHandler = handler;
        }
        return 'mock-sub-id';
      });

      renderHook(() => useRealTimeUpdates({ 
        onConnectionStateChange: mockOnConnectionStateChange 
      }));

      const connectionEvent = {
        id: 'conn-event',
        type: EventType.CONNECTION_ESTABLISHED,
        timestamp: Date.now(),
        data: { connectionId: 'conn1' }
      };

      act(() => {
        connectionHandler(connectionEvent);
      });

      expect(mockOnConnectionStateChange).toHaveBeenCalled();
    });
  });
});

describe('useJobMonitoring', () => {
  it('should be a shorthand for job-specific monitoring', () => {
    const { result } = renderHook(() => 
      useJobMonitoring(['job1', 'job2'], 'realm1')
    );

    expect(result.current.isConnected).toBeDefined();
    expect(result.current.jobUpdates).toBeDefined();
    expect(mockWs.connect).toHaveBeenCalled();
  });
});

describe('useDocumentMonitoring', () => {
  it('should be a shorthand for document-specific monitoring', () => {
    const { result } = renderHook(() => 
      useDocumentMonitoring(['doc1', 'doc2'], 'realm1')
    );

    expect(result.current.isConnected).toBeDefined();
    expect(result.current.documentUpdates).toBeDefined();
    expect(mockWs.connect).toHaveBeenCalled();
  });
});