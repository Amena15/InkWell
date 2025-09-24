import { Document } from '@/types/document';
import apiClient from '@/lib/api-client';

export const documentService = {
  // Get all documents
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get<Document[]>('/api/documents');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw error;
    }
  },

  // Get a single document by ID
  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await apiClient.get<Document>(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      throw error;
    }
  },

  // Create a new document
  async createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    try {
      const response = await apiClient.post<Document>('/api/documents', documentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
    }
  },

  // Update an existing document
  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'userId' | 'createdAt'>>): Promise<Document> {
    try {
      const response = await apiClient.put<Document>(`/api/documents/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update document ${id}:`, error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/documents/${id}`);
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      throw error;
    }
  },

  // Get recent documents (limit to 5 most recent)
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
  },

  // Get document statistics
  async getDocumentStats(): Promise<{
    total: number;
    public: number;
    private: number;
  }> {
    try {
      const documents = await this.getDocuments();
      return {
        total: documents.length,
        public: documents.filter(doc => doc.isPublic).length,
        private: documents.filter(doc => !doc.isPublic).length,
      };
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
      throw error;
    }
  },

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
  },
};

export default documentService;
