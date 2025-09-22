import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from '../auth/auth.service';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    routerPath: string;
    user?: {
      userId: string;
      email: string;
    };
  }
}

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export const authMiddleware: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for public routes
    const publicRoutes = ['/health', '/auth/login', '/auth/register'];
    if (publicRoutes.includes(request.routerPath)) {
      return;
    }

    // Verify token for protected routes
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }
      
      const decoded = await authService.validateToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Attach user to request
      request.user = {
        userId: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};

// For routes that require specific roles
export const roleMiddleware = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // This is a simplified example - you should implement your role checking logic here
    // For example, fetch the user's roles from the database and check if they have the required role
    
    // Example:
    // const userRoles = await getUserRoles(request.user.userId);
    // const hasRole = roles.some(role => userRoles.includes(role));
    // if (!hasRole) {
    //   return reply.status(403).send({ error: 'Insufficient permissions' });
    // }
  };
};
