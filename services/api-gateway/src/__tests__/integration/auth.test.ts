import { FastifyInstance } from 'fastify';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import { createTestServer, createAuthenticatedRequest, TEST_USER } from '../test-utils';

describe('Authentication', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    try {
      server = await createTestServer();
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

  test('should return 401 for unauthorized access to protected route', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/metrics', // This is a protected route
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Unauthorized');
    expect(body).toHaveProperty('message');
  });

  test('should allow access with valid token', async () => {
    const headers = await createAuthenticatedRequest(server, TEST_USER.id);
    
    const response = await server.inject({
      method: 'GET',
      url: '/me',
      headers,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data).toHaveProperty('id', TEST_USER.id);
    expect(data).toHaveProperty('email', TEST_USER.email);
    expect(data).toHaveProperty('roles');
  });

  test('should reject invalid token', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/me',
      headers: {
        'authorization': 'Bearer invalid-token'
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Unauthorized');
    expect(body).toHaveProperty('message');
  });
});
