import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().default('file:./prisma/dev.db'),
  JWT_SECRET: z.string().min(32).default('your-32-character-secret-key-here-make-it-secure'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export const config = envSchema.parse(process.env);

export type Config = typeof config;
