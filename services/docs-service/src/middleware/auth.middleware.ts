import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import axios from 'axios';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
) {
  // Skip authentication for health check endpoint
  if (request.url === '/health') {
    return done();
  }

  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };

    // Set user in request object
    request.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Optional: Verify with auth service for additional validation
    try {
      await axios.get(`${config.authService.url}/api/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error verifying token with auth service:', error);
      // You can choose to be strict and fail here, or continue with the JWT verification
      // For now, we'll continue with JWT verification
    }

    done();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token has expired',
      });
    }
    
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

export function registerAuthHooks(fastify: FastifyInstance) {
  // Add preHandler hook to all routes except public ones
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip authentication for health check and OpenAPI docs
    if (
      request.url === '/health' ||
      request.url.startsWith('/documentation') ||
      (request.method === 'GET' && request.url === '/openapi.json')
    ) {
      return;
    }

    // For all other routes, verify the token
    return verifyToken(request, reply, (err) => {
      if (err) {
        reply.send(err);
      }
    });
  });
}
