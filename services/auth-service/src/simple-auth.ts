import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

export async function createSimpleAuthServer() {
  const app = Fastify({
    logger: true
  });

  // Register plugins
  await app.register(cookie);
  await app.register(cors, {
    origin: true,
    credentials: true
  });

  // Mock users for testing
  const mockUsers = [
    { id: '1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: '2', email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
  ];

  // Login endpoint
  app.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as { email: string; password: string };
      
      // Find user
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return reply.send({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Register endpoint
  app.post('/auth/register', async (request, reply) => {
    try {
      const { email, password, name } = request.body as { 
        email: string; 
        password: string; 
        name: string; 
      };
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return reply.status(400).send({ 
          success: false, 
          message: 'User already exists' 
        });
      }

      // Create new user
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        email,
        password,
        name
      };
      mockUsers.push(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          name: newUser.name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      return reply.send({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Me endpoint (for getting current user)
  app.get('/auth/me', async (request, reply) => {
    try {
      const token = request.cookies.auth_token;
      
      if (!token) {
        return reply.status(401).send({ 
          success: false, 
          message: 'No token provided' 
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      return reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return reply.status(401).send({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  });

  // Verify token endpoint
  app.get('/auth/verify', async (request, reply) => {
    try {
      const token = request.cookies.auth_token;
      
      if (!token) {
        return reply.status(401).send({ 
          success: false, 
          message: 'No token provided' 
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        return reply.status(401).send({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      return reply.send({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return reply.status(401).send({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  });

  // Health check
  app.get('/health', async (request, reply) => {
    return reply.send({ status: 'ok', service: 'auth-service' });
  });

  return app;
}
