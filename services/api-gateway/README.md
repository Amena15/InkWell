# API Gateway Service

This is the API Gateway service for the InkWell platform, built with Fastify. It serves as the entry point for all client requests and routes them to the appropriate microservices.

## Features

- JWT-based authentication
- Request validation
- Rate limiting
- Request logging
- CORS support
- Helmet security headers
- API documentation (coming soon)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build and start in production:

```bash
npm run build
npm start
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage report:

```bash
npm run test:coverage
```

## API Endpoints

### Authentication

- `POST /auth/login` - Authenticate and get JWT token
- `POST /auth/register` - Register a new user

### AI Service

- `POST /ai/process` - Process AI request

### Notifications

- `POST /notifications/subscribe` - Subscribe to notifications
- `POST /notifications/send` - Send a notification
- `GET /notifications/:userId` - Get user notifications

### Metrics

- `GET /metrics` - Get API metrics

## Development

### Project Structure

```
src/
├── __tests__/           # Test files
├── middleware/          # Request middleware
├── routes/              # Route handlers
│   ├── auth.ts          # Authentication routes
│   ├── ai.ts            # AI service routes
│   ├── metrics.ts       # Metrics routes
│   └── notifications.ts # Notification routes
├── server.ts            # Server setup
└── types/               # TypeScript type definitions
```

### Code Style

This project uses:

- [Prettier](https://prettier.io/) for code formatting
- [ESLint](https://eslint.org/) for code linting
- [TypeScript](https://www.typescriptlang.org/) for type checking

Run the linter:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## License

MIT
