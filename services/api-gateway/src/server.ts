import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import authMiddleware from './middleware/auth';
import routes from './routes';
import authRoutes from './routes/auth';
import { JwtUserPayload } from './types/fastify';

// Type augmentation is now in types/fastify.d.ts

const server: FastifyInstance = fastify({
  logger: true,
});

// Register plugins
server.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return cb(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'set-cookie'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
});
server.register(helmet);

// Configure JWT
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  sign: {
    expiresIn: '1h'
  },
  verify: {
    maxAge: '1h'
  }
});

// Authentication decorator
server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or missing token'
    });
  }
});

// Register middleware and routes in the correct order
const registerRoutes = async () => {
  // Register middleware first
  await server.register(authMiddleware);
  
  // Register all routes (including auth routes which are already prefixed in routes/index.ts)
  await server.register(routes);
};

// Start server
const start = async () => {
  try {
    // Register routes before starting the server
    await registerRoutes();
    
    // Log all registered routes for debugging
    server.ready(() => {
      console.log('Registered routes:');
      console.log(server.printRoutes());
    });
    
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default server;