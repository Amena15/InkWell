import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export type UserRole = 'user' | 'admin' | 'service';

export interface JwtUserPayload {
  id: string;
  email: string;
  roles?: UserRole[];
  iat?: number;
  exp?: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtUserPayload;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}
