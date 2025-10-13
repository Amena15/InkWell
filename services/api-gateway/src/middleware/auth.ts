import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JwtUserPayload } from '../types/fastify';

// Import JWT types from fastify-jwt
import { JWT } from '@fastify/jwt';

// Create a type for the Fastify instance with JWT
type FastifyInstanceWithJWT = FastifyInstance & {
  jwt: JWT;
};

const authMiddleware: FastifyPluginAsync = async (fastify: FastifyInstanceWithJWT) => {
  // Public routes that don't require authentication
  const publicRoutes = [
    { path: '/', methods: ['GET'] },
    { path: '/health', methods: ['GET'] },
    { path: '/auth/login', methods: ['POST'] },
    { path: '/auth/register', methods: ['POST'] },
    { path: '/docs', methods: ['GET'] },
    { path: '/docs/json', methods: ['GET'] },
    // Notification endpoints
    { path: '/notifications/subscribe', methods: ['POST'] },
    { path: '/notifications/send', methods: ['POST'] },
    { path: '/notifications', methods: ['GET'] },
  ];

  // Routes that require specific roles
  const roleBasedRoutes = [
    { path: '/metrics', roles: ['admin', 'service'] as const },
    { path: '/admin', roles: ['admin'] as const },
  ];

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const { method, url } = request;
    const path = url.split('?')[0]; // Remove query parameters

    // Check if route is public
    const isPublicRoute = publicRoutes.some(
      route => path.startsWith(route.path) && route.methods.includes(method as any)
    );

    if (isPublicRoute) {
      return;
    }

    // Validate Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        statusCode: 401,
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    // Verify JWT token
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await fastify.jwt.verify<JwtUserPayload>(token);

      // Attach user to request with default roles if not provided
      const userRoles = decoded.roles || ['user'];
      (request as any).user = {
        id: decoded.id,
        email: decoded.email,
        roles: userRoles,
        iat: decoded.iat,
        exp: decoded.exp
      };

      // Check role-based access
      const routeRequiresAuth = roleBasedRoutes.find(route => path.startsWith(route.path));
      if (routeRequiresAuth) {
        const hasRequiredRole = routeRequiresAuth.roles.some(role => 
          userRoles.includes(role)
        );
        
        if (!hasRequiredRole) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Insufficient permissions to access this resource'
          });
        }
      }

    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      return reply.status(statusCode).send({
        statusCode,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

export default fp(authMiddleware, {
  name: 'auth-middleware',
  decorators: {
    fastify: ['jwt']
  },
  dependencies: ['@fastify/jwt']
});