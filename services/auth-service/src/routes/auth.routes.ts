import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@fastify/type-provider-typebox';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

// Define schemas using TypeBox
const refreshTokenSchema = Type.Object({
  refreshToken: Type.String()
});

const registerSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  name: Type.Optional(Type.String())
});

const loginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
});

const authResponseSchema = {
  200: Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String()
  }),
  400: Type.Object({
    error: Type.String()
  }),
  401: Type.Object({
    error: Type.String()
  }),
  500: Type.Object({
    error: Type.String()
  })
};

const userSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  name: Type.Optional(Type.String()),
  role: Type.String(),
  isActive: Type.Boolean(),
  lastLogin: Type.Optional(Type.String({ format: 'date-time' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

const tokensSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String()
});

const loginResponseSchema = {
  200: Type.Object({
    user: userSchema,
    tokens: tokensSchema
  }),
  400: Type.Object({ error: Type.String() }),
  401: Type.Object({ error: Type.String() }),
  500: Type.Object({ error: Type.String() })
};

const registerResponseSchema = {
  201: Type.Object({
    user: Type.Object({
      id: Type.String(),
      email: Type.String({ format: 'email' }),
      name: Type.Optional(Type.String()),
      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' })
    }),
    tokens: tokensSchema
  }),
  400: Type.Object({ error: Type.String() }),
  500: Type.Object({ error: Type.String() })
};

const logoutResponseSchema = {
  200: Type.Object({ success: Type.Boolean() }),
  401: Type.Object({ error: Type.String() }),
  500: Type.Object({ error: Type.String() })
};


export async function authRoutes(fastify: FastifyInstance) {
  // Register a new user
  fastify.post('/register', {
    schema: {
      body: registerSchema,
      response: registerResponseSchema
    },
    handler: async (request, reply) => {
      try {
        const userData = registerSchema.parse(request.body);
        const user = await authService.register(userData);
        const tokens = await authService.login({
          email: userData.email,
          password: userData.password,
        });
        
        return reply.status(201).send({ user, tokens });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('already exists')) {
            return reply.status(409).send({ error: error.message });
          }
          return reply.status(400).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Login user
  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: loginResponseSchema
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = loginSchema.parse(request.body);
        const tokens = await authService.login({ email, password });
        const user = await authService.getUserByEmail(email);
        
        if (!user) {
          return reply.status(401).send({ error: 'Invalid credentials' });
        }
        
        return reply.send({ 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(400).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Refresh token
  fastify.post('/refresh-token', {
    schema: {
      body: refreshTokenSchema,
      response: authResponseSchema
    },
    handler: async (request, reply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };
        const tokens = await authService.refreshToken(refreshToken);
        return reply.send(tokens);
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(401).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Logout
  fastify.post('/logout', {
    preHandler: [authenticate],
    schema: {
      body: refreshTokenSchema,
      response: logoutResponseSchema
    },
    handler: async (request: any, reply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };
        await authService.logout(refreshToken);
        return reply.send({ success: true });
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(401).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get current user profile
  fastify.get('/me', {
    preHandler: [authenticate],
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: ['string', 'null'] },
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            lastLogin: { type: ['string', 'null'] },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      
      const user = await authService.getUserProfile(userId);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send(user);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
};
