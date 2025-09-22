export type NotificationType = 'DOCUMENT_UPDATED' | 'INCONSISTENCY_DETECTED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  documentId: string;
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationData {
  userId: string;
  type: NotificationType;
  message: string;
  documentId: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilter {
  userId: string;
  read?: boolean;
  type?: NotificationType;
  documentId?: string;
}

export interface INotificationService {
  createNotification(data: NotificationData): Promise<Notification>;
  getNotifications(filter: NotificationFilter): Promise<Notification[]>;
  markAsRead(notificationId: string, userId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<number>;
  subscribe(userId: string, callback: (notification: Notification) => void): () => void;
  handleDocumentUpdated(payload: any): Promise<void>;
  handleConsistencyResult(payload: any): Promise<void>;
}
