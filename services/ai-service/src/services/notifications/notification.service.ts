import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';

type PrismaType = typeof prisma;

type PrismaClientType = typeof prisma;
import { 
  Notification, 
  NotificationData, 
  NotificationFilter, 
  INotificationService,
  NotificationType
} from './types';

type Subscription = {
  userId: string;
  callback: (notification: Notification) => void;
};

export class NotificationService implements INotificationService {
  private subscriptions: Map<string, Set<(notification: Notification) => void>> = new Map();
  private prisma: PrismaClientType;
  private eventEmitter: EventEmitter;

  constructor(prisma: PrismaClientType, eventEmitter: EventEmitter) {
    this.prisma = prisma;
    this.eventEmitter = eventEmitter;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventEmitter.on('DOC_UPDATED', this.handleDocumentUpdated.bind(this));
    this.eventEmitter.on('CONSISTENCY_RESULT', this.handleConsistencyResult.bind(this));
  }

  async createNotification(data: NotificationData): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: data.userId,
        type: data.type,
        message: data.message,
        documentId: data.documentId,
        metadata: data.metadata || {},
        read: false,
      },
    });

    // Notify subscribers
    this.notifySubscribers(notification);
    
    return notification as Notification;
  }

  async getNotifications(filter: NotificationFilter): Promise<Notification[]> {
    const where: any = { userId: filter.userId };
    
    if (filter.read !== undefined) where.read = filter.read;
    if (filter.type) where.type = filter.type;
    if (filter.documentId) where.documentId = filter.documentId;

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return notifications as Notification[];
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId, userId },
    });

    if (!notification) return null;

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated as Notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return result.count;
  }

  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    
    const userSubscriptions = this.subscriptions.get(userId)!;
    userSubscriptions.add(callback);

    // Return unsubscribe function
    return () => {
      userSubscriptions.delete(callback);
      if (userSubscriptions.size === 0) {
        this.subscriptions.delete(userId);
      }
    };
  }

  private notifySubscribers(notification: Notification) {
    const userSubscriptions = this.subscriptions.get(notification.userId);
    if (userSubscriptions) {
      userSubscriptions.forEach(callback => callback(notification));
    }
  }

  async handleDocumentUpdated(payload: any): Promise<void> {
    const { documentId, updatedBy, documentTitle = 'a document' } = payload;
    
    // In a real app, you would fetch the users who should be notified
    // For now, we'll assume the updater is the only one to notify
    const userId = updatedBy;

    await this.createNotification({
      userId,
      type: 'DOCUMENT_UPDATED',
      message: `Document "${documentTitle}" has been updated`,
      documentId,
      metadata: {
        updatedBy,
        documentTitle,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async handleConsistencyResult(payload: any): Promise<void> {
    const { documentId, isConsistent, score, documentTitle = 'a document' } = payload;
    
    if (!isConsistent) {
      // In a real app, you would fetch the document owner/editors
      // For now, we'll use a placeholder
      const userId = 'document-owner-id';

      await this.createNotification({
        userId,
        type: 'INCONSISTENCY_DETECTED',
        message: `Inconsistency detected in document "${documentTitle}"`,
        documentId,
        metadata: {
          score,
          documentTitle,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
