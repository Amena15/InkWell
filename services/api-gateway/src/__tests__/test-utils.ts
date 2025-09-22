import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyJwt, { JWT } from '@fastify/jwt';
import authMiddleware from '../middleware/auth';
import { JwtUserPayload, UserRole } from '../types/fastify';
import { metrics } from '../routes/metrics';

// Import routes individually to avoid circular dependencies
import authRoutes from '../routes/auth';
import healthRoutes from '../routes/health';
import docsRoutes from '../routes/docs';
import metricsRoutes from '../routes/metrics';
import notificationsRoutes from '../routes/notifications';

// Extend Fastify types for testing
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    signJwt: (payload: Partial<JwtUserPayload>) => string;
    jwt: JWT;
  }
  interface FastifyRequest {
    user: JwtUserPayload;
  }
}

export const createTestServer = async () => {
  const server = fastify({
    logger: false
  });

  // Register JWT first
  await server.register(fastifyJwt, {
    secret: 'test-secret-key',
    sign: {
      expiresIn: '1h'
    },
    verify: {
      maxAge: '1h'
    }
  });

  // Add authenticate decorator
  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ 
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or missing token'
      });
    }
  });

  // Add JWT sign method to server instance
  server.decorate('signJwt', function(payload: Partial<JwtUserPayload>) {
    return this.jwt.sign({
      id: payload.id || 'test-user',
      email: payload.email || 'test@example.com',
      roles: (payload.roles || ['user']) as UserRole[],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    });
  });

  // Register other plugins
  await server.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  await server.register(helmet);

  // Register routes
  await server.register(authRoutes, { prefix: '/auth' });
  
  // Register AI routes
  server.post('/ai/process', {
    onRequest: [server.authenticate]
  }, async (request: any) => {
    const { text } = request.body;
    const requestId = `req_${Date.now()}`;
    
    // Increment metrics
    metrics.aiRequests++;
    
    return {
      result: `Processed: ${text}`,
      requestId
    };
  });

  // Register middleware with proper JWT dependency
  await server.register(authMiddleware, { 
    // @ts-ignore - Fastify types issue with plugin dependencies
    dependencies: ['@fastify/jwt'] 
  });

  // In-memory store for notifications
  const notifications = new Map<string, any[]>();

  // Register notification routes directly for testing
  server.post('/notifications/subscribe', {
    onRequest: [server.authenticate]
  }, async (request: any, reply) => {
    const { userId } = request.body as { userId: string };
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    return { success: true, message: 'Subscribed to notifications' };
  });

  server.get('/notifications/:userId', {
    onRequest: [server.authenticate]
  }, async (request: any, reply) => {
    const { userId } = request.params;
    return {
      userId,
      notifications: notifications.get(userId) || []
    };
  });

  server.post('/notifications/send', {
    onRequest: [server.authenticate]
  }, async (request: any, reply) => {
    const { userId, message } = request.body as { userId: string; message: string };
    const userNotifications = notifications.get(userId) || [];
    const notification = {
      id: `notif_${Date.now()}`,
      message,
      timestamp: new Date().toISOString()
    };
    userNotifications.push(notification);
    notifications.set(userId, userNotifications);
    return { success: true, notification };
  });

  // Add a test route that requires authentication
  server.get('/protected-route', {
    onRequest: [server.authenticate]
  }, async () => ({
    message: 'Protected route',
    timestamp: new Date().toISOString()
  }));

  await server.ready();
  return server;
};

export const createAuthenticatedRequest = async (server: FastifyInstance, userId = 'test-user') => {
  // @ts-ignore - We know this exists because we added it in createTestServer
  const token = server.signJwt({ id: userId });
  
  return {
    authorization: `Bearer ${token}`
  };
};

export const TEST_USER = {
  id: 'test-user',
  email: 'test@example.com',
  roles: ['user'] as string[]
};

export const TEST_ADMIN = {
  id: 'test-admin',
  email: 'admin@example.com',
  roles: ['admin'] as string[]
};
