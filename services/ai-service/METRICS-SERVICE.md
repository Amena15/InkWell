# Metrics Service

The Metrics Service is responsible for tracking and managing document-related metrics such as coverage percentage, consistency scores, and check results. It provides endpoints to retrieve and manage these metrics and integrates with the AI service to update metrics based on consistency checks.

## Features

- Track document coverage percentage
- Monitor consistency scores
- Record total and passing consistency checks
- Event-driven updates via CONSISTENCY_RESULT events
- RESTful API for metric management

## API Endpoints

### GET /metrics/:docId

Retrieves metrics for a specific document.

**Parameters:**
- `docId` (path, required): The ID of the document

**Response:**
```json
{
  "id": "string",
  "documentId": "string",
  "coveragePercent": 85.5,
  "consistencyScore": 0.9,
  "lastUpdated": "2023-06-01T12:00:00.000Z",
  "totalChecks": 10,
  "passingChecks": 9
}
```

### DELETE /metrics/:docId

Resets metrics for a specific document.

**Parameters:**
- `docId` (path, required): The ID of the document

**Response:**
- 204 No Content on success

## Event Integration

The Metrics Service listens for `CONSISTENCY_RESULT` events with the following payload:

```typescript
{
  documentId: string;      // ID of the document
  isConsistent: boolean;   // Whether the check passed
  score: number;           // Consistency score (0-1)
  codeSnippetId?: string;  // Optional ID of the code snippet
}
```

## Database Schema

The service uses the following Prisma schema:

```prisma
model Metrics {
  id               String   @id @default(cuid())
  documentId       String   @unique
  coveragePercent  Float    @default(0)
  consistencyScore Float    @default(0)
  lastUpdated      DateTime @default(now())
  totalChecks      Int      @default(0)
  passingChecks    Int      @default(0)

  @@map("metrics")
}
```

## Running Tests

```bash
npm test
```

## Test Coverage

To generate a test coverage report:

```bash
npm run test:coverage
```

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_metrics?schema=public"
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT
