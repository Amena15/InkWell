import { z } from 'zod';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof import('../../config').envSchema> {}
  }
}

declare const config: {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    accessExpiration: string;
    refreshExpiration: string;
  };
  grpc: {
    port: number;
    host: string;
    credentials: 'insecure' | 'ssl' | 'tls';
    certPath?: string;
    keyPath?: string;
    caPath?: string;
  };
  rabbitmqUrl: string;
  isTest: boolean;
  testDatabaseUrl: string;
};

export {};
