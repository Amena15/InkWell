import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { MetricsData, IMetricsService } from './types';

export class MetricsService implements IMetricsService {
  private prisma: PrismaClient;
  private eventEmitter: EventEmitter;

  constructor(prisma: PrismaClient, eventEmitter: EventEmitter) {
    this.prisma = prisma;
    this.eventEmitter = eventEmitter;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.eventEmitter.on('CONSISTENCY_RESULT', (event: { documentId: string; isConsistent: boolean }) => {
      this.handleConsistencyEvent(event).catch(console.error);
    });
  }

  public async updateMetrics({
    documentId,
    coveragePercent,
    consistencyScore,
    isConsistent
  }: {
    documentId: string;
    coveragePercent: number;
    consistencyScore: number;
    isConsistent?: boolean;
  }): Promise<MetricsData> {
    const now = new Date();
    
    // Get existing metrics to calculate new values
    const existing = await this.prisma.metrics.findUnique({
      where: { documentId }
    });

    const totalChecks = (existing?.totalChecks || 0) + 1;
    const passingChecks = (existing?.passingChecks || 0) + (isConsistent ? 1 : 0);
    const newConsistencyScore = isConsistent !== undefined 
      ? (existing ? (existing.consistencyScore * existing.totalChecks + (isConsistent ? 1 : 0)) / totalChecks : (isConsistent ? 1 : 0))
      : consistencyScore;

    return this.prisma.metrics.upsert({
      where: { documentId },
      update: {
        coveragePercent,
        consistencyScore: newConsistencyScore,
        lastUpdated: now,
        totalChecks,
        passingChecks,
      },
      create: {
        documentId,
        coveragePercent,
        consistencyScore: isConsistent !== undefined ? (isConsistent ? 1 : 0) : consistencyScore,
        lastUpdated: now,
        totalChecks: 1,
        passingChecks: isConsistent ? 1 : 0,
      },
    });
  }

  public async getMetrics(documentId: string): Promise<MetricsData | null> {
    return this.prisma.metrics.findUnique({
      where: { documentId },
    });
  }

  public async resetMetrics(documentId: string): Promise<void> {
    await this.prisma.metrics.deleteMany({
      where: { documentId },
    });
  }

  public async handleConsistencyEvent(event: { documentId: string; isConsistent: boolean }): Promise<void> {
    const { documentId, isConsistent } = event;
    
    // Get current metrics to update
    const current = await this.getMetrics(documentId) || {
      documentId,
      coveragePercent: 0,
      consistencyScore: 0,
      lastUpdated: new Date(),
      totalChecks: 0,
      passingChecks: 0,
    };

    // Update only the consistency-related fields
    const totalChecks = current.totalChecks + 1;
    const passingChecks = current.passingChecks + (isConsistent ? 1 : 0);
    const newConsistencyScore = passingChecks / totalChecks;

    await this.prisma.metrics.upsert({
      where: { documentId },
      update: {
        consistencyScore: newConsistencyScore,
        lastUpdated: new Date(),
        totalChecks,
        passingChecks,
      },
      create: {
        documentId,
        coveragePercent: 0, // Will be updated separately
        consistencyScore: isConsistent ? 1 : 0,
        lastUpdated: new Date(),
        totalChecks: 1,
        passingChecks: isConsistent ? 1 : 0,
      },
    });
  }
}
