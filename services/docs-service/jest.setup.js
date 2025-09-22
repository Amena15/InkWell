// Load environment variables for testing
const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '.env.test'),
});

// Set up any global test configurations
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000); // 30 seconds timeout for tests
