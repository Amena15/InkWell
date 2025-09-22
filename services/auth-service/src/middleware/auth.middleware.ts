import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: string;
    };
  }
}

// Authentication middleware function
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
    
    request.user = {
      id: decoded.userId,
      role: decoded.role || 'USER',
    };
    return;
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return reply.status(401).send({ error: 'Token expired' });
      }
      return reply.status(401).send({ error: 'Invalid token' });
    }
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const authorize = (roles: string[]) => {
  return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    if (!request.user) {
      reply.status(401).send({ error: 'Unauthorized' });
      return done();
    }
    
    if (!roles.includes(request.user.role)) {
      reply.status(403).send({ error: 'Forbidden' });
      return done();
    }
    
    done();
  };
};

// Plugin to add auth methods to fastify instance
export const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Add authenticate method to fastify instance
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
  });
  
  // Add authorize method to fastify instance
  fastify.decorate('authorize', (roles: string[]) => {
    return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
      if (!request.user) {
        reply.status(401).send({ error: 'Unauthorized' });
        return done();
      }
      
      if (!roles.includes(request.user.role)) {
        reply.status(403).send({ error: 'Forbidden' });
        return done();
      }
      
      done();
    };
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply, done: () => void) => void;
  }
}
