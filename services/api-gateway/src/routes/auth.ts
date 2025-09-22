import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { JwtUserPayload, UserRole } from '../types/fastify';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtUserPayload;
  }
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login endpoint
  fastify.post<{ Body: { email: string; password: string } }>(
    '/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      
      // In a real app, validate credentials against a database
      const user: JwtUserPayload = { 
        id: 'test-user', 
        email,
        roles: ['user'] as UserRole[],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      };

      const token = fastify.jwt.sign(user);
      return { 
        token,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles
        }
      };
    }
  );

  // Registration endpoint
  fastify.post<{ Body: { email: string; password: string; name?: string } }>(
    '/auth/register',
    async (request, reply) => {
      const { email, password, name } = request.body;
      
      // In a real app, create a new user in the database
      const newUser: JwtUserPayload = {
        id: 'new-user-id',
        email,
        roles: ['user'] as UserRole[],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      };

      const token = fastify.jwt.sign(newUser);
      
      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          roles: newUser.roles
        }
      };
    }
  );

  // Get current user endpoint
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate]
    },
    async (request) => {
      return {
        id: request.user.id,
        email: request.user.email,
        roles: request.user.roles
      };
    }
  );

  // Logout endpoint (client-side should remove the token)
  fastify.post('/logout', async (request, reply) => {
    return { success: true, message: 'Successfully logged out' };
  });
};

export default fp(authRoutes, {
  name: 'auth-routes',
  dependencies: ['@fastify/jwt']
});