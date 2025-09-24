export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
  views?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface DocumentCreateInput {
  title: string;
  content?: string;
  isPublic?: boolean;
}

export interface DocumentUpdateInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
}
