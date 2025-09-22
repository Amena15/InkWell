import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.register(import('./health'), { prefix: '/health' });

  // Auth routes
  fastify.register(import('./auth'), { prefix: '/auth' });

  // Protected routes
  fastify.register(import('./docs'), { prefix: '/docs' });
  fastify.register(import('./ai'), { prefix: '/ai' });
  fastify.register(import('./metrics'), { prefix: '/metrics' });
  fastify.register(import('./notifications'), { prefix: '/notifications' });
};

export default fp(routes);