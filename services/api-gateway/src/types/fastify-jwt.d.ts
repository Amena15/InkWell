import { FastifyJWT } from '@fastify/jwt';
import { JwtUserPayload } from './fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}
