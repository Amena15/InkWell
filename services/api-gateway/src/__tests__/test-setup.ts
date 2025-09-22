// Set test timeout to 30 seconds
jest.setTimeout(30000);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
