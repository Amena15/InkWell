// Test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.JWT_SECRET = 'test-secret-32-characters-long-123456';
process.env.DATABASE_URL = 'file:./test.db';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';
process.env.RABBITMQ_EXCHANGE = 'test-exchange';
