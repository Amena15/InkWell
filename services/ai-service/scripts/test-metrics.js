const { PrismaClient } = require('@prisma/client');
const { EventEmitter } = require('events');
const { MetricsService } = require('../dist/services/metrics/metrics.service');

async function testMetricsService() {
  // Initialize Prisma client
  const prisma = new PrismaClient();
  const eventEmitter = new EventEmitter();
  
  // Create metrics service
  const metricsService = new MetricsService(prisma, eventEmitter);
  
  // Test document ID
  const documentId = 'test-doc-' + Date.now();
  
  try {
    console.log('Starting metrics service test...');
    
    // Test 1: Update metrics for a new document
    console.log('\nTest 1: Updating metrics for a new document');
    const initialMetrics = await metricsService.updateMetrics({
      documentId,
      coveragePercent: 75.5,
      consistencyScore: 0.8,
      isConsistent: true
    });
    console.log('Initial metrics created:', JSON.stringify(initialMetrics, null, 2));
    
    // Test 2: Get metrics
    console.log('\nTest 2: Getting metrics');
    const retrievedMetrics = await metricsService.getMetrics(documentId);
    console.log('Retrieved metrics:', JSON.stringify(retrievedMetrics, null, 2));
    
    // Test 3: Simulate a consistency check event
    console.log('\nTest 3: Simulating CONSISTENCY_RESULT event');
    await metricsService.handleConsistencyEvent({
      documentId,
      isConsistent: true,
      score: 0.85
    });
    
    // Get updated metrics
    const updatedMetrics = await metricsService.getMetrics(documentId);
    console.log('Metrics after consistency check:', JSON.stringify(updatedMetrics, null, 2));
    
    // Test 4: Reset metrics
    console.log('\nTest 4: Resetting metrics');
    await metricsService.resetMetrics(documentId);
    console.log('Metrics reset successfully');
    
    // Verify metrics were deleted
    const deletedMetrics = await metricsService.getMetrics(documentId);
    console.log('Metrics after reset:', deletedMetrics);
    
  } catch (error) {
    console.error('Error testing metrics service:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMetricsService().catch(console.error);
