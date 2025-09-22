# AI Service

This service provides AI-powered document generation and code-documentation consistency checking.

## Features

- **Document Generation**: Generate SRS (Software Requirements Specification) and SDS (Software Design Specification) documents from requirements.
- **Consistency Checking**: Check the consistency between code and documentation using semantic similarity.
- **Event-Driven**: Listens for document update events and automatically performs consistency checks.

## Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key
- RabbitMQ (for event handling)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3002
   OPENAI_API_KEY=your_openai_api_key
   RABBITMQ_URL=amqp://localhost:5672
   RABBITMQ_EXCHANGE=document_events
   ```

3. Start the service:
   ```bash
   npm run dev
   ```

## API Endpoints

### Generate Document

```
POST /ai/generate
```

**Request Body:**
```json
{
  "requirements": "Your requirements here",
  "type": "srs" // or "sds"
}
```

**Response:**
```json
{
  "success": true,
  "document": "Generated document content..."
}
```

### Check Consistency

```
POST /ai/check-consistency
```

**Request Body:**
```json
{
  "code": "function test() { return 1; }",
  "documentation": "This function returns 1."
}
```

**Response:**
```json
{
  "success": true,
  "isConsistent": true,
  "confidence": 0.95,
  "mismatches": []
}
```

## Event Handling

The service listens for `document.updated` events on the RabbitMQ exchange and publishes `consistency.checked` events with the results.

### Event: document.updated
```json
{
  "documentId": "doc-123",
  "content": "Document content",
  "codeSnippets": [
    {"id": "snippet-1", "code": "function test() { return 1; }"}
  ]
}
```

### Event: consistency.checked
```json
{
  "documentId": "doc-123",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "results": [
    {
      "codeSnippetId": "snippet-1",
      "isConsistent": true,
      "confidence": 0.95,
      "mismatches": []
    }
  ]
}
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Node environment | `development` |
| PORT | Server port | `3002` |
| OPENAI_API_KEY | OpenAI API key | - |
| OPENAI_MODEL | OpenAI model to use | `gpt-4` |
| RABBITMQ_URL | RabbitMQ connection URL | `amqp://localhost:5672` |
| RABBITMQ_EXCHANGE | RabbitMQ exchange name | `document_events` |
| SIMILARITY_THRESHOLD | Minimum similarity score for consistency | `0.75` |
