import { build } from '../../app';
import { EventEmitter } from 'events';
import { NotificationService } from '../../services/notifications/notification.service';
import { WebSocketServer as WSServer } from '../../services/notifications/websocket.server';
import { MockWebSocket } from '../setup';

// Create a mock NotificationService class
class MockNotificationService extends EventEmitter {
  getNotifications = jest.fn();
  markAsRead = jest.fn();
  markAllAsRead = jest.fn();
  subscribe = jest.fn();
  unsubscribe = jest.fn();
  
  constructor(prisma: any, eventEmitter: EventEmitter) {
    super();
    // Forward events from the provided event emitter
    eventEmitter.on('notification', (...args) => this.emit('notification', ...args));
  }
  
  // Add emit method to satisfy TypeScript
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

// Create a mock WebSocket server implementation
class MockWSServer extends EventEmitter {
  close = jest.fn((callback?: (err?: Error) => void) => callback?.());
  clients = new Set<{readyState: number, send: jest.Mock, close: jest.Mock, on: jest.Mock}>();
  private _connectionHandler?: (ws: any, request: any) => void;
  
  constructor(options: any) {
    super();
    
    // Set up the 'on' method to handle event registration
    this.on = jest.fn((event: string, listener: (...args: any[]) => void) => {
      if (event === 'connection') {
        this._connectionHandler = listener;
      }
      super.on(event, listener);
      return this;
    }) as any;
    
    // Set up the connection handler
    const connectionHandler = (ws: any, request: any) => {
      // Store the connection
      this.clients.add(ws);
      
      // Set up message handling
      ws.on = jest.fn((event: string, listener: (...args: any[]) => void) => {
        if (event === 'message') {
          ws._messageHandler = listener;
        } else if (event === 'close') {
          ws._closeHandler = listener;
        }
        return ws;
      });
      
      // Set up send mock
      ws.send = jest.fn();
      
      // Set up close mock
      ws.close = jest.fn();
      ws.readyState = 1; // WebSocket.OPEN
      
      // Call the registered connection handler if it exists
      if (this._connectionHandler) {
        this._connectionHandler(ws, request);
      }
    };
    
    // Register the connection handler
    super.on('connection', connectionHandler);
  }
  
  // Helper method to simulate a connection
  simulateConnection(ws: any, request: any) {
    // Get the connection handler
    const connectionHandler = this.listeners('connection')[0];
    if (connectionHandler) {
      connectionHandler(ws, request);
    }
    
    // Return the mock WebSocket with proper typing
    return {
      ...ws,
      send: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
      readyState: 1,
      _messageHandler: null as any,
      _closeHandler: null as any
    };
  }
}

// Create the mock WebSocket server instance
const mockWSServer = new MockWSServer({ noServer: true });

// Mock the WebSocket module
const WebSocket = jest.requireActual('ws');

jest.mock('ws', () => {
  return {
    ...WebSocket,
    WebSocket: jest.fn().mockImplementation(() => {
      const mockWs = {
        on: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1, // WebSocket.OPEN
      };
      mockWSServer.clients.add(mockWs);
      return mockWs;
    }),
    Server: jest.fn().mockImplementation(() => mockWSServer),
  };
});

// Mock the notification service
jest.mock('../../services/notifications/notification.service', () => ({
  __esModule: true,
  default: MockNotificationService,
}));


// Import the WebSocket server implementation
const { WebSocketServer } = require('../../services/notifications/websocket.server');

describe('WebSocket Notifications', () => {
  let app: any;
  let server: any;
  let notificationService: jest.Mocked<NotificationService>;
  let wsServer: any;
  let mockWSServer: MockWSServer;
  
  const testUserId = 'test-ws-user-1';
  const documentId = 'test-ws-doc-1';
  const baseUrl = 'ws://localhost:3000';
  
  beforeAll(async () => {
    // Create a new Fastify instance
    app = await build();
    
    // Create a mock notification service
    const emitter = new EventEmitter();
    notificationService = new MockNotificationService(
      {} as any, // Prisma client
      emitter
    ) as unknown as jest.Mocked<NotificationService>;
    
    // Add the mock service to the Fastify instance
    app.decorate('notificationService', notificationService);
    
    // Start the server
    await app.ready();
    server = app.server;
    
    // Create a mock WebSocket server
    mockWSServer = new MockWSServer({ noServer: true });
    
    // Create WebSocket server with our mock implementation
    wsServer = new WebSocketServer(server, notificationService, mockWSServer as any);
    
    // Mock the notification service methods
    notificationService.getNotifications.mockResolvedValue([]);
    notificationService.markAsRead.mockResolvedValue({
      id: 'test-notification-1',
      userId: testUserId,
      type: 'DOCUMENT_UPDATED',
      message: 'Test notification',
      documentId: 'test-doc-1',
      read: true,
      timestamp: new Date(),
      metadata: {}
    });
    notificationService.subscribe.mockImplementation(() => () => {});
  });
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the getNotifications method
    notificationService.getNotifications.mockResolvedValue([
      {
        id: 'test-notification-1',
        userId: testUserId,
        type: 'DOCUMENT_UPDATED' as const,
        message: 'Document updated',
        read: false,
        timestamp: new Date(),
        documentId: 'doc-123',
        metadata: {}
      }
    ]);
  });
  
