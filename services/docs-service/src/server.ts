import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config';
import { documentRoutes } from './routes/document.routes';
import { errorHandler } from './utils/errorHandler';
import { initMessageQueue } from './utils/messageQueue';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await server.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  await server.register(helmet);

  // Register routes
  server.register(documentRoutes, { prefix: '/api/documents' });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // Set up error handling
  server.setErrorHandler(errorHandler);

  // Connect to message queue
  if (config.rabbitmq.enabled) {
    await initMessageQueue();
  }

  return server;
}

export async function startServer() {
  try {
    const server = await buildServer();
    const address = await server.listen({
      port: config.port,
      host: config.host,
    });
    server.log.info(`Server listening at ${address}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch(console.error);
}
