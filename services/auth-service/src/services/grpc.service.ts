import { Server, ServerCredentials, ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { join } from 'path';
import { config } from '../config';
import jwt from 'jsonwebtoken';

// Import Prisma client from the local node_modules
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PROTO_PATH = join(__dirname, '../proto/auth.proto');

const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = (require('@grpc/grpc-js').loadPackageDefinition(packageDefinition)).auth;

export class GrpcService {
  private server: Server;
  private static instance: GrpcService;

  private constructor() {
    this.server = new Server();
    this.setupHandlers();
  }

  public static getInstance(): GrpcService {
    if (!GrpcService.instance) {
      GrpcService.instance = new GrpcService();
    }
    return GrpcService.instance;
  }

  private setupHandlers() {
    this.server.addService(authProto.AuthService.service, {
      validateToken: this.validateToken.bind(this),
      getUser: this.getUser.bind(this),
    });
  }

  private async validateToken(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { token } = call.request;
      if (!token) {
        return callback(new Error('No token provided'), null);
      }
      
      if (!token) {
        return callback(null, { valid: false, error: 'No token provided' });
      }

      // Verify the token
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
      
      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isActive: true, role: true },
      });

      if (!user || !user.isActive) {
        return callback(null, { valid: false, error: 'Invalid or inactive user' });
      }

      return callback(null, {
        valid: true,
        userId: decoded.userId,
        role: user.role,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          return callback(null, { valid: false, error: 'Token expired' });
        }
        return callback(null, { valid: false, error: error.message || 'Invalid token' });
      }
      return callback(null, { valid: false, error: 'Invalid token' });
    }
  }

  private async getUser(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { userId } = call.request;
      
      if (!userId) {
        return callback(null, { error: 'User ID is required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return callback(null, { error: 'User not found' });
      }

      return callback(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error('Error in getUser:', error);
      return callback(null, { error: 'Internal server error' });
    }
  }

  public async start() {
    const port = config.grpc.port;
    const host = config.grpc.host;
    const server = this.server;
    
    let credentials: ServerCredentials;
    
    if (config.grpc.credentials === 'insecure') {
      credentials = ServerCredentials.createInsecure();
    } else {
      // For SSL/TLS, you would load the certs here
      // This is a placeholder - you'd need to implement proper SSL/TLS handling
      credentials = ServerCredentials.createInsecure();
    }
    
    return new Promise((resolve, reject) => {
      server.bindAsync(
        `${host}:${port}`,
        credentials,
        (error, port) => {
          if (error) {
            console.error('Failed to bind gRPC server:', error);
            return reject(error);
          }
          
          server.start();
          console.log(`gRPC server running on ${host}:${port}`);
          resolve(port);
        }
      );
    });
  }

  public async stop() {
    return new Promise<void>((resolve) => {
      this.server.tryShutdown(() => {
        console.log('gRPC server stopped');
        resolve();
      });
    });
  }
}

export const grpcService = GrpcService.getInstance();
