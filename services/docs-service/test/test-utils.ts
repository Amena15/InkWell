import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

// Set the test database URL
process.env.DATABASE_URL = 'file:./test.db';

// Initialize Prisma client for testing
const prisma = new PrismaClient({
  datasourceUrl: 'file:./test.db',
  log: ['query', 'info', 'warn', 'error']
});

/**
 * Run Prisma migrations for testing
 */
const runMigrations = (): void => {
  try {
    // Ensure the database file exists
    execSync('touch test.db');
    
    // Run migrations
    execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test.db',
      },
      stdio: 'inherit',
    });
    
    // Run prisma db push to ensure schema is up to date
    execSync('npx prisma db push --accept-data-loss --force-reset', {
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test.db',
      },
      stdio: 'inherit',
    });
    
    console.log('✅ Database migrations applied');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  }
};

/**
 * Set up the test database
 */
const setupTestDatabase = async (): Promise<void> => {
  try {
    // Run migrations to create the database schema
    runMigrations();
    
    // Connect to the database
    await prisma.$connect();
    
    // Ensure the Document table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `;
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
};

/**
 * Clean up test data
 */
const cleanupTestDatabase = async (): Promise<void> => {
  try {
    // Delete all data but keep the table structure
    await prisma.$executeRaw`DELETE FROM "Document";`;
    console.log('🧹 Cleaned up test data');
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
    // Don't throw here to allow tests to continue
  }
};

/**
 * Close the database connection
 */
const closeTestDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from test database');
  } catch (error) {
    console.error('❌ Error disconnecting from test database:', error);
    // Don't throw here to allow tests to continue
  }
};

// Export a test database object with all the utilities
export const testDb = {
  prisma,
  setup: setupTestDatabase,
  cleanup: cleanupTestDatabase,
  close: closeTestDatabase
};
