import prisma from '../../lib/prisma';
import { EventEmitter } from 'events';
import { NotificationService } from '../../services/notifications/notification.service';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { NotificationType } from '../../services/notifications/types';

// Mock Prisma client with notification methods
const prismaMock = mockDeep<typeof prisma>({
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
});
const eventEmitter = new EventEmitter();

// Mock the Prisma client methods
const mockNotification = {
  id: 'test-notification-1',
  userId: 'user-1',
  type: 'DOCUMENT_UPDATED' as NotificationType,
  message: 'Test notification',
  documentId: 'doc-1',
  read: false,
  timestamp: new Date(),
  metadata: {},
};

describe('NotificationService', () => {
  let notificationService: NotificationService;
  
  beforeEach(() => {
    mockReset(prismaMock);
    notificationService = new NotificationService(prismaMock as any, eventEmitter);
    
    // Setup default mocks
    prismaMock.notification.create.mockResolvedValue(mockNotification);
    prismaMock.notification.findMany.mockResolvedValue([mockNotification]);
    prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
    prismaMock.notification.update.mockResolvedValue({ ...mockNotification, read: true });
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 } as any);
  });
  
  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: 'user-1',
        type: 'DOCUMENT_UPDATED' as NotificationType,
        message: 'Document updated',
        documentId: 'doc-1',
      };
      
      const result = await notificationService.createNotification(notificationData);
      
      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          userId: notificationData.userId,
          type: notificationData.type,
          message: notificationData.message,
          documentId: notificationData.documentId,
          metadata: {},
          read: false,
        },
      });
      expect(result).toEqual(mockNotification);
    });
  });
  
  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      const filter = {
        userId: 'user-1',
        read: false,
      };
      
      const result = await notificationService.getNotifications(filter);
      
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: filter.userId,
          read: filter.read,
        },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual([mockNotification]);
    });
  });
  
  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await notificationService.markAsRead('test-notification-1', 'user-1');
      
      expect(prismaMock.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-notification-1', userId: 'user-1' },
      });
      
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 'test-notification-1' },
        data: { read: true },
      });
      
      expect(result).toEqual({ ...mockNotification, read: true });
    });
    
    it('should return null if notification not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);
      
      const result = await notificationService.markAsRead('non-existent', 'user-1');
      
      expect(result).toBeNull();
      expect(prismaMock.notification.update).not.toHaveBeenCalled();
    });
  });
  
  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const result = await notificationService.markAllAsRead('user-1');
      
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });
      
      expect(result).toBe(1);
    });
  });
  
  describe('event handlers', () => {
    it('should handle DOC_UPDATED event', async () => {
      const createSpy = jest.spyOn(notificationService, 'createNotification');
      const payload = {
        documentId: 'doc-1',
        updatedBy: 'user-1',
        documentTitle: 'Test Document',
      };
      
      eventEmitter.emit('DOC_UPDATED', payload);
      
      // Give the event loop a chance to process the event
      await new Promise(process.nextTick);
      
      expect(createSpy).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'DOCUMENT_UPDATED',
        message: 'Document "Test Document" has been updated',
        documentId: 'doc-1',
        metadata: {
          updatedBy: 'user-1',
          documentTitle: 'Test Document',
          timestamp: expect.any(String),
        },
      });
    });
    
    it('should handle CONSISTENCY_RESULT event with inconsistency', async () => {
      const createSpy = jest.spyOn(notificationService, 'createNotification');
      const payload = {
        documentId: 'doc-1',
        isConsistent: false,
        score: 0.6,
        documentTitle: 'Test Document',
      };
      
      eventEmitter.emit('CONSISTENCY_RESULT', payload);
      
      // Give the event loop a chance to process the event
      await new Promise(process.nextTick);
      
      expect(createSpy).toHaveBeenCalledWith({
        userId: 'document-owner-id',
        type: 'INCONSISTENCY_DETECTED',
        message: 'Inconsistency detected in document "Test Document"',
        documentId: 'doc-1',
        metadata: {
          score: 0.6,
          documentTitle: 'Test Document',
          timestamp: expect.any(String),
        },
      });
    });
    
    it('should not create notification for consistent result', async () => {
      const createSpy = jest.spyOn(notificationService, 'createNotification');
      const payload = {
        documentId: 'doc-1',
        isConsistent: true,
        score: 0.9,
        documentTitle: 'Test Document',
      };
      
      eventEmitter.emit('CONSISTENCY_RESULT', payload);
      
      // Give the event loop a chance to process the event
      await new Promise(process.nextTick);
      
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('subscriptions', () => {
    it('should notify subscribers when a new notification is created', async () => {
      const callback = jest.fn();
      const unsubscribe = notificationService.subscribe('user-1', callback);
      
      // Create a notification
      await notificationService.createNotification({
        userId: 'user-1',
        type: 'DOCUMENT_UPDATED',
        message: 'Test',
        documentId: 'doc-1',
      });
      
      expect(callback).toHaveBeenCalledWith(mockNotification);
      
      // Cleanup
      unsubscribe();
    });
    
    it('should allow unsubscribing', async () => {
      const callback = jest.fn();
      const unsubscribe = notificationService.subscribe('user-1', callback);
      
      // Unsubscribe
      unsubscribe();
      
      // Create a notification
      await notificationService.createNotification({
        userId: 'user-1',
        type: 'DOCUMENT_UPDATED',
        message: 'Test',
        documentId: 'doc-1',
      });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
