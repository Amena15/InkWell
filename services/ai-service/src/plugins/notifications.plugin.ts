import { EventEmitter } from 'events';
import { FastifyPluginAsync, FastifyRequest, FastifyInstance } from 'fastify';
import { NotificationService } from '../services/notifications/notification.service';
import prisma from '../lib/prisma';

declare module 'fastify' {
  interface FastifyInstance {
    notificationService: NotificationService;
    eventEmitter: EventEmitter;
  }
  interface FastifyRequest {
    user?: { id: string };
    eventEmitter: EventEmitter;
  }
}

const notificationsPlugin: FastifyPluginAsync = async (fastify) => {
  // Create an event emitter for notifications
  const eventEmitter = new EventEmitter();
  
  // Add event emitter methods to Fastify instance if they don't exist
  if (!fastify.eventEmitter) {
    fastify.decorate('eventEmitter', eventEmitter);
    fastify.addHook('onRequest', (request, reply, done) => {
      // Make event emitter available in request
      request.eventEmitter = eventEmitter;
      done();
    });
  }
  
  const notificationService = new NotificationService(prisma, eventEmitter);
  
  // Store the service in the Fastify instance
  fastify.decorate('notificationService', notificationService);
  
  // Set up WebSocket server if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    const { createServer } = await import('http');
    const { WebSocketServer } = await import('../services/notifications/websocket.server');
    
    const server = createServer();
    new WebSocketServer(server, notificationService);
    
    // Share the HTTP server with Fastify
    fastify.addHook('onReady', (done) => {
      server.listen(0, 'localhost');
      done();
    });
    
    // Close the server when Fastify shuts down
    fastify.addHook('onClose', (_, done) => {
      server.close(done);
    });
  }
  
  // Register routes
  fastify.register(notificationRoutes, { prefix: '/notifications' });
};

export default notificationsPlugin;

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all notifications for the current user
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          read: { type: 'boolean' },
          type: { type: 'string' },
          documentId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              message: { type: 'string' },
              documentId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              read: { type: 'boolean' },
              metadata: { type: 'object' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: { read?: boolean; type?: string; documentId?: string } }>, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    const notifications = await fastify.notificationService.getNotifications({
      userId,
      read: request.query.read,
      type: request.query.type as any,
      documentId: request.query.documentId,
    });
    
    return notifications;
  });
  
  // Mark a notification as read
  fastify.patch('/:id/read', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            read: { type: 'boolean' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    const notification = await fastify.notificationService.markAsRead(
      (request.params as any).id,
      userId
    );
    
    if (!notification) {
      return reply.status(404).send({ error: 'Notification not found' });
    }
    
    return { id: notification.id, read: notification.read };
  });
  
  // Mark all notifications as read
  fastify.post('/mark-all-read', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            count: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    const count = await fastify.notificationService.markAllAsRead(userId);
    return { count };
  });
};
