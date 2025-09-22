import { EventEmitter } from 'events';
import amqp, { Channel, Connection } from 'amqplib';
import { aiService } from '../services/ai.service';
import { config } from '../config.js';
import { FastifyInstance } from 'fastify';

/**
 * Sets up event handlers for the application
 * @param eventEmitter The event emitter to use for local events
 * @param fastify Optional Fastify instance for accessing services
 */
export async function setupEventHandlers(eventEmitter: EventEmitter, fastify?: FastifyInstance) {
  try {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert the exchange
    await channel.assertExchange(config.RABBITMQ_EXCHANGE, 'topic', { durable: true });
    
    // Set up the queue for DOC_UPDATED events
    const queue = 'ai-service-doc-updated';
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, config.RABBITMQ_EXCHANGE, 'document.updated');
    
    console.log('Waiting for DOC_UPDATED events...');
    
    // Consume document update messages
    channel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const { documentId, content, codeSnippets } = JSON.parse(msg.content.toString());
        
        // Process each code snippet
        const results = [];
        for (const snippet of codeSnippets) {
          const result = await aiService.checkConsistency(snippet.code, content);
          
          // Emit CONSISTENCY_RESULT event for each check
          eventEmitter.emit('CONSISTENCY_RESULT', {
            documentId,
            isConsistent: result.isConsistent,
            score: result.confidence, // Using confidence as the score
            codeSnippetId: snippet.id,
          });
          results.push({
            documentId,
            codeSnippetId: snippet.id,
            ...result
          });
        }
        
        // Publish CONSISTENCY_RESULT event
        const consistencyResult = {
          documentId,
          timestamp: new Date().toISOString(),
          results
        };
        
        channel.publish(
          config.RABBITMQ_EXCHANGE,
          'consistency.checked',
          Buffer.from(JSON.stringify(consistencyResult)),
          { persistent: true }
        );
        
        console.log(`Processed DOC_UPDATED event for document ${documentId}`);
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing DOC_UPDATED event:', error);
        channel.nack(msg, false, false); // Don't requeue on error
      }
    });
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      // Implement reconnection logic here
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('Failed to set up event handlers:', error);
    throw error;
  }
}
