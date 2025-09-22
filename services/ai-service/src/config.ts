import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3002', 10),
  HOST: process.env.HOST || '0.0.0.0',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
  
  // RabbitMQ Configuration
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE || 'document_events',
  
  // Document Generation Settings
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  
  // Similarity Threshold (0-1) for code-doc consistency checks
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.75'),
};

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

export type Config = typeof config;
