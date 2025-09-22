import { FastifyInstance } from 'fastify';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();

  async subscribe(userId: string): Promise<boolean> {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    return true;
  }

  async send(userId: string, message: string): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);

    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }
}

export const notificationService = new NotificationService();

// Register the notification service with the Fastify instance
export const registerNotificationService = (fastify: FastifyInstance) => {
  fastify.decorate('notificationService', notificationService);
};
