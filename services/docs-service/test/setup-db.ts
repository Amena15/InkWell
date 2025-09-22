import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.test
config({ path: join(__dirname, '../.env.test') });

// Set up test database
const setupTestDatabase = async () => {
  // Create a Prisma client with the test database URL
  const prisma = new PrismaClient();
  
  // Create the test database if it doesn't exist
  try {
    await prisma.$connect();
    
    // Create table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `;
    
    // Create indexes separately
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Document_projectId_idx" ON "Document"("projectId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Document_ownerId_idx" ON "Document"("ownerId")`;
    } catch (error) {
      console.warn('Failed to create indexes, they might already exist:', error);
    }
    
    // Clear any existing data
    await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE;`;
    
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error;
  }
  
  return { prisma };
};

// Clean up test database
const teardownTestDatabase = async (prisma: PrismaClient) => {
  try {
    // Clear all data
    await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE;`;
    // Disconnect from the database
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error during test database teardown:', error);
    throw error;
  }
};

export { setupTestDatabase, teardownTestDatabase };
