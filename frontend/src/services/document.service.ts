import type { 
  Document, 
  DocumentCreatePayload, 
  DocumentUpdatePayload, 
  DocumentStats 
} from '@/types/document';
import apiClient from '@/lib/api-client';

/**
 * Document Service
 *
 * This service handles all document-related operations including:
 * - Fetching all documents for the authenticated user
 * - Retrieving individual documents by ID
 * - Creating new documents in the database
 * - Updating existing documents with proper error handling
 * - Deleting documents securely
 * - Calculating document statistics
 * - Getting recent documents
 * - Searching functionality
 *
 * All methods return Promises and handle proper error propagation
 * Uses the frontend's API routes at /api/documents/* endpoints
 */
class DocumentService {
  // Get all documents
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get<Document[]>('/api/documents');
      return response.data.map(doc => ({
        ...doc,
        tags: doc.tags || [] // Ensure tags is always an array
      }));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw error;
    }
  }

  // Get a single document by ID
  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await apiClient.get<Document>(`/api/documents/${id}`);
      const doc = response.data;
      return {
        ...doc,
        tags: doc.tags || [] // Ensure tags is always an array
      };
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      throw error;
    }
  }

  // Create a new document
  async createDocument(documentData: DocumentCreatePayload): Promise<Document> {
    try {
      const response = await apiClient.post<Document>('/api/documents', documentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  }

  // Update an existing document
  async updateDocument(id: string, updates: DocumentUpdatePayload): Promise<Document> {
    try {
      const response = await apiClient.put<Document>(`/api/documents/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update document ${id}:`, error);
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/documents/${id}`);
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      throw error;
    }
  }

  // Get recent documents (limit to specified number, default 5)
  async getRecentDocuments(limit = 5): Promise<Document[]> {
    try {
      const documents = await this.getDocuments();
      return documents
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch recent documents:', error);
      throw error;
    }
  }

  // Get document statistics
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      // For now, calculate stats from the documents list
      // In a real implementation, you'd likely have a dedicated API endpoint
      const documents = await this.getDocuments();

      // Calculate basic stats
      const total = documents.length;
      const shared = documents.filter(doc => doc.isPublic).length;
      const recentSearches = 5; // Placeholder - this would come from actual user activity

      // Get the most recently updated document
      const lastUpdated = documents.length > 0
        ? documents.reduce((latest, doc) =>
            new Date(doc.updatedAt) > new Date(latest.updatedAt) ? doc : latest
          ).updatedAt
        : new Date().toISOString();

      // Calculate approximate storage used
      const storageUsed = documents.reduce((sum, doc) =>
        sum + (doc.content ? doc.content.length : 0), 0);

      // Group documents by type
      const documentsByType = [
        { type: 'Markdown', count: documents.filter(doc => doc.content.includes('# ')).length },
        { type: 'Text', count: documents.filter(doc => !doc.content.includes('# ')).length },
      ];

      return {
        total,
        shared,
        recentSearches: recentSearches || 5,
        lastUpdated: lastUpdated || new Date().toISOString(),
        storageUsed: storageUsed || 0,
        documentsByType: documentsByType || [],
      };
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
      throw error;
    }
  }

  // Search documents by title or content
  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const documents = await this.getDocuments();
      const lowerQuery = query.toLowerCase();
      return documents.filter(
        doc =>
          doc.title.toLowerCase().includes(lowerQuery) ||
          doc.content.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Failed to search documents:', error);
      throw error;
    }
  }
}

// Export as both default and named export
export const documentService = new DocumentService();
export default documentService;