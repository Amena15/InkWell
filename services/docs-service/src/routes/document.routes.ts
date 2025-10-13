import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { documentService } from '../services/document.service';
import { verifyToken } from '../middleware/auth.middleware';

export async function documentRoutes(fastify: FastifyInstance) {
  // Apply authentication to all document routes
  fastify.addHook('onRequest', (request, reply, done) => {
    verifyToken(request, reply, done);
  });

  // Create a new document
  fastify.post<{ Body: { title: string; content: string; projectId: string } }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'content', 'projectId'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            projectId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id || 'test-user'; // From auth middleware
        const document = await documentService.createDocument({
          ...request.body,
          ownerId: userId,
        });
        return reply.code(201).send(document);
      } catch (error: unknown) {
        request.log.error(error);
        if (error instanceof Error) {
          return reply.code(500).send({ error: 'Failed to create document' });
        }
        return reply.code(500).send({ error: 'Unknown error' });
      }
    }
  );

  // Get a document by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user?.id || 'test-user';
        const document = await documentService.getDocumentById(id, userId);
        
        if (!document) {
          return reply.code(404).send({ error: 'Document not found' });
        }
        
        return reply.send(document);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to get document' });
      }
    }
  );

  // Update a document
  fastify.put<{ 
    Params: { id: string };
    Body: { title?: string; content?: string } 
  }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user?.id || 'test-user';
        
        const updatedDocument = await documentService.updateDocument(
          id,
          userId,
          request.body
        );
        
        return reply.send(updatedDocument);
      } catch (error: unknown) {
        request.log.error(error);
        if (error instanceof Error) {
          if (error.message === 'Document not found or access denied') {
            return reply.code(404).send({ error: error.message });
          }
          return reply.code(500).send({ error: 'Failed to update document', details: error.message });
        }
        return reply.code(500).send({ error: 'An unknown error occurred' });
      }
    }
  );

  // Delete a document
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.user?.id || 'test-user';
        
        const success = await documentService.deleteDocument(id, userId);
        
        if (!success) {
          return reply.code(404).send({ error: 'Document not found' });
        }
        
        return reply.code(204).send();
      } catch (error: unknown) {
        request.log.error(error);
        if (error instanceof Error) {
          return reply.code(500).send({ 
            error: 'Failed to delete document',
            details: error.message 
          });
        }
        return reply.code(500).send({ error: 'An unknown error occurred' });
      }
    }
  );

  // List documents for a project
  fastify.get<{ Querystring: { projectId: string } }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['projectId'],
          properties: {
            projectId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { projectId } = request.query;
        const userId = request.user?.id || 'test-user';
        
        const documents = await documentService.listDocuments(projectId, userId);
        return reply.send(documents);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to list documents' });
      }
    }
  );
}
