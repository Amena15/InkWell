// Mock the uuid module
jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}));

// Mock the WebSocket server
class MockWebSocket {
  on = jest.fn();
  send = jest.fn();
  close = jest.fn();
  readyState = 1; // WebSocket.OPEN
}

class MockWebSocketServer {
  on = jest.fn();
  close = jest.fn();
  clients = new Set<MockWebSocket>();
}

const mockWebSocketServer = new MockWebSocketServer();

jest.mock('ws', () => {
  return {
    WebSocket: jest.fn().mockImplementation(() => new MockWebSocket()),
    Server: jest.fn().mockImplementation(() => mockWebSocketServer),
  };
});

// Export mocks for use in tests
export { mockWebSocketServer, MockWebSocket };
