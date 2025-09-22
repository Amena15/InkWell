import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ValidationError extends Error {
  validation?: Array<{ dataPath: string; message: string }>;
  validationContext?: string;
}

export function errorHandler(
  error: FastifyError | PrismaClientKnownRequestError | ValidationError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'A document with this title already exists in this project',
      });
    }
    
    // Handle not found errors
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested resource was not found',
      });
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
    });
  }

  // Handle validation errors
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation error',
      errors: error.validation,
    });
  }

  // Default error response
  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' 
    ? error.statusCode 
    : 500;
    
  return reply.status(statusCode).send({
    statusCode,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: error.message || 'An error occurred',
  });
}
