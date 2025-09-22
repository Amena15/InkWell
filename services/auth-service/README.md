# Auth Service

Authentication and authorization service for the InkWell AI platform.

## Features

- User registration and login with JWT
- Token refresh mechanism
- Role-based access control
- gRPC interface for token validation
- REST API for user management
- Secure password hashing with bcrypt

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token
- `GET /api/auth/me` - Get current user profile

### gRPC Service

The gRPC service runs on port 50051 by default and provides the following methods:

- `ValidateToken` - Validate a JWT token
- `GetUser` - Get user information by ID

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose (for development)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and update values)
4. Start the development environment:
   ```bash
   docker-compose up -d
   ```
5. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Running Tests

```bash
npm test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Node environment | development |
| PORT | Port to run the server on | 3001 |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_ACCESS_EXPIRES_IN | Access token expiration time | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration time | 7d |
| GRPC_PORT | gRPC server port | 50051 |
| RABBITMQ_URL | RabbitMQ connection URL | amqp://localhost:5672 |

## Database Schema

The service uses the following database schema:

### Users

- `id` - Unique identifier
- `email` - User's email (unique)
- `name` - User's full name
- `password` - Hashed password
- `role` - User role (e.g., USER, ADMIN)
- `isActive` - Whether the user account is active
- `lastLogin` - Timestamp of last login
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Sessions

- `id` - Unique identifier
- `userId` - Reference to user
- `refreshToken` - Refresh token
- `userAgent` - User agent string
- `ipAddress` - IP address
- `expiresAt` - Expiration timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## License

MIT
