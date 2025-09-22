import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Simple in-memory notification store
const notifications = new Map<string, any[]>();

const notificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Subscribe to notifications
  fastify.post('/subscribe', async (request: any, reply) => {
    const { userId } = request.body as { userId: string };
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    return { success: true, message: 'Subscribed to notifications' };
  });

  // Get notifications for a user
  fastify.get('/:userId', async (request: any, reply) => {
    const { userId } = request.params;
    return {
      userId,
      notifications: notifications.get(userId) || []
    };
  });

  // Send notification (protected admin endpoint)
  fastify.post('/send', async (request: any, reply) => {
    const { userId, message } = request.body as { userId: string; message: string };
    const userNotifications = notifications.get(userId) || [];
    const notification = {
      id: `notif_${Date.now()}`,
      message,
      timestamp: new Date().toISOString()
    };
    userNotifications.push(notification);
    notifications.set(userId, userNotifications);
    
    return { success: true, notification };
  });
};

export default fp(notificationRoutes);
