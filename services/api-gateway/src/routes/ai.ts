import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { metrics } from './metrics';

const aiRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/process', async (request, reply) => {
    // Update metrics
    metrics.aiRequests += 1;
    metrics.requests += 1;
    metrics.lastUpdated = new Date().toISOString();
    
    // In a real implementation, this would forward the request to the AI service
    return { 
      result: 'AI processing result',
      requestId: 'req_' + Math.random().toString(36).substr(2, 9)
    };
  });
};

export default fp(aiRoutes);
