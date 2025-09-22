import { PrismaClient } from '@prisma/client';
import { 
  CreateDocumentInput, 
  UpdateDocumentInput, 
  DocumentWithContent, 
  DocumentEvent, 
  DocumentEventType 
} from '../models/document.model';
import { publishDocumentEvent } from '../utils/messageQueue';

const prisma = new PrismaClient();

type DocumentEventPayload = Omit<DocumentEvent, 'timestamp'>;

export const documentService = {
  /**
   * Publish a document event to the message queue
   */
  async publishDocumentEvent(event: DocumentEventPayload): Promise<void> {
    try {
      await publishDocumentEvent({
        ...event,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error publishing document event:', error);
      // Don't throw, as we don't want to fail the main operation
    }
  },

  /**
   * Create a new document
   */
  async createDocument(input: CreateDocumentInput): Promise<DocumentWithContent> {
    try {
      const document = await prisma.document.create({
        data: {
          title: input.title,
          content: input.content,
          projectId: input.projectId,
          ownerId: input.ownerId,
        },
      });

      // Publish document created event
      await this.publishDocumentEvent({
        eventType: 'DOC_CREATED',
        documentId: document.id,
        projectId: document.projectId,
        ownerId: document.ownerId,
        metadata: {
          title: document.title,
        },
      });

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  },

  /**
   * Get a document by ID
   */
  async getDocumentById(id: string, userId: string): Promise<DocumentWithContent | null> {
    try {
      return await prisma.document.findFirst({
        where: {
          id,
          ownerId: userId, // Ensure the user owns the document
        },
      });
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw new Error('Failed to get document by ID');
    }
  },

  /**
   * Update a document
   */
  async updateDocument(
    id: string,
    userId: string,
    updates: UpdateDocumentInput
  ): Promise<DocumentWithContent> {
    try {
      // First, verify the document exists and belongs to the user
      const existingDoc = await this.getDocumentById(id, userId);
      if (!existingDoc) {
        throw new Error('Document not found or access denied');
      }

      const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      // Publish document updated event
      await this.publishDocumentEvent({
        eventType: 'DOC_UPDATED',
        documentId: updatedDoc.id,
        projectId: updatedDoc.projectId,
        ownerId: updatedDoc.ownerId,
        metadata: {
          title: updatedDoc.title,
          updatedFields: Object.keys(updates),
        },
      });

      return updatedDoc;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string, userId: string): Promise<boolean> {
    try {
      // First, verify the document exists and belongs to the user
      const existingDoc = await this.getDocumentById(id, userId);
      if (!existingDoc) {
        throw new Error('Document not found or access denied');
      }

      await prisma.document.delete({
        where: { id },
      });

      // Publish document deleted event
      await this.publishDocumentEvent({
        eventType: 'DOC_DELETED',
        documentId: existingDoc.id,
        projectId: existingDoc.projectId,
        ownerId: existingDoc.ownerId,
        metadata: {
          title: existingDoc.title,
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  },

  /**
   * List all documents for a user in a project
   */
  async listDocuments(projectId: string, userId: string): Promise<DocumentWithContent[]> {
    try {
      return await prisma.document.findMany({
        where: {
          projectId,
          ownerId: userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error listing documents:', error);
      throw new Error('Failed to list documents');
    }
  },
};
