import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createTestApp, testUser, closeTestApp, createTestUser } from './test-utils';
import { FastifyInstance } from 'fastify';
import { prisma } from './test-utils';
import * as jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Auth Service', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });
  
  afterAll(async () => {
    await closeTestApp(app);
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: testUser,
      });
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.email).toBe(testUser.email);
      expect(body.user.name).toBe(testUser.name);
      expect(body.user.role).toBe('USER');
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });
    
    it('should not register a user with an existing email', async () => {
      await createTestUser();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: testUser.email,
          password: 'anotherpassword',
          name: 'Another User',
        },
      });
      
      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await createTestUser();
    });
    
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testUser.email,
          password: 'password123',
        },
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.email).toBe(testUser.email);
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });
    
    it('should not login with invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testUser.email,
          password: 'wrongpassword',
        },
      });
      
      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Invalid credentials');
    });
  });
  
  describe('POST /api/auth/refresh-token', () => {
    let refreshToken: string;
    
    beforeAll(async () => {
      const user = await createTestUser();
      const token = jwt.sign(
        { userId: user.id },
        config.jwt.secret,
        { expiresIn: '7d' }
      );
      
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      
      refreshToken = token;
    });
    
    it('should refresh the access token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh-token',
        payload: {
          refreshToken,
        },
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });
    
    it('should not refresh with invalid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh-token',
        payload: {
          refreshToken: 'invalid-token',
        },
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('GET /api/auth/me', () => {
    let accessToken: string;
    
    beforeAll(async () => {
      const user = await createTestUser();
      accessToken = jwt.sign(
        { userId: user.id, role: 'USER' },
        config.jwt.secret,
        { expiresIn: '15m' }
      );
    });
    
    it('should return the current user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.email).toBe(testUser.email);
      expect(body.name).toBe(testUser.name);
    });
    
    it('should not allow access without a token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
});
