import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth/auth.service';
import { umlRoutes } from './routes/uml.route';
import { aiRoutes } from './routes/ai.route';

export const prisma = new PrismaClient();
const server = Fastify({
  logger: {
    level: 'info',
  },
});

// Register plugins
server.register(fastifyCors, {
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

server.register(fastifyHelmet);

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'InkWell AI API',
      description: 'API documentation for InkWell AI',
      version: '1.0.0',
    },
    tags: [
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'documents', description: 'Document management' },
      { name: 'projects', description: 'Project management' },
      { name: 'organizations', description: 'Organization management' },
    ],
  },
});

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
});

// Initialize controllers
const authService = new AuthService(prisma);
const authController = new AuthController(authService);

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root endpoint
server.get('/', async () => {
  return { 
    message: 'Welcome to InkWell AI API',
    docs: '/docs',
    status: 'operational',
    timestamp: new Date().toISOString()
  };
});

// Auth routes
server.post('/api/auth/register', authController.register.bind(authController));
server.post('/api/auth/login', authController.login.bind(authController));
server.get('/api/auth/me', { preHandler: [] }, authController.me.bind(authController));

// Example protected route
server.get<{ Querystring: { name?: string } }>(
  '/api/hello',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    const { name = 'world' } = request.query;
    return { message: `Hello ${name}!` };
  },
);

// Register UML generation routes
umlRoutes(server);

// Register AI analysis routes
aiRoutes(server);

// Error handling
server.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
      validation: error.validation,
    });
  }

  reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
});

// Graceful shutdown
const start = async () => {
  try {
    await server.ready();
    await server.listen({ port: Number(config.PORT), host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${config.PORT}`);
    console.log(`API documentation available at http://localhost:${config.PORT}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
