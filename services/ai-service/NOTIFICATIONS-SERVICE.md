# Notifications Service

The Notifications Service is a real-time notification system that sends alerts to users about document updates and AI analysis results. It supports both REST API and WebSocket connections for real-time notifications.

## Features

- Real-time notifications via WebSocket
- REST API for managing notifications
- Support for different notification types (document updates, inconsistencies)
- Mark notifications as read
- Filter notifications by type, read status, and document ID
- Event-driven architecture

## API Endpoints

### GET /notifications

Retrieves notifications for the authenticated user.

**Query Parameters:**
- `read` (boolean): Filter by read status
- `type` (string): Filter by notification type
- `documentId` (string): Filter by document ID

**Response (200 OK):**
```json
[
  {
    "id": "notification-123",
    "userId": "user-456",
    "type": "DOCUMENT_UPDATED",
    "message": "Document 'Project Plan' has been updated",
    "documentId": "doc-789",
    "read": false,
    "timestamp": "2023-06-15T10:30:00Z",
    "metadata": {}
  }
]
```

### PATCH /notifications/:id/read

Marks a specific notification as read.

**Response (200 OK):**
```json
{
  "id": "notification-123",
  "read": true
}
```

### POST /notifications/mark-all-read

Marks all unread notifications as read for the authenticated user.

**Response (200 OK):**
```json
{
  "count": 3
}
```

## WebSocket API

Connect to `ws://your-server/ws/notifications?userId=USER_ID` to receive real-time notifications.

### Connection

1. **URL:** `ws://your-server/ws/notifications?userId=USER_ID`
2. **Headers:** Include any authentication headers if required

### Messages

#### Incoming Messages

When a notification is available, the server sends a message in this format:

```json
{
  "type": "NOTIFICATION",
  "data": {
    "id": "notification-123",
    "userId": "user-456",
    "type": "DOCUMENT_UPDATED",
    "message": "Document 'Project Plan' has been updated",
    "documentId": "doc-789",
    "read": false,
    "timestamp": "2023-06-15T10:30:00Z",
    "metadata": {}
  }
}
```

## Event Types

The service listens for the following events:

### DOC_UPDATED
Triggered when a document is updated.

**Payload:**
```typescript
{
  documentId: string;
  updatedBy: string;
  documentTitle?: string;
  // Any additional metadata
}
```

### CONSISTENCY_RESULT
Triggered when the AI service completes a consistency check.

**Payload:**
```typescript
{
  documentId: string;
  isConsistent: boolean;
  score: number;
  documentTitle?: string;
  // Any additional metadata
}
```

## Database Schema

```prisma
model Notification {
  id          String    @id @default(cuid())
  userId      String
  type        String    // DOCUMENT_UPDATED, INCONSISTENCY_DETECTED
  message     String
  documentId  String
  read        Boolean   @default(false)
  metadata    Json?     @default("{}")
  timestamp   DateTime  @default(now())

  @@index([userId, read])
  @@index([documentId])
  @@map("notifications")
}
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run only notification service tests
npm test -- src/__tests__/services/notification.service.test.ts

# Run only notification route tests
npm test -- src/__tests__/routes/notifications.routes.test.ts

# Run WebSocket tests
npm test -- src/__tests__/websocket/notifications.ws.test.ts
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_notifications?schema=public"
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev --name add_notifications
   ```

4. Start the service:
   ```bash
   npm run dev
   ```

## Dependencies

- Fastify - Web framework
- WebSocket - Real-time communication
- Prisma - Database ORM
- UUID - Generate unique IDs
- Jest - Testing framework
