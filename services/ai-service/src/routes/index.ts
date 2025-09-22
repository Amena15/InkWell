import { 
  FastifyInstance, 
  FastifyReply, 
  FastifyRequest, 
  FastifyPluginAsync, 
  RouteHandlerMethod,
  RouteShorthandOptions
} from 'fastify';
import { aiService } from '../services/ai.service';

// Import type declarations
import '../types/fastify.d';

// Type definitions for request bodies
type GenerateDocumentBody = {
  requirements: string;
  type?: 'srs' | 'sds';
};

type CheckConsistencyBody = {
  code: string;
  documentation: string;
};

// Define route handler types with proper Fastify types
type FastifyRequestWithBody<T> = FastifyRequest<{ Body: T }>;
type FastifyHandler<T> = (request: FastifyRequestWithBody<T>, reply: FastifyReply) => Promise<unknown>;

// Define route handlers with proper types
const healthCheck: RouteHandlerMethod = async (_request, reply) => {
  return { status: 'ok', service: 'ai-service' };
};

const generateDocument: RouteHandlerMethod = async (request, reply) => {
  const { requirements, type = 'srs' } = request.body as GenerateDocumentBody;

  try {
    const document = await aiService.generateDocument(requirements, type);
    return { success: true, document };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    request.log?.error?.(`Document generation failed: ${errorMessage}`);
    reply.status(500);
    return { 
      error: 'Failed to generate document', 
      details: errorMessage 
    };
  }
};

const checkConsistency: RouteHandlerMethod = async (request, reply) => {
  const { code, documentation } = request.body as CheckConsistencyBody;

  try {
    const result = await aiService.checkConsistency(code, documentation);
    return { success: true, ...result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    request.log?.error?.(`Consistency check failed: ${errorMessage}`);
    reply.status(500);
    return { 
      error: 'Failed to check consistency', 
      details: errorMessage 
    };
  }
};

// Define routes with proper typing
export const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get('/health', healthCheck);

  // Generate SRS/SDS document
  fastify.post<{ Body: GenerateDocumentBody }>(
    '/ai/generate',
    {
      schema: {
        body: {
          type: 'object',
          required: ['requirements'],
          properties: {
            requirements: { type: 'string' },
            type: { type: 'string', enum: ['srs', 'sds'] }
          }
        }
      }
    },
    generateDocument as RouteHandlerMethod
  );

  // Check consistency between code and documentation
  fastify.post<{ Body: CheckConsistencyBody }>(
    '/ai/check-consistency',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code', 'documentation'],
          properties: {
            code: { type: 'string' },
            documentation: { type: 'string' }
          }
        }
      }
    },
    checkConsistency as RouteHandlerMethod
  );
};

export default routes;
