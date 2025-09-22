import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const docsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/docs', async (request, reply) => {
    return { 
      message: 'Documentation endpoint',
      availableEndpoints: [
        { method: 'GET', path: '/health', description: 'Health check endpoint' },
        { method: 'POST', path: '/auth/register', description: 'Register a new user' },
        { method: 'POST', path: '/auth/login', description: 'Login and get JWT token' },
        { method: 'GET', path: '/auth/me', description: 'Get current user info', requiresAuth: true },
        { method: 'GET', path: '/docs', description: 'API documentation' },
        { method: 'POST', path: '/ai/process', description: 'Process AI request', requiresAuth: true },
        { method: 'GET', path: '/metrics', description: 'Get application metrics', requiresAuth: true, requiresAdmin: true },
        { method: 'GET', path: '/notifications', description: 'Get notifications', requiresAuth: true },
        { method: 'POST', path: '/notifications', description: 'Send notification', requiresAuth: true }
      ]
    };
  });
};

export default fp(docsRoutes);
