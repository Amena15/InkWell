import { FastifyInstance } from 'fastify';
import { EventEmitter } from 'events';
import { MetricsService } from '../../services/metrics/metrics.service';
import { build } from '../../app';

// Mock the metrics service
jest.mock('../../services/metrics/metrics.service');
const MockedMetricsService = MetricsService as jest.MockedClass<typeof MetricsService>;

describe('Metrics Routes', () => {
  let app: FastifyInstance;
  let mockMetricsService: jest.Mocked<MetricsService>;
  const documentId = 'test-doc-123';
  const now = new Date();

  beforeAll(async () => {
    // Create a new Fastify instance for testing
    app = await build();
    
    // Create a mock metrics service
    mockMetricsService = new MockedMetricsService(
      {} as any, // Mock PrismaClient
      new EventEmitter()
    ) as jest.Mocked<MetricsService>;
    
    // Add the mock service to the Fastify instance
    app.decorate('metricsService', mockMetricsService);
    
    // Register the routes
    await app.register(import('../../routes/metrics.routes'));
    
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /metrics/:docId', () => {
    it('should return 200 with metrics when they exist', async () => {
      const mockMetrics = {
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        lastUpdated: now,
        totalChecks: 10,
        passingChecks: 9,
      };

      mockMetricsService.getMetrics.mockResolvedValue(mockMetrics);

      const response = await app.inject({
        method: 'GET',
        url: `/metrics/${documentId}`,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({
        ...mockMetrics,
        lastUpdated: mockMetrics.lastUpdated.toISOString(),
      });
      expect(mockMetricsService.getMetrics).toHaveBeenCalledWith(documentId);
    });

    it('should return 404 when metrics do not exist', async () => {
      mockMetricsService.getMetrics.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/metrics/non-existent-doc',
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Metrics not found for this document',
      });
    });
  });

  describe('DELETE /metrics/:docId', () => {
    it('should return 204 and reset metrics', async () => {
      mockMetricsService.resetMetrics.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: `/metrics/${documentId}`,
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      expect(mockMetricsService.resetMetrics).toHaveBeenCalledWith(documentId);
    });
  });
});
