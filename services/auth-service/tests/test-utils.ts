import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';
import { config } from '../src/config';

export const testConfig = {
  ...config,
  database: {
    ...config.database,
    url: config.database.url.replace('?', '_test?'),
  },
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testConfig.database.url,
    },
  },
});

export async function createTestApp(): Promise<FastifyInstance> {
  const app = createApp();
  
  // Clear the test database before each test
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS auth CASCADE`;
  await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS auth`;
  
  // Run migrations
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "auth"."users" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "lastLogin" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");
    
    CREATE TABLE IF NOT EXISTS "auth"."sessions" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "refreshToken" TEXT NOT NULL,
      "userAgent" TEXT,
      "ipAddress" TEXT,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "auth"."sessions"("refreshToken");
    
    ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  `;
  
  return app;
}

export async function closeTestApp(app: FastifyInstance) {
  await app.close();
  await prisma.$disconnect();
}

export const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

export async function createTestUser() {
  return prisma.user.create({
    data: {
      email: testUser.email,
      name: testUser.name,
      password: '$2a$10$XFD9P3y6fBvZ6X7QJ8q1UO5ZQzJZJZJZJZJZJZJZJZJZJZJZJZJZJZ', // 'password123' hashed
      role: 'USER',
    },
  });
}
