import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { MetricsService } from '../../services/metrics/metrics.service';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma client
const prismaMock = mockDeep<PrismaClient>();
const eventEmitter = new EventEmitter();

// Type assertion for mock Prisma client
const prisma = prismaMock as unknown as PrismaClient;

// Mock the Prisma client methods
const mockUpsert = prismaMock.metrics.upsert as jest.Mock;
const mockFindUnique = prismaMock.metrics.findUnique as jest.Mock;
const mockDeleteMany = prismaMock.metrics.deleteMany as jest.Mock;

describe('MetricsService', () => {
  let metricsService: MetricsService;
  const documentId = 'test-doc-123';
  const now = new Date();

  beforeEach(() => {
    // Reset all mocks before each test
    mockReset(prismaMock);
    jest.clearAllMocks();
    
    // Create a new instance of the service for each test
    metricsService = new MetricsService(prisma, eventEmitter);
  });

  describe('updateMetrics', () => {
    it('should create new metrics if none exist', async () => {
      // Mock the database to return null (no existing metrics)
      mockFindUnique.mockResolvedValueOnce(null);
      
      // Mock the upsert to return the new metrics
      mockUpsert.mockResolvedValueOnce({
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 1,
        lastUpdated: now,
        totalChecks: 1,
        passingChecks: 1,
      });

      const result = await metricsService.updateMetrics({
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        isConsistent: true,
      });

      expect(result).toEqual({
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 1, // Should be 1 since isConsistent is true
        lastUpdated: now,
        totalChecks: 1,
        passingChecks: 1,
      });

      // Verify the database was called correctly
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { documentId },
        update: expect.any(Object),
        create: expect.objectContaining({
          documentId,
          coveragePercent: 85.5,
          consistencyScore: 1,
          totalChecks: 1,
          passingChecks: 1,
        }),
      });
    });

    it('should update existing metrics', async () => {
      // Mock existing metrics
      const existingMetrics = {
        documentId,
        coveragePercent: 70,
        consistencyScore: 0.8,
        lastUpdated: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
        totalChecks: 5,
        passingChecks: 4,
      };

      mockFindUnique.mockResolvedValueOnce(existingMetrics);
      
      // Mock the updated metrics
      mockUpsert.mockResolvedValueOnce({
        ...existingMetrics,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        lastUpdated: now,
        totalChecks: 6,
        passingChecks: 5,
      });

      const result = await metricsService.updateMetrics({
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        isConsistent: true,
      });

      expect(result).toEqual({
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        lastUpdated: now,
        totalChecks: 6,
        passingChecks: 5,
      });
    });
  });

  describe('handleConsistencyEvent', () => {
    it('should update metrics when receiving a CONSISTENCY_RESULT event', async () => {
      // Mock existing metrics
      const existingMetrics = {
        documentId,
        coveragePercent: 70,
        consistencyScore: 0.8,
        lastUpdated: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
        totalChecks: 5,
        passingChecks: 4,
      };

      // Mock the database calls
      mockFindUnique.mockResolvedValueOnce(existingMetrics);
      
      // Mock the updated metrics
      mockUpsert.mockResolvedValueOnce({
        ...existingMetrics,
        consistencyScore: 0.833, // (4 + 1) / (5 + 1) ≈ 0.833
        lastUpdated: now,
        totalChecks: 6,
        passingChecks: 5,
      });

      // Simulate the event
      await metricsService.handleConsistencyEvent({
        documentId,
        isConsistent: true,
      });

      // Verify the database was called correctly
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { documentId },
        update: {
          consistencyScore: expect.closeTo(0.833, 3),
          lastUpdated: expect.any(Date),
          totalChecks: 6,
          passingChecks: 5,
        },
        create: expect.any(Object),
      });
    });
  });

  describe('getMetrics', () => {
    it('should return metrics for a document', async () => {
      const mockMetrics = {
        documentId,
        coveragePercent: 85.5,
        consistencyScore: 0.9,
        lastUpdated: now,
        totalChecks: 10,
        passingChecks: 9,
      };

      mockFindUnique.mockResolvedValueOnce(mockMetrics);

      const result = await metricsService.getMetrics(documentId);
      expect(result).toEqual(mockMetrics);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { documentId },
      });
    });

    it('should return null if no metrics exist', async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const result = await metricsService.getMetrics('non-existent-doc');
      expect(result).toBeNull();
    });
  });

  describe('resetMetrics', () => {
    it('should delete metrics for a document', async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 1 });

      await metricsService.resetMetrics(documentId);
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { documentId },
      });
    });
  });
});
