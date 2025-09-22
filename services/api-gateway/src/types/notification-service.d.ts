import { FastifyInstance } from 'fastify';

declare module '../../services/notification-service' {
  interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
  }

  interface NotificationService {
    subscribe(userId: string): Promise<boolean>;
    send(userId: string, message: string): Promise<Notification>;
    getUserNotifications(userId: string): Promise<Notification[]>;
  }

  const notificationService: NotificationService;
  export { notificationService };
}
