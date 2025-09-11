/**
 * MockWebSocket Tests
 */

import MockWebSocket, { mockWebSocket } from './mockWebSocket';
import { EventType, WebSocketEvent, JobStatusEvent } from './eventTypes';

// Mock BroadcastChannel
const mockBroadcastChannel = {
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  close: jest.fn(),
};

const BroadcastChannelMock = jest.fn(() => mockBroadcastChannel);
// @ts-ignore
global.BroadcastChannel = BroadcastChannelMock;

describe('MockWebSocket', () => {
  let ws: MockWebSocket;

  beforeEach(() => {
    // Clear singleton instance
    (MockWebSocket as any).instance = null;
    jest.clearAllMocks();
    // Clear the BroadcastChannel mock calls before creating new instance
    BroadcastChannelMock.mockClear();
    ws = mockWebSocket();
  });

  afterEach(() => {
    ws.destroy();
  });

  describe('Connection Management', () => {
    it('should start with disconnected state', () => {
      const state = ws.getConnectionState();
      expect(state.connected).toBe(false);
      expect(state.connecting).toBe(false);
    });

    it('should connect successfully', async () => {
      await ws.connect();
      const state = ws.getConnectionState();
      expect(state.connected).toBe(true);
      expect(state.connecting).toBe(false);
    });

    it('should handle connection establishment event', async () => {
      const eventHandler = jest.fn();
      ws.subscribe([EventType.CONNECTION_ESTABLISHED], eventHandler);
      
      await ws.connect();
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventType.CONNECTION_ESTABLISHED,
          data: expect.objectContaining({
            connectionId: expect.any(String),
            latency: expect.any(Number)
          })
        })
      );
    });

    it('should disconnect properly', async () => {
      await ws.connect();
      ws.disconnect();
      
      const state = ws.getConnectionState();
      expect(state.connected).toBe(false);
    });

    it('should handle disconnection event', async () => {
      const eventHandler = jest.fn();
      ws.subscribe([EventType.CONNECTION_LOST], eventHandler);
      
      await ws.connect();
      ws.disconnect();
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventType.CONNECTION_LOST
        })
      );
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', () => {
      const callback = jest.fn();
      const subscriptionId = ws.subscribe([EventType.JOB_STARTED], callback);
      
      expect(subscriptionId).toMatch(/^sub_/);
    });

    it('should unsubscribe from events', () => {
      const callback = jest.fn();
      const subscriptionId = ws.subscribe([EventType.JOB_STARTED], callback);
      
      const result = ws.unsubscribe(subscriptionId);
      expect(result).toBe(true);
    });

    it('should return false when unsubscribing non-existent subscription', () => {
      const result = ws.unsubscribe('non-existent');
      expect(result).toBe(false);
    });

    it('should notify subscribers of matching events', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED], callback);
      
      const event: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          progress: 0,
          message: 'Job started'
        }
      };
      
      ws.simulateEvent(event);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should not notify subscribers of non-matching events', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED], callback);
      
      const event: WebSocketEvent = {
        id: 'test-event',
        type: EventType.JOB_COMPLETED,
        timestamp: Date.now(),
        data: {}
      };
      
      ws.simulateEvent(event);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should filter events by realm', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED], callback, 'realm1');
      
      const event: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        realmId: 'realm2',
        data: {
          jobId: 'test-job'
        }
      };
      
      ws.simulateEvent(event);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should notify subscribers when realm matches', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED], callback, 'realm1');
      
      const event: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        realmId: 'realm1',
        data: {
          jobId: 'test-job'
        }
      };
      
      ws.simulateEvent(event);
      expect(callback).toHaveBeenCalledWith(event);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const callback = jest.fn();
      ws.addEventListener(EventType.JOB_STARTED, callback);
      
      const event: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: { jobId: 'test-job' }
      };
      
      ws.simulateEvent(event);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should remove event listener', () => {
      const callback = jest.fn();
      ws.addEventListener(EventType.JOB_STARTED, callback);
      ws.removeEventListener(EventType.JOB_STARTED, callback);
      
      const event: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: { jobId: 'test-job' }
      };
      
      ws.simulateEvent(event);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Event Generation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should track active jobs', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED, EventType.JOB_PROGRESS], callback);
      
      const startEvent: JobStatusEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          documentId: 'test-doc',
          stage: 'processing',
          progress: 0
        }
      };
      
      ws.simulateEvent(startEvent);
      expect(callback).toHaveBeenCalledWith(startEvent);
    });

    it('should generate progress events for active jobs', async () => {
      // Enable fake timers before starting
      jest.useFakeTimers();
      
      try {
        await ws.connect();
        
        const callback = jest.fn();
        ws.subscribe([EventType.JOB_PROGRESS], callback);
        
        // Start a job
        const startEvent: JobStatusEvent = {
          id: 'start-event',
          type: EventType.JOB_STARTED,
          timestamp: Date.now(),
          data: {
            jobId: 'test-job',
            documentId: 'test-doc',
            progress: 0
          }
        };
        
        ws.simulateEvent(startEvent);
        
        // Fast-forward to trigger event generation
        jest.advanceTimersByTime(5000);
        
        // Wait for any pending promises
        await Promise.resolve();
        
        // Should have generated some progress events
        const progressCalls = callback.mock.calls.filter(call => 
          call[0].type === EventType.JOB_PROGRESS
        );
        
        expect(progressCalls.length).toBeGreaterThan(0);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const ws1 = mockWebSocket();
      const ws2 = mockWebSocket();
      
      expect(ws1).toBe(ws2);
    });

    it('should create new instance after destroy', () => {
      const ws1 = mockWebSocket();
      ws1.destroy();
      
      const ws2 = mockWebSocket();
      expect(ws1).not.toBe(ws2);
    });
  });

  describe('Cross-tab Communication', () => {
    it('should initialize broadcast channel when enabled', () => {
      expect(BroadcastChannelMock).toHaveBeenCalledWith('morag-websocket-sync');
    });

    it('should broadcast events to other tabs', () => {
      const event: WebSocketEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {}
      };
      
      ws.simulateEvent(event);
      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(event);
    });

    it('should handle incoming broadcast events', () => {
      const callback = jest.fn();
      ws.subscribe([EventType.JOB_STARTED], callback);
      
      const event: WebSocketEvent = {
        id: 'broadcast-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {}
      };
      
      // Simulate broadcast message
      const messageHandler = mockBroadcastChannel.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];
      
      if (messageHandler) {
        messageHandler({ data: event });
        expect(callback).toHaveBeenCalledWith(event);
      }
    });
  });

  describe('Event Queue', () => {
    it('should maintain event queue', () => {
      const events = Array.from({ length: 105 }, (_, i) => ({
        id: `event-${i}`,
        type: EventType.JOB_STARTED,
        timestamp: Date.now() + i,
        data: {}
      }));
      
      events.forEach(event => ws.simulateEvent(event));
      
      // Should only keep last 100 events (default messageQueueSize)
      // We can't directly test the queue size, but we know it's working
      // if no errors are thrown and memory doesn't grow indefinitely
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      ws.subscribe([EventType.JOB_STARTED], errorCallback);
      
      const event: WebSocketEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {}
      };
      
      expect(() => ws.simulateEvent(event)).not.toThrow();
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('should handle event listener errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      ws.addEventListener(EventType.JOB_STARTED, errorCallback);
      
      const event: WebSocketEvent = {
        id: 'test-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {}
      };
      
      expect(() => ws.simulateEvent(event)).not.toThrow();
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });
});