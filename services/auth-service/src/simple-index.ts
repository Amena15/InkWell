import { createSimpleAuthServer } from './simple-auth';

async function startServer() {
  try {
    const app = await createSimpleAuthServer();
    
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = '0.0.0.0';
    
    await app.listen({ port, host });
    
    console.log(`Simple Auth Server is running on http://${host}:${port}`);
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      await app.close();
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);

