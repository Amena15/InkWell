import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { config } from './config';
import { PrismaClient } from '@prisma/client';
import * as amqp from 'amqplib';

export class BaseService {
  public app: FastifyInstance;
  public db: PrismaClient;
  public mqChannel: amqp.Channel | null = null;
  public mqConnection: amqp.Connection | null = null;

  constructor(options: FastifyServerOptions = {}) {
    this.app = Fastify({
      logger: {
        level: 'info',
        name: config.SERVICE_NAME,
      },
      ...options,
    });

    this.db = new PrismaClient();
  }

  async setup() {
    // Register plugins
    await this.app.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await this.app.register(fastifyHelmet);

    // Health check endpoint
    this.app.get('/health', async () => {
      return { 
        status: 'ok', 
        service: config.SERVICE_NAME,
        timestamp: new Date().toISOString(),
        database: await this.checkDatabase(),
        messageQueue: this.mqChannel ? 'connected' : 'disconnected'
      };
    });
  }

  async connectToMessageQueue() {
    try {
      this.mqConnection = await amqp.connect(config.RABBITMQ_URL);
      this.mqChannel = await this.mqConnection.createChannel();
      
      // Assert the default exchange
      await this.mqChannel.assertExchange('inkwell', 'topic', { durable: true });
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async checkDatabase() {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return 'connected';
    } catch (error) {
      console.error('Database connection error:', error);
      return 'disconnected';
    }
  }

  async start() {
    try {
      await this.setup();
      await this.connectToMessageQueue();
      
      const address = await this.app.listen({
        port: Number(config.PORT),
        host: '0.0.0.0',
      });
      
      console.log(`${config.SERVICE_NAME} service running at ${address}`);
      
      // Handle graceful shutdown
      const shutdown = async () => {
        console.log('Shutting down gracefully...');
        await this.app.close();
        await this.db.$disconnect();
        if (this.mqConnection) await this.mqConnection.close();
        process.exit(0);
      };
      
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      
    } catch (err) {
      console.error('Error starting service:', err);
      process.exit(1);
    }
  }
}

// Export a function to create and start a service
export async function createAndStartService(
  ServiceClass: new () => BaseService,
  options?: FastifyServerOptions
) {
  const service = new ServiceClass();
  await service.start();
  return service;
}
