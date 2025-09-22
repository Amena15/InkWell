// Mock the openai module first
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock generated document content',
            },
          }],
        }),
      },
    },
  })),
}));

import Fastify from 'fastify';
import { config } from '../config';
import { routes } from '../routes';
import { aiService } from '../services/ai.service';
import fastifyFormBody from '@fastify/formbody';

// Mock the AI service
jest.mock('../services/ai.service', () => ({
  aiService: {
    generateDocument: jest.fn().mockResolvedValue('Generated document'),
    checkConsistency: jest.fn().mockResolvedValue({
      isConsistent: true,
      confidence: 0.95,
      mismatches: [],
    }),
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('API Endpoints', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(fastifyFormBody);
    await app.register(routes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /ai/generate', () => {
    it('should return 200 and generated document on POST /ai/generate', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/generate',
        payload: {
          requirements: 'Test requirements',
          type: 'srs'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.statusCode).toBe(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody).toEqual({
        success: true,
        document: 'Generated document'
      });
    });

    it('should return 400 if requirements are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/generate',
        payload: { type: 'srs' },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /ai/check-consistency', () => {
    it('should return 200 and consistency check result on POST /ai/check-consistency', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/check-consistency',
        payload: {
          code: 'function test() { return 1; }',
          documentation: 'Test documentation'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.statusCode).toBe(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody).toMatchObject({
        success: true,
        isConsistent: true,
        confidence: 0.95
      });
      expect(Array.isArray(responseBody.mismatches)).toBe(true);
    });

    it('should return 400 if code or documentation is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/check-consistency',
        payload: { code: 'test' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
