import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3002'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  
  // RabbitMQ
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  RABBITMQ_EXCHANGE: z.string().default('doc_events'),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
});

const env = envSchema.parse(process.env);

// Helper function to parse CORS origins
function parseCorsOrigins(origin: string): string | string[] {
  if (origin === '*') return '*';
  return origin.split(',').map((o: string) => o.trim());
}

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  host: env.HOST,
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
  authService: {
    url: env.AUTH_SERVICE_URL,
  },
  rabbitmq: {
    url: env.RABBITMQ_URL,
    exchange: env.RABBITMQ_EXCHANGE,
    enabled: true,
  },
  logLevel: env.LOG_LEVEL,
  cors: {
    origin: parseCorsOrigins(env.CORS_ORIGIN),
  },
} as const;
