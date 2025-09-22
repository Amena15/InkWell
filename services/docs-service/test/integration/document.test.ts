import { Document, DocumentEventType } from '../../src/models/document.model';
import { testDb } from '../test-utils';

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-32-characters-long-123456';
process.env.DATABASE_URL = 'file:./test.db';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';
process.env.RABBITMQ_EXCHANGE = 'test-exchange';

const { prisma } = testDb;

describe('Document Operations', () => {
  beforeAll(async () => {
    await testDb.setup();
  });

  beforeEach(async () => {
    // Clean up before each test
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.close();
  });

  describe('Document CRUD Operations', () => {
    const testDocument = {
      title: 'Test Document',
      content: 'This is a test document',
      projectId: 'test-project-1',
      ownerId: 'test-user-1'
    };

    it('should create a new document', async () => {
      // Create document
      const createdDoc = await prisma.document.create({
        data: testDocument
      });
      
      // Verify timestamps were set by the database
      expect(createdDoc.createdAt).toBeInstanceOf(Date);
      expect(createdDoc.updatedAt).toBeInstanceOf(Date);

      // Verify document was created
      expect(createdDoc).toMatchObject({
        title: testDocument.title,
        content: testDocument.content,
        projectId: testDocument.projectId,
        ownerId: testDocument.ownerId
      });
      expect(createdDoc.id).toBeDefined();
      expect(createdDoc.createdAt).toBeInstanceOf(Date);
      expect(createdDoc.updatedAt).toBeInstanceOf(Date);
    });

    it('should read a document', async () => {
      // Create test document
      const createdDoc = await prisma.document.create({ data: testDocument });
      
      // Read document
      const foundDoc = await prisma.document.findUnique({
        where: { id: createdDoc.id }
      });

      // Verify document was found
      expect(foundDoc).not.toBeNull();
      expect(foundDoc?.title).toBe(testDocument.title);
      expect(foundDoc?.content).toBe(testDocument.content);
      expect(foundDoc?.projectId).toBe(testDocument.projectId);
      expect(foundDoc?.ownerId).toBe(testDocument.ownerId);
    });

    it('should update a document', async () => {
      // Create test document
      const createdDoc = await prisma.document.create({ data: testDocument });
      
      // Update document
      const updatedTitle = 'Updated Test Document';
      const updatedContent = 'Updated content';
      
      const updatedDoc = await prisma.document.update({
        where: { id: createdDoc.id },
        data: { 
          title: updatedTitle,
          content: updatedContent 
        }
      });

      // Verify document was updated
      expect(updatedDoc.title).toBe(updatedTitle);
      expect(updatedDoc.content).toBe(updatedContent);
      expect(updatedDoc.updatedAt.getTime()).toBeGreaterThan(
        createdDoc.updatedAt.getTime()
      );
    });

    it('should delete a document', async () => {
      // Create test document
      const createdDoc = await prisma.document.create({ data: testDocument });
      
      // Delete document
      await prisma.document.delete({
        where: { id: createdDoc.id }
      });

      // Verify document was deleted
      const foundDoc = await prisma.document.findUnique({
        where: { id: createdDoc.id }
      });
      expect(foundDoc).toBeNull();
    });
  });

  describe('Document Query Operations', () => {
    const testDocuments = [
      {
        title: 'Document 1',
        content: 'Content 1',
        projectId: 'project-1',
        ownerId: 'user-1'
      },
      {
        title: 'Document 2',
        content: 'Content 2',
        projectId: 'project-1',
        ownerId: 'user-2'
      },
      {
        title: 'Document 3',
        content: 'Content 3',
        projectId: 'project-2',
        ownerId: 'user-1'
      }
    ];

    beforeEach(async () => {
      // Create test documents
      await prisma.document.createMany({
        data: testDocuments
      });
    });

    it('should find documents by project', async () => {
      // Create test documents with unique titles for this test
      const testDocs = [
        { title: 'Test Doc A', content: 'Content A', projectId: 'test-project-1', ownerId: 'test-user-1' },
        { title: 'Test Doc B', content: 'Content B', projectId: 'test-project-1', ownerId: 'test-user-2' },
        { title: 'Test Doc C', content: 'Content C', projectId: 'test-project-2', ownerId: 'test-user-1' }
      ];
      
      await prisma.document.createMany({
        data: testDocs
      });

      // Get all documents for the project
      const docs = await prisma.document.findMany({
        where: { projectId: 'test-project-1' },
        select: { title: true, content: true, projectId: true, ownerId: true }
      });

      // Verify we got the expected documents
      expect(docs).toHaveLength(2);
      expect(docs.every((doc: { projectId: string }) => doc.projectId === 'test-project-1')).toBe(true);
      expect(docs.some((doc: { title: string }) => doc.title === 'Test Doc A')).toBe(true);
      expect(docs.some((doc: { title: string }) => doc.title === 'Test Doc B')).toBe(true);
    });

    it('should find documents by owner', async () => {
      // First, clean up any existing documents
      await prisma.document.deleteMany({});
      
      // Create test documents with unique identifiers
      const testOwnerId = 'test-owner-123';
      await prisma.document.createMany({
        data: [
          { title: 'Owner Test Doc 1', content: 'Content 1', projectId: 'test-project-1', ownerId: testOwnerId },
          { title: 'Owner Test Doc 2', content: 'Content 2', projectId: 'test-project-2', ownerId: testOwnerId },
          { title: 'Other Owner Doc', content: 'Content 3', projectId: 'test-project-1', ownerId: 'other-user-456' }
        ]
      });

      // Query for documents owned by our test user
      const docs = await prisma.document.findMany({
        where: { ownerId: testOwnerId },
        select: { id: true, title: true, content: true, projectId: true, ownerId: true, createdAt: true, updatedAt: true }
      });

      // Verify we got exactly the 2 documents we expect
      expect(docs).toHaveLength(2);
      expect(docs.every((doc: { ownerId: string }) => doc.ownerId === testOwnerId)).toBe(true);
    });

    it('should search documents by title', async () => {
      // Create test documents
      await prisma.document.createMany({
        data: [
          { title: 'First Document', content: 'Content 1', projectId: 'project-1', ownerId: 'user-1' },
          { title: 'Second Doc', content: 'Content 2', projectId: 'project-2', ownerId: 'user-1' },
          { title: 'Third Document', content: 'Content 3', projectId: 'project-1', ownerId: 'user-2' }
        ]
      });

      // For SQLite, we'll use the LOWER function for case-insensitive search
      const searchTerm = 'Doc'.toLowerCase();
      const docs = await prisma.$queryRaw`
        SELECT title, content, "projectId", "ownerId"
        FROM "Document"
        WHERE LOWER(title) LIKE ${'%' + searchTerm + '%'}
      `;
      
      // Convert to the expected format
      const formattedDocs = (docs as Array<{title: string, content: string, projectId: string, ownerId: string}>).map(doc => ({
        title: doc.title,
        content: doc.content,
        projectId: doc.projectId,
        ownerId: doc.ownerId
      }));

      // Verify we got some matching documents
      expect(formattedDocs.length).toBeGreaterThan(0);
      expect(formattedDocs.every(doc => 
        doc.title.toLowerCase().includes(searchTerm) || 
        doc.content.toLowerCase().includes(searchTerm)
      )).toBe(true);
    });
  });
});
