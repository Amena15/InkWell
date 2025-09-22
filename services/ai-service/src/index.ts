import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { config } from './config.js';
import { setupEventHandlers } from './events';
import { MetricsService } from './services/metrics/metrics.service';
import routes from './routes';
import metricsRoutes from './routes/metrics.routes';

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  disableRequestLogging: config.NODE_ENV === 'production',
});

// Register plugins
app.register(import('@fastify/cors'), {
  origin: config.CORS_ORIGIN,
  credentials: true,
});

app.register(import('@fastify/helmet'));
app.register(import('@fastify/sensible'));

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services
const eventEmitter = new EventEmitter();
const metricsService = new MetricsService(prisma, eventEmitter);

// Decorate Fastify instance with services
app.decorate('prisma', prisma);
app.decorate('metricsService', metricsService);

// Register routes
app.register(routes);

// Register metrics routes
app.register(metricsRoutes);

// Setup event handlers
setupEventHandlers(eventEmitter).catch((error) => {
  app.log.error('Failed to setup event handlers:', error);
  process.exit(1);
});

// Graceful shutdown
const shutdown = async () => {
  app.log.info('Shutting down gracefully...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
const start = async () => {
  try {
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`Server is running on http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  app.log.info('SIGINT signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});
