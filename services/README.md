# InkWell AI Microservices

This directory contains the microservices for the InkWell AI platform.

## Services

1. **API Gateway** - Entry point for all client requests
2. **Auth Service** - Handles user authentication and authorization
3. **Docs Service** - Manages document storage and retrieval
4. **AI Service** - Handles AI-related operations
5. **Metrics Service** - Collects and serves analytics
6. **Notifications Service** - Handles real-time notifications

## Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- pnpm

### Running Locally

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Access services:
   - API Gateway: http://localhost:3000
   - Auth Service: http://localhost:3001
   - Docs Service: http://localhost:3002
   - AI Service: http://localhost:3003
   - Metrics Service: http://localhost:3004
   - Notifications Service: http://localhost:3005
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - PostgreSQL: localhost:5432

## Architecture

- Each service is independent with its own database schema
- Services communicate via HTTP and message queues
- API Gateway routes requests to appropriate services
- Shared types and interfaces in the `shared` directory
