// @ts-ignore - Node.js types are available but not recognized
import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { buildApp } from '../src/app';

// Import Node.js types
declare const process: {
  env: {
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
    USER?: string;
    NODE_ENV?: string;
  };
};

// Test database configuration - using the system user for local development
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: process.env.USER || 'postgres', // Use system username
  password: '', // No password for local development
  database: 'auth_service_test' // Must match the database name in config.ts
};

// Create a connection pool
const pool = new Pool(DB_CONFIG);

export const testPool = pool;

export async function buildTestApp() {
  const client = await pool.connect();
  
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "refreshToken" TEXT NOT NULL UNIQUE,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Clean up any existing data
    await client.query('TRUNCATE sessions, users CASCADE');
    
    // Build and return the Fastify app
    const app = await buildApp();
    return app as FastifyInstance & { pg: any };
  } finally {
    client.release();
  }
}

export async function closeTestApp(app: FastifyInstance) {
  if (app) {
    await app.close();
  }
  await pool.end();
}
