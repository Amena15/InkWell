import Fastify from 'fastify';
import { config } from './config';

export async function build() {
  const isTest = process.env.NODE_ENV === 'test';
  
  const app = Fastify({
    logger: isTest ? false : {
      level: config.LOG_LEVEL,
      transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
    disableRequestLogging: isTest || config.NODE_ENV === 'production',
  });

  // Register plugins
  await app.register(import('@fastify/cors'), {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(import('@fastify/helmet'));
  await app.register(import('@fastify/sensible'));

  return app;
}
