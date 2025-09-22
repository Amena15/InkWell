import { PrismaClient } from '@prisma/client';
import { documentService } from '../../src/services/document.service';
import { testDb } from '../test-utils';
import { DocumentEventType } from '../../src/models/document.model';

// Set up test environment variables
process.env.DATABASE_URL = 'file:./test.db';

// Mock the message queue
jest.mock('../../src/utils/messageQueue', () => ({
  publishDocumentEvent: jest.fn().mockResolvedValue(true),
  initMessageQueue: jest.fn().mockResolvedValue({}),
  closeMessageQueue: jest.fn().mockResolvedValue(undefined),
}));

describe('Document Service', () => {
  beforeAll(async () => {
    try {
      // First, ensure the database is clean
      await testDb.setup();
      // Then run migrations
      await testDb.prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
      await testDb.prisma.$executeRaw`DROP TABLE IF EXISTS Document;`;
      await testDb.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
      
      // Re-run setup to ensure clean state
      await testDb.setup();
    } catch (error) {
      console.error('Failed to set up test database:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await testDb.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  afterAll(async () => {
    try {
      await testDb.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'Test content',
        projectId: 'project-1',
        ownerId: 'user-1',
      };

      const result = await documentService.createDocument(documentData);

      expect(result).toMatchObject({
        title: documentData.title,
        content: documentData.content,
        projectId: documentData.projectId,
        ownerId: documentData.ownerId,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getDocumentById', () => {
    it('should return a document by ID', async () => {
      // Create a test document
      await testDb.prisma.document.create({
        data: {
          id: 'doc-1',
          title: 'Test Doc',
          content: 'Test Content',
          projectId: 'project-1',
          ownerId: 'user-1'
        }
      });

      const result = await documentService.getDocumentById('doc-1', 'user-1');
      
      expect(result).toMatchObject({
        id: 'doc-1',
        title: 'Test Doc',
        content: 'Test Content',
        projectId: 'project-1',
        ownerId: 'user-1'
      });
    });

    it('should return null if document does not exist', async () => {
      const result = await documentService.getDocumentById('non-existent', 'user-1');
      expect(result).toBeNull();
    });

    it('should return null if user is not the owner', async () => {
      // Create a test document
      await testDb.prisma.document.create({
        data: {
          id: 'doc-2',
          title: 'Test Doc',
          content: 'Test Content',
          projectId: 'project-1',
          ownerId: 'user-1'
        }
      });

      const result = await documentService.getDocumentById('doc-2', 'different-user');
      expect(result).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      // Create a test document
      await testDb.prisma.document.create({
        data: {
          id: 'doc-3',
          title: 'Original Title',
          content: 'Original Content',
          projectId: 'project-1',
          ownerId: 'user-1'
        }
      });

      const updates = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      const result = await documentService.updateDocument('doc-3', 'user-1', updates);
      
      expect(result).toMatchObject({
        id: 'doc-3',
        title: 'Updated Title',
        content: 'Updated Content',
        projectId: 'project-1',
        ownerId: 'user-1'
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete an existing document', async () => {
      // Create a test document
      await testDb.prisma.document.create({
        data: {
          id: 'doc-4',
          title: 'To Delete',
          content: 'Delete Me',
          projectId: 'project-1',
          ownerId: 'user-1'
        }
      });

      const result = await documentService.deleteDocument('doc-4', 'user-1');
      expect(result).toBe(true);

      // Verify document is deleted
      const deletedDoc = await testDb.prisma.document.findUnique({
        where: { id: 'doc-4' }
      });
      expect(deletedDoc).toBeNull();
    });
  });

  describe('listDocuments', () => {
    it('should list all documents for a user in a project', async () => {
      // Create test documents
      await testDb.prisma.document.createMany({
        data: [
          {
            id: 'doc-5',
            title: 'Doc 1',
            content: 'Content 1',
            projectId: 'project-1',
            ownerId: 'user-1'
          },
          {
            id: 'doc-6',
            title: 'Doc 2',
            content: 'Content 2',
            projectId: 'project-1',
            ownerId: 'user-1'
          },
          {
            id: 'doc-7',
            title: 'Doc 3',
            content: 'Content 3',
            projectId: 'project-2',
            ownerId: 'user-1'
          }
        ]
      });

      const result = await documentService.listDocuments('project-1', 'user-1');
      
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'doc-5' }),
          expect.objectContaining({ id: 'doc-6' })
        ])
      );
    });

    it('should return empty array if no documents found', async () => {
      const result = await documentService.listDocuments('non-existent-project', 'user-1');
      expect(result).toEqual([]);
    });
  });
});
