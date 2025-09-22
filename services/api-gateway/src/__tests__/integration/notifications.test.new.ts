import { FastifyInstance } from 'fastify';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import { createTestServer, createAuthenticatedRequest, TEST_USER } from '../test-utils';

describe('Notifications', () => {
  let server: FastifyInstance;
  let authHeaders: Record<string, string>;

  beforeAll(async () => {
    try {
      server = await createTestServer();
      authHeaders = await createAuthenticatedRequest(server, TEST_USER.id);
      await server.ready();
    } catch (error) {
      console.error('Error setting up test server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  test('should return 200 for notifications endpoint', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/notifications',
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
  });

  test('should return 401 for unauthenticated access', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/notifications',
    });

    expect(response.statusCode).toBe(401);
  });
});
