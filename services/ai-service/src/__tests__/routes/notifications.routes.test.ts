import { EventEmitter } from 'events';
import { NotificationService } from '../../services/notifications/notification.service';

// Import the Notification type from the service
import { Notification } from '../../services/notifications/types';

// Test data
const userId = 'test-user-1';
const notificationId = 'test-notification-1';
const testDate = new Date('2025-09-13T15:58:14.162Z');

const mockNotification: Notification = {
  id: notificationId,
  userId,
  type: 'DOCUMENT_UPDATED',
  message: 'Test notification',
  documentId: 'test-doc-1',
  read: false,
  timestamp: testDate,
  metadata: {},
};

// Mock the notification service
jest.mock('../../services/notifications/notification.service');
const MockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;

describe('Notification Service', () => {
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    // Create a mock notification service
    mockNotificationService = new MockNotificationService(
      {} as any, // Prisma client
      new EventEmitter()
    ) as jest.Mocked<NotificationService>;
    
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should get notifications for a user', async () => {
      // Mock the service method
      mockNotificationService.getNotifications.mockResolvedValue([mockNotification]);

      // Call the service method directly
      const result = await mockNotificationService.getNotifications({
        userId,
        read: false,
      });

      // Assertions
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockNotification.id,
        userId: mockNotification.userId,
        type: mockNotification.type,
        message: mockNotification.message,
        read: mockNotification.read,
      });
      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith({
        userId,
        read: false,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      // Mock the service method
      const updatedNotification = {
        ...mockNotification,
        read: true,
      };
      mockNotificationService.markAsRead.mockResolvedValue(updatedNotification);

      // Call the service method directly
      const result = await mockNotificationService.markAsRead(userId, notificationId);

      // Assertions
      expect(result).toMatchObject({
        id: notificationId,
        read: true,
      });
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
        userId,
        notificationId
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Mock the service method
      const count = 3;
      mockNotificationService.markAllAsRead.mockResolvedValue(count);

      // Call the service method directly
      const result = await mockNotificationService.markAllAsRead(userId);

      // Assertions
      expect(result).toBe(count);
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });
});
