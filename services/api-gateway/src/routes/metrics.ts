import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Simple in-memory metrics store
const metrics = {
  requests: 0,
  aiRequests: 0,
  lastUpdated: new Date().toISOString()
};

const metricsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/metrics', async (request, reply) => {
    return {
      ...metrics,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  });
};

// Export metrics for other routes to update
export { metrics };
export default fp(metricsRoutes);
