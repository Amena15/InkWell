import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { config } from '../config';

// Database pool configuration
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const SALT_ROUNDS = 10;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

export class AuthService {
  private static instance: AuthService;
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register({ email, password, name }: RegisterInput): Promise<Omit<User, 'password'>> {
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, name, password, role) 
         VALUES ($1, $2, $3, 'USER') 
         RETURNING id, email, name, role, "isActive", "lastLogin", "createdAt", "updatedAt"`,
        [email, name, hashedPassword]
      );

      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  public async login({ email, password }: LoginInput): Promise<AuthTokens> {
    const client = await pool.connect();
    
    try {
      // Get user by email
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0] as User;

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await client.query(
        'UPDATE users SET "lastLogin" = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      return this.generateTokens(user.id);
    } finally {
      client.release();
    }
  }

  public async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const client = await pool.connect();
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
      
      // Check if refresh token exists in the database
      const sessionResult = await client.query(
        'SELECT * FROM sessions WHERE "refreshToken" = $1',
        [refreshToken]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('Invalid refresh token');
      }

      const session = sessionResult.rows[0];
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await client.query('DELETE FROM sessions WHERE id = $1', [session.id]);
        throw new Error('Refresh token expired');
      }

      // Generate new tokens
      return this.generateTokens(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Clean up expired session
        await client.query('DELETE FROM sessions WHERE "refreshToken" = $1', [refreshToken]);
        throw new Error('Refresh token expired');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  public async logout(refreshToken: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('DELETE FROM sessions WHERE "refreshToken" = $1', [refreshToken]);
    } finally {
      client.release();
    }
  }

  public async getUserProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, name, role, "isActive", "lastLogin", "createdAt", "updatedAt" FROM users WHERE id = $1',
        [userId]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, name, role, "isActive", "lastLogin", "createdAt", "updatedAt" FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: parseInt(config.jwt.accessExpiration as string) || 3600 }
    );

    const refreshToken = jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: parseInt(config.jwt.refreshExpiration as string) || 86400 }
    );

    const client = await pool.connect();
    
    try {
      // Store refresh token in database
      await client.query(
        `INSERT INTO sessions ("userId", "refreshToken", "expiresAt")
         VALUES ($1, $2, NOW() + INTERVAL '${config.jwt.refreshExpiration}')`,
        [userId, refreshToken]
      );

      return { accessToken, refreshToken };
    } finally {
      client.release();
    }
  }
}

export const authService = AuthService.getInstance();
