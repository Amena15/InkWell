import { PrismaClient } from '@prisma/client';

// Extend NodeJS.ProcessEnv to include our environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

// Create a test database URL with a unique schema for each test run
const generateTestDatabaseUrl = (): string => {
  const defaultDbUrl = 'postgresql://postgres:postgres@localhost:5432/test_docs_service';
  const testDbUrl = new URL(process.env.DATABASE_URL || defaultDbUrl);
  testDbUrl.searchParams.set('schema', `test_${Date.now()}`);
  return testDbUrl.toString();
};

// Set up test database
const setupTestDatabase = () => {
  // Generate a unique schema for this test run
  const testDatabaseUrl = generateTestDatabaseUrl();
  
  // Create a Prisma client with the test database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });
  
  // Set the DATABASE_URL for the application to use
  process.env.DATABASE_URL = testDatabaseUrl;
  
  return {
    prisma,
    testDatabaseUrl,
  };
};

// Clean up test database
const teardownTestDatabase = async (prisma: PrismaClient): Promise<void> => {
  // Disconnect from the test database
  await prisma.$disconnect();
};

export { setupTestDatabase, teardownTestDatabase };

// This file provides utility functions for setting up and tearing down a test database.
// It creates a new database with a unique name for each test run and cleans it up afterward.
// The database URL is set in the environment variables for the test environment.
