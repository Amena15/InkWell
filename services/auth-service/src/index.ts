import { buildApp } from './app';
import { config } from './config';
import { grpcService } from './services/grpc.service';

async function startServer() {
  try {
    // Create Fastify app
    const app = await buildApp();
    
    // Start gRPC server
    await grpcService.start();
    
    // Start HTTP server
    await app.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    console.log(`Server is running on http://localhost:${config.port}`);
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      await app.close();
      await grpcService.stop();
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch(console.error);
}
