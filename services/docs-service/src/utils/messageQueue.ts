import * as amqp from 'amqplib';
import { Channel, Connection } from 'amqplib/callback_api';
import { DocumentEvent } from '../models/document.model';
import { config } from '../config';

/**
 * @file Message Queue utility for handling RabbitMQ connections and message publishing
 * @module utils/messageQueue
 * @description Provides a simplified interface for working with RabbitMQ, including
 * connection management, message publishing, and automatic reconnection logic.
 */

/**
 * Extended Channel interface with promisified methods
 * @interface PromisifiedChannel
 * @extends {Omit<Channel, 'close' | 'assertExchange' | 'publish'>}
 */

interface PromisifiedChannel extends Omit<Channel, 'close' | 'assertExchange' | 'publish'> {
  /**
   * Close the channel
   * @returns {Promise<void>} Resolves when the channel is closed
   */
  close(): Promise<void>;
  
  /**
   * Assert an exchange
   * @param {string} exchange - The exchange name
   * @param {string} type - The exchange type (e.g., 'topic', 'direct', 'fanout')
   * @param {amqp.Options.AssertExchange} [options] - Exchange options
   * @returns {Promise<amqp.Replies.AssertExchange>} Exchange assertion result
   */
  assertExchange(exchange: string, type: string, options?: amqp.Options.AssertExchange): Promise<amqp.Replies.AssertExchange>;
  
  /**
   * Publish a message to an exchange
   * @param {string} exchange - The exchange name
   * @param {string} routingKey - The routing key
   * @param {Buffer} content - The message content
   * @param {amqp.Options.Publish} [options] - Publish options
   * @returns {boolean} True if the message was sent, false if it was buffered or queued
   */
  publish(exchange: string, routingKey: string, content: Buffer, options?: amqp.Options.Publish): boolean;
}

/**
 * Extended Connection interface with promisified methods
 * @interface PromisifiedConnection
 * @extends {Omit<Connection, 'close'>}
 */
interface PromisifiedConnection extends Omit<Connection, 'close'> {
  /**
   * Close the connection
   * @returns {Promise<void>} Resolves when the connection is closed
   */
  close(): Promise<void>;
  
  /**
   * Create a new channel
   * @param {(err: Error | null, channel: Channel) => void} callback - Callback with the created channel
   */
  createChannel(callback: (err: Error | null, channel: Channel) => void): void;
}

/** @type {PromisifiedChannel | null} Active channel instance */
let channel: PromisifiedChannel | null = null;

/** @type {PromisifiedConnection | null} Active connection instance */
let connection: PromisifiedConnection | null = null;

/** @type {boolean} Flag indicating if a connection attempt is in progress */
let isConnecting = false;

/**
 * Initializes the message queue connection and sets up the required exchange
 * @async
 * @returns {Promise<{connection: PromisifiedConnection, channel: PromisifiedChannel}>} The connection and channel objects
 * @throws {Error} If connection or channel creation fails
 * @example
 * try {
 *   await initMessageQueue();
 *   console.log('Message queue initialized');
 * } catch (error) {
 *   console.error('Failed to initialize message queue:', error);
 * }
 */
export async function initMessageQueue() {
  if (channel || isConnecting) return;
  
  isConnecting = true;
  
  try {
    // Create a connection
    const conn = await new Promise<Connection>((resolve: (connection: Connection) => void, reject: (reason?: any) => void) => {
      amqp.connect(config.rabbitmq.url, (err: Error | null, connection: Connection | null) => {
        if (err) return reject(err);
        if (!connection) return reject(new Error('Failed to create connection'));
        resolve(connection);
      });
    });
    
    // Create a channel
    const ch = await new Promise<Channel>((resolve: (channel: Channel) => void, reject: (reason?: any) => void) => {
      conn.createChannel((err: Error | null, channel: Channel | undefined) => {
        if (err) return reject(err);
        if (!channel) return reject(new Error('Failed to create channel'));
        resolve(channel);
      });
    });
    
    // Store the promisified connection
    connection = {
      ...conn,
      close: () => new Promise<void>((resolve, reject) => {
        conn.close((err) => err ? reject(err) : resolve());
      })
    };
    channel = {
      ...ch,
      close: () => new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
        ch.close((err: Error | null) => err ? reject(err) : resolve());
      }),
      assertExchange: (exchange: string, type: string, options?: amqp.Options.AssertExchange) => 
        new Promise<amqp.Replies.AssertExchange>((resolve: (value: amqp.Replies.AssertExchange) => void, reject: (reason?: any) => void) => {
          ch.assertExchange(exchange, type, options, (err: Error | null, ok: amqp.Replies.AssertExchange) => 
            err ? reject(err) : resolve(ok)
          );
        }),
      publish: (
        exchange: string, 
        routingKey: string, 
        content: Buffer, 
        options?: amqp.Options.Publish
      ): boolean => {
        return ch.publish(exchange, routingKey, content, options);
      }
    };
    
    // Assert the exchange for document events
    await channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    // Handle connection close
    connection.on('close', () => {
      console.error('RabbitMQ connection closed. Reconnecting...');
      channel = null;
      connection = null;
      connection = null;
      isConnecting = false;
      setTimeout(() => {
        initMessageQueue().catch(console.error);
      }, 5000);
    });
    
    connection.on('error', (error: Error) => {
      console.error('RabbitMQ connection error:', error);
      if (!connection) {
        // If connection is lost, try to reconnect
        isConnecting = false;
        setTimeout(() => {
          initMessageQueue().catch(console.error);
        }, 5000);
      }
    });
    
    isConnecting = false;
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    isConnecting = false;
    // Retry after a delay
    setTimeout(initMessageQueue, 5000);
    throw error;
  }
}

