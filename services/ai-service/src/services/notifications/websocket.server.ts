import { WebSocket, Server } from 'ws';
import { NotificationService } from './notification.service';
import { Notification } from './types';

type WebSocketWithUserId = WebSocket & { userId: string };

export class WebSocketServer {
  private wss: Server;
  private notificationService: NotificationService;
  private unsubscribeCallbacks: Map<string, () => void> = new Map();

  constructor(server: any, notificationService: NotificationService, wss?: Server) {
    this.notificationService = notificationService;
    
    if (wss) {
      this.wss = wss;
    } else {
      this.wss = new Server({ server, path: '/ws/notifications' });
    }
    
    this.wss.on('connection', (ws: WebSocketWithUserId, request) => {
      // Extract user ID from URL path or query params
      const url = request.url || '';
      let userId: string | null = null;
      
      // Try to get user ID from URL path first (format: /userId)
      const pathMatch = url.match(/^\/([^/\s?]+)/);
      if (pathMatch) {
        userId = pathMatch[1];
      } else {
        // Fall back to query parameter
        try {
          const urlObj = new URL(url, `http://${request.headers.host}`);
          userId = urlObj.searchParams.get('userId');
        } catch (e) {
          // Invalid URL format
          ws.close(4000, 'Invalid URL format');
          return;
        }
      }
      
      if (!userId) {
        ws.close(4000, 'User ID is required');
        return;
      }
      
      // Ensure userId is treated as string after null check
      const userIdString = userId as string;
      
      // Store userId in the websocket connection
      (ws as WebSocketWithUserId).userId = userIdString;
      
      // Subscribe to notifications for this user
      const unsubscribe = this.notificationService.subscribe(
        userIdString,
        (notification) => this.sendNotification(ws, notification)
      );
      
      // Store unsubscribe callback
      this.unsubscribeCallbacks.set(userIdString, unsubscribe);
      
      // Send initial unread notifications
      this.sendInitialNotifications(ws, userIdString);
      
      ws.on('close', () => {
        const unsubscribe = this.unsubscribeCallbacks.get(userIdString);
        if (unsubscribe) {
          unsubscribe();
          this.unsubscribeCallbacks.delete(userIdString);
        }
      });
      
      ws.on('error', console.error);
    });
  }

  private async sendInitialNotifications(ws: WebSocket, userId: string) {
    try {
      const notifications = await this.notificationService.getNotifications({
        userId,
        read: false,
      });
      
      // Send initial notifications if any
      if (notifications && Array.isArray(notifications)) {
        notifications.forEach(notification => {
          this.sendNotification(ws, notification);
        });
      } else {
        // Send an empty array if no notifications
        this.sendNotification(ws, {
          type: 'INITIAL_NOTIFICATIONS',
          data: []
        } as any);
      }
    } catch (error) {
      console.error('Error sending initial notifications:', error);
      // Send error notification to client
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Failed to load initial notifications'
      }));
    }
  }

  private sendNotification(ws: WebSocket, notification: Notification) {
    // Get WebSocket constants from the global scope to ensure compatibility with our test mocks
    const WS_OPEN = (global as any).WebSocket?.OPEN ?? WebSocket.OPEN;
    
    console.log('sendNotification called with:', { 
      wsReadyState: ws.readyState, 
      WebSocketOpen: WS_OPEN,
      notificationType: notification.type,
      notificationId: notification.id,
      isOpen: ws.readyState === WS_OPEN,
      wsInstance: ws.constructor.name
    });
    
    if (ws.readyState === WS_OPEN) {
      console.log('WebSocket is OPEN, sending notification');
      const message = JSON.stringify({
        type: 'NOTIFICATION',
        data: notification,
      });
      console.log('Sending message to WebSocket:', { 
        message, 
        wsReadyState: ws.readyState,
        hasSend: typeof ws.send === 'function'
      });
      ws.send(message);
    } else {
      console.log('WebSocket is not OPEN, not sending notification');
    }
  }

  broadcastToUser(userId: string, data: any) {
    // Get WebSocket constants from the global scope to ensure compatibility with our test mocks
    const WS_OPEN = (global as any).WebSocket?.OPEN ?? WebSocket.OPEN;
    
    console.log('broadcastToUser called with:', { userId, data });
    let clientCount = 0;
    let matchingClientCount = 0;
    
    this.wss.clients.forEach(client => {
      clientCount++;
      const ws = client as WebSocketWithUserId;
      console.log(`Client ${clientCount}:`, { 
        userId: ws.userId, 
        readyState: ws.readyState,
        targetUserId: userId,
        isMatch: ws.userId === userId,
        isOpen: ws.readyState === WS_OPEN
      });
      
      if (ws.userId === userId && ws.readyState === WS_OPEN) {
        matchingClientCount++;
        const message = JSON.stringify(data);
        console.log(`Sending to client ${clientCount}:`, message);
        ws.send(message);
      }
    });
    
    console.log(`broadcastToUser completed: ${matchingClientCount} clients matched out of ${clientCount} total`);
  }

  close() {
    this.wss.close();
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks.clear();
  }
}
