import { FastifyInstance } from 'fastify';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import { createTestServer, createAuthenticatedRequest } from '../test-utils';
import { metrics } from '../../routes/metrics';

describe('AI Service Integration', () => {
  let server: FastifyInstance;
  let authHeaders: Record<string, string>;

  beforeAll(async () => {
    server = await createTestServer();
    authHeaders = await createAuthenticatedRequest(server);
  });

  afterAll(async () => {
    await server.close();
  });

  test('should process AI request and update metrics', async () => {
    const initialAiRequests = metrics.aiRequests;
    
    const response = await server.inject({
      method: 'POST',
      url: '/ai/process',
      headers: authHeaders,
      payload: {
        text: 'Test input',
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data).toHaveProperty('result');
    expect(data).toHaveProperty('requestId');
    
    // Verify metrics were updated
    expect(metrics.aiRequests).toBe(initialAiRequests + 1);
  });

  test('should require authentication for AI endpoints', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/ai/process',
      payload: {
        text: 'Test input',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
