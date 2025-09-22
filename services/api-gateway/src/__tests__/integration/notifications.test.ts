import { FastifyInstance } from 'fastify';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import { createTestServer, createAuthenticatedRequest, TEST_USER } from '../test-utils';

describe('Notifications API', () => {
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

  test('should allow subscribing to notifications', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/notifications/subscribe',
      headers: authHeaders,
      payload: {
        userId: TEST_USER.id,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('message', 'Subscribed to notifications');
  });

  test('should send and receive notifications', async () => {
    // First subscribe
    await server.inject({
      method: 'POST',
      url: '/notifications/subscribe',
      headers: authHeaders,
      payload: {
        userId: TEST_USER.id,
      },
    });

    // Send notification
    const testMessage = 'Test notification';
    const sendResponse = await server.inject({
      method: 'POST',
      url: '/notifications/send',
      headers: authHeaders,
      payload: {
        userId: TEST_USER.id,
        message: testMessage,
      },
    });

    expect(sendResponse.statusCode).toBe(200);
    const { notification } = JSON.parse(sendResponse.body);
    expect(notification).toHaveProperty('id');
    expect(notification).toHaveProperty('message', testMessage);

    // Get notifications
    const getResponse = await server.inject({
      method: 'GET',
      url: `/notifications/${TEST_USER.id}`,
      headers: authHeaders,
    });

    expect(getResponse.statusCode).toBe(200);
    const { notifications } = JSON.parse(getResponse.body);
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('id');
    expect(notifications[0]).toHaveProperty('message');
  });

  test('should require authentication for notification endpoints', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/notifications/subscribe',
      payload: {
        userId: 'another-user',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
