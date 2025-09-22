import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  SERVICE_NAME: z.string().default('base-service'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Message Broker
  RABBITMQ_URL: z.string().default('amqp://rabbitmq:5672'),
  
  // JWT (for auth)
  JWT_SECRET: z.string().min(32),
  
  // Service URLs (for inter-service communication)
  AUTH_SERVICE_URL: z.string().url().default('http://auth:3001'),
  DOCS_SERVICE_URL: z.string().url().default('http://docs:3002'),
  AI_SERVICE_URL: z.string().url().default('http://ai:3003'),
  METRICS_SERVICE_URL: z.string().url().default('http://metrics:3004'),
  NOTIFICATIONS_SERVICE_URL: z.string().url().default('http://notifications:3005'),
  
  // API Gateway
  API_GATEWAY_URL: z.string().url().default('http://api-gateway:3000'),
});

export const config = envSchema.parse(process.env);

export type Config = typeof config;
