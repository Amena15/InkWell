import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { config } from './config';
import { authRoutes } from './routes/auth.routes';
import { authPlugin } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.nodeEnv === 'production'
      ? true
      : {
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
  app.register(cors, {
    origin: config.nodeEnv === 'production' ? false : '*',
    credentials: true,
  });

  app.register(helmet);
  app.register(cookie);  // Register @fastify/cookie here

  // Register auth plugin
  app.register(authPlugin);

  // Register routes
  app.register(authRoutes, { prefix: '/api/auth' });

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
  }));

  // Set error handler
  app.setErrorHandler(errorHandler);

  return app;
}

// Only start the server if this file is run directly
if (require.main === module) {
  (async () => {
    try {
      const app = await buildApp();
      await app.listen({ 
        port: config.port, 
        host: '0.0.0.0' 
      });
      console.log(`Server is running on http://localhost:${config.port}`);
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  })();
}

// Export the app instance for testing
export const app = buildApp();
