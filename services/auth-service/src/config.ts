import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/auth_service'),
  JWT_SECRET: z.string().min(32).default('default-jwt-secret-please-change-in-production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32).default('default-refresh-secret-please-change-in-production'),
  GRPC_PORT: z.string().default('50051'),
  RABBITMQ_URL: z.string().url().default('amqp://localhost:5672'),
  
  // gRPC configuration
  GRPC_HOST: z.string().default('0.0.0.0'),
  GRPC_CERT_PATH: z.string().optional(),
  GRPC_KEY_PATH: z.string().optional(),
  GRPC_CA_PATH: z.string().optional(),
  GRPC_CREDENTIALS: z.enum(['insecure', 'ssl', 'tls']).default('insecure'),
  
  // Database connection details (optional, can use DATABASE_URL instead)
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGHOST: z.string().optional(),
  PGPORT: z.string().optional(),
  PGDATABASE: z.string().optional(),
  
  // Test database URL (used in test environment)
  TEST_DATABASE_URL: z.string().url().optional()
    .default('postgresql://postgres:postgres@localhost:5432/auth_service_test'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(env.error.format(), null, 2));
  process.exit(1);
}

// Build database URL from individual components if DATABASE_URL is not provided
const databaseUrl = env.data.DATABASE_URL || (
  env.data.PGUSER && env.data.PGPASSWORD && env.data.PGHOST && env.data.PGPORT && env.data.PGDATABASE
    ? `postgresql://${env.data.PGUSER}:${env.data.PGPASSWORD}@${env.data.PGHOST}:${env.data.PGPORT}/${env.data.PGDATABASE}`
    : env.data.DATABASE_URL
);

const isTest = env.data.NODE_ENV === 'test';

const config = {
  nodeEnv: env.data.NODE_ENV,
  port: parseInt(env.data.PORT, 10),
  databaseUrl: isTest ? env.data.TEST_DATABASE_URL : databaseUrl,
  jwt: {
    secret: env.data.JWT_SECRET,
    refreshSecret: env.data.JWT_REFRESH_SECRET,
    accessExpiration: env.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiration: env.data.JWT_REFRESH_EXPIRES_IN,
  },
  grpc: {
    port: parseInt(env.data.GRPC_PORT, 10),
    host: env.data.GRPC_HOST,
    credentials: env.data.GRPC_CREDENTIALS as 'insecure' | 'ssl' | 'tls',
    certPath: env.data.GRPC_CERT_PATH,
    keyPath: env.data.GRPC_KEY_PATH,
    caPath: env.data.GRPC_CA_PATH,
  },
  rabbitmqUrl: env.data.RABBITMQ_URL,
  isTest,
  testDatabaseUrl: env.data.TEST_DATABASE_URL,
} as const;

export { config };