  afterAll(async () => {
    // Clean up the server after all tests
    await app.close();
  });
  
  // Save the original WebSocket class
  const OriginalWebSocket = global.WebSocket;
  
  // Create a mock WebSocket class with the necessary static properties
  class MockWebSocket extends EventEmitter {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    
    send = jest.fn();
    close = jest.fn();
    readyState: number = MockWebSocket.OPEN;
    userId: string = '';
    
    constructor() {
      super();
      this.on = jest.fn((event, callback) => {
        this.addListener(event, callback);
        return this;
      });
    }
  }
  
  // Save the original WebSocket
  const originalWebSocket = global.WebSocket;
  
  // Create a mock WebSocket class with proper static properties
  class MockWebSocketWithConstants extends MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
  }
  
  // Replace the global WebSocket with our mock
  // @ts-ignore - We're intentionally replacing the global WebSocket for testing
  global.WebSocket = MockWebSocketWithConstants as any;

  it('should handle WebSocket notifications correctly', async () => {
    // Create a test notification with a fixed timestamp string
    const testTimestamp = '2025-09-13T15:58:14.162Z';
    const testNotification = {
      id: 'test-notification-1',
      userId: 'test-user-1',
      type: 'TEST_NOTIFICATION' as const,
      message: 'Test notification',
      timestamp: testTimestamp,
      read: false
    };

    // Create a mock WebSocket server
    const mockWSServer = {
      on: jest.fn(),
      clients: new Set(),
      close: jest.fn()
    };

    // Add Symbol.iterator to the clients set to make it iterable
    (mockWSServer.clients as any)[Symbol.iterator] = function() {
      return mockWSServer.clients.values();
    };

    // Initialize the WebSocket server with our mock server
    const wsServer = new WebSocketServer(
      {} as any, 
      notificationService, 
      mockWSServer as any
    );

    // Get the connection handler
    const connectionHandler = mockWSServer.on.mock.calls[0][1];
    
    // Mock the notification service's subscribe method
    let notificationCallback: (notification: any) => void = () => {};
    (notificationService.subscribe as jest.Mock).mockImplementation((userId, callback) => {
      console.log('Subscription created for user:', userId);
      notificationCallback = callback;
      return () => {
        console.log('Unsubscribed user:', userId);
      };
    });

    // Create a mock WebSocket client with userId
    const mockWs = new MockWebSocket();
    mockWs.userId = 'test-user-1';
    
    // Simulate a connection with the WebSocket server
    const mockRequest = {
      url: '/test-user-1',
      headers: {
        host: 'localhost'
      }
    };
    
    // Add the mock WebSocket to the server's clients set
    mockWSServer.clients.add(mockWs);
    
    // Simulate a connection
    connectionHandler(mockWs, mockRequest);
    
    // Test 1: Test broadcastToUser method with matching user ID
    const broadcastData = {
      type: 'TEST_BROADCAST',
      data: { test: 'data' }
    };
    
    // Log the mock WebSocket state before the call
    console.log('Before broadcastToUser:', {
      clientsCount: mockWSServer.clients.size,
      mockWs: {
        readyState: mockWs.readyState,
        userId: mockWs.userId,
        hasSend: typeof mockWs.send === 'function',
        isOpen: mockWs.readyState === MockWebSocket.OPEN
      },
      MockWebSocket_OPEN: MockWebSocket.OPEN,
      WebSocket_OPEN: WebSocket.OPEN
    });
    
    // Test the sendNotification method directly with our mock WebSocket
    console.log('Testing sendNotification directly...');
    
    // Create a mock WebSocket with a proper send method
    const testSendNotificationWs = new MockWebSocket();
    testSendNotificationWs.userId = 'test-user-1';
    
    // Ensure the readyState is set to OPEN
    testSendNotificationWs.readyState = MockWebSocket.OPEN;
    
    // Mock the send method
    const mockSend = jest.fn();
    testSendNotificationWs.send = mockSend;
    
    // Call the private method with our test WebSocket
    (wsServer as any).sendNotification(testSendNotificationWs, testNotification);
    
    // Verify that the send method was called
    expect(mockSend).toHaveBeenCalled();
    
    // Get the sent message and verify its structure
    const sentMessage = JSON.parse(mockSend.mock.calls[0][0]);
    
    // Verify the message structure and timestamp format
    expect(sentMessage).toMatchObject({
      type: 'NOTIFICATION',
      data: {
        id: testNotification.id,
        userId: testNotification.userId,
        type: testNotification.type,
        message: testNotification.message,
        read: testNotification.read,
        timestamp: expect.any(String) // Timestamp should be a string
      }
    });
    
    // Verify the timestamp is in ISO format
    expect(new Date(sentMessage.data.timestamp).toISOString()).toBe(testTimestamp);
    
    // Reset the mock for the next test
    mockSend.mockClear();
    mockWs.send.mockClear();
    
    // Test 2: Test broadcastToUser with matching user ID
    console.log('Testing broadcastToUser...');
    
    // Create a new mock WebSocket server for this test
    const mockWsServer = {
      on: jest.fn(),
      clients: new Set(),
      close: jest.fn()
    };
    
    // Add Symbol.iterator to the clients set to make it iterable
    (mockWsServer.clients as any)[Symbol.iterator] = function() {
      return mockWsServer.clients.values();
    };
    
    // Create a new WebSocket server with our mock server
    const testWsServer = new WebSocketServer(
      {} as any, 
      notificationService, 
      mockWsServer as any
    );
    
    // Create a test WebSocket client for broadcast testing
    const testBroadcastWs = new MockWebSocket();
    testBroadcastWs.userId = 'test-user-1';
    
    // Add the test WebSocket to the server's clients set
    mockWsServer.clients.add(testBroadcastWs);
    
    // Test broadcastToUser
    testWsServer.broadcastToUser('test-user-1', broadcastData);
    
    // Verify that the send method was called
    expect(testBroadcastWs.send).toHaveBeenCalled();
    
    // Get the broadcasted message
    const broadcastedMessage = JSON.parse(testBroadcastWs.send.mock.calls[0][0]);
    
    // Verify the broadcasted message
    expect(broadcastedMessage).toEqual(broadcastData);
    
    // Reset the mock for the next test
    testBroadcastWs.send.mockClear();
    
    // Test 3: Test that notifications are not sent to WebSockets with different user IDs
    console.log('Testing with different user ID...');
    wsServer.broadcastToUser('different-user-id', broadcastData);
    
    // Verify that the WebSocket's send method was not called for a different user
    expect(mockWs.send).not.toHaveBeenCalled();
    
    // Test 4: Test that notifications are not sent when the WebSocket is not in the OPEN state
    console.log('Testing with closed WebSocket...');
    mockWs.readyState = MockWebSocket.CLOSED;
    mockWs.send.mockClear();
    wsServer.broadcastToUser('test-user-1', broadcastData);
    expect(mockWs.send).not.toHaveBeenCalled();
    
    // Restore the original WebSocket class
    global.WebSocket = OriginalWebSocket;
  });
  
  it('should handle connection errors', () => {
    // Create a new mock WebSocket server for this test
    const mockWSServer = {
      on: jest.fn(),
      clients: new Set(),
      close: jest.fn()
    };
    
    // Initialize the WebSocket server with our mock server
    new WebSocketServer({} as any, notificationService, mockWSServer as any);
    
    // Get the connection handler directly from the mock server
    const connectionHandler = mockWSServer.on.mock.calls[0][1];
    expect(connectionHandler).toBeDefined();
    
    // Create a mock WebSocket client
    const mockWs = new MockWebSocket();
    mockWs.userId = 'test-user-1';
    
    // Simulate connection with invalid URL (no user ID)
    connectionHandler(mockWs, { 
      url: '/',
      headers: { host: 'localhost' }
    });
    
    // Verify the WebSocket was closed due to invalid URL
    expect(mockWs.close).toHaveBeenCalledWith(4000, 'Invalid URL format. Expected /{userId}');
  });
});
