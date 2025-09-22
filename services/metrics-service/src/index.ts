import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(helmet);
fastify.register(sensible);
fastify.register(cors, {
  origin: true
});

// Health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'metrics-service' };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3004;
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`Metrics service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