/**
 * Publishes a document event to the message queue
 * @async
 * @param {DocumentEvent} event - The document event to publish
 * @returns {Promise<boolean>} True if the event was published successfully, false otherwise
 * @example
 * const event = {
 *   eventType: 'DOC_CREATED',
 *   documentId: 'doc-123',
 *   projectId: 'proj-456',
 *   ownerId: 'user-789',
 *   timestamp: new Date(),
 *   metadata: { title: 'Test Document' }
 * };
 * const success = await publishDocumentEvent(event);
 */
export async function publishDocumentEvent(event: DocumentEvent): Promise<boolean> {
  if (!channel || !connection) {
    console.warn('Message queue not initialized, attempting to connect...');
    try {
      await initMessageQueue();
      if (!channel || !connection) {
        throw new Error('Failed to initialize message queue: No channel or connection');
      }
    } catch (error) {
      console.error('Error initializing message queue:', error);
      return false;
    }
  }

  try {
    const routingKey = `document.${event.eventType.toLowerCase()}`;
    const message = Buffer.from(JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString() // Ensure timestamp is serialized
    }));
    
    const success = channel.publish(
      config.rabbitmq.exchange,
      routingKey,
      message,
      { persistent: true }
    );
    
    if (!success) {
      throw new Error('Failed to publish message to exchange');
    }
    
    console.log(`Published event: ${event.eventType} for document ${event.documentId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to publish document event:', errorMessage);
    
    // Attempt to reconnect on error
    channel = null;
    if (connection) {
      const conn = connection;
      connection = null;
      try {
        await conn.close();
      } catch (closeError: unknown) {
        const errorMessage = closeError instanceof Error ? closeError.message : 'Unknown error';
        console.error('Error closing connection:', errorMessage);
      }
    }
    
    // Schedule reconnection
    setTimeout(() => {
      initMessageQueue().catch(err => 
        console.error('Error during reconnection:', err)
      );
    }, 1000);
    
    return false;
  }
}

/**
 * Closes the message queue connection and channel
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If closing the connection or channel fails
 * @example
 * try {
 *   await closeMessageQueue();
 *   console.log('Message queue connection closed');
 * } catch (error) {
 *   console.error('Error closing message queue:', error);
 * }
 */
export async function closeMessageQueue() {
  const closePromises: Promise<unknown>[] = [];
  
  // Store references to close
  const currentChannel = channel;
  const currentConnection = connection;
  
  // Clear references first to prevent new operations
  channel = null;
  connection = null;
  
  try {
    if (currentChannel) {
      closePromises.push(currentChannel.close().catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error closing channel:', errorMessage);
      }));
    }
    
    if (currentConnection) {
      closePromises.push(currentConnection.close().catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error closing connection:', errorMessage);
      }));
    }
    
    await Promise.all(closePromises);
    console.log('Closed RabbitMQ connection');
  } catch (error) {
    console.error('Error during RabbitMQ connection cleanup:', error);
    throw error;
  }
}

// Initialize connection on import
initMessageQueue().catch(error => {
  console.error('Failed to initialize message queue:', error);
});

// Handle process termination
process.on('SIGINT', async () => {
  await closeMessageQueue();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMessageQueue();
  process.exit(0);
});
