// Global TypeScript declarations

// Extend the NodeJS namespace to include our environment variables
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    RABBITMQ_URL: string;
    // Add other environment variables here as needed
  }
}

// This allows TypeScript to recognize global test functions
declare var describe: jest.Describe;
declare var it: jest.It;
declare var expect: jest.Expect;
declare var beforeAll: jest.Lifecycle;
declare var afterAll: jest.Lifecycle;
declare var beforeEach: jest.Lifecycle;
declare var afterEach: jest.Lifecycle;

// Make sure TypeScript knows about Jest's expect
declare const expect: jest.Expect;
