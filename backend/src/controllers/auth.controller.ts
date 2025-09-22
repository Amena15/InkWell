import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: FastifyRequest<{ Body: { email: string; password: string; name: string } }>, reply: FastifyReply) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return reply.status(400).send({ errors: result.error.issues });
      }

      const { email, password, name } = result.data;
      const { user, token } = await authService.register(email, password, name);
      
      return reply.status(201).send({ user, token });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async login(req: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return reply.status(400).send({ errors: result.error.issues });
      }

      const { email, password } = result.data;
      const { user, token } = await authService.login(email, password);
      
      return reply.send({ user, token });
    } catch (error: any) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
  }

  async me(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({ user });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
