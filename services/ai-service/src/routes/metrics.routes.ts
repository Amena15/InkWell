import { FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginAsync } from 'fastify';
import { MetricsService } from '../services/metrics/metrics.service';

declare module 'fastify' {
  interface FastifyInstance {
    metricsService: MetricsService;
  }
}

// Export as default with proper type
export default async function metricsRoutes(fastify: FastifyInstance) {
  // Get metrics for a document
  fastify.get<{ Params: { docId: string } }>(
    '/metrics/:docId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['docId'],
          properties: {
            docId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              documentId: { type: 'string' },
              coveragePercent: { type: 'number' },
              consistencyScore: { type: 'number' },
              lastUpdated: { type: 'string', format: 'date-time' },
              totalChecks: { type: 'number' },
              passingChecks: { type: 'number' },
            },
          },
          404: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { docId: string } }>, reply: FastifyReply) => {
      const { docId } = request.params;
      const metrics = await fastify.metricsService.getMetrics(docId);

      if (!metrics) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Metrics not found for this document',
        });
      }

      return metrics;
    }
  );

  // Reset metrics for a document (for testing purposes)
  fastify.delete<{ Params: { docId: string } }>(
    '/metrics/:docId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['docId'],
          properties: {
            docId: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { docId: string } }>, reply: FastifyReply) => {
      const { docId } = request.params;
      await fastify.metricsService.resetMetrics(docId);
      reply.status(204).send();
    }
  );
}
