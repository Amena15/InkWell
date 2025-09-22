// Load environment variables for testing
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
});

// Set up any global test configurations
if (process) {
  process.env.NODE_ENV = 'test';
}

// Global test timeout
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000); // 30 seconds timeout for tests
}
