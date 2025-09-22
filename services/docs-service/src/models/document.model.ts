// Types for document-related operations

export type DocumentEventType = 'DOC_CREATED' | 'DOC_UPDATED' | 'DOC_DELETED';

export interface CreateDocumentInput {
  title: string;
  content: string;
  projectId: string;
  ownerId: string;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for backward compatibility
export type DocumentWithContent = Document;

export interface DocumentEvent {
  eventType: DocumentEventType;
  documentId: string;
  projectId: string;
  ownerId: string;
  metadata: {
    title: string;
    updatedFields?: string[];
  };
  timestamp: Date;
}
