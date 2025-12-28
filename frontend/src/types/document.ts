export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  user?: User;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  wordCount?: number;
  tags?: string[]; // Will be handled as JSON string in DB but parsed in code
  folderId?: string;
  thumbnailUrl?: string;
}

export interface DocumentStats {
  total: number;
  shared: number;
  recentSearches: number;
  lastUpdated: string;
  storageUsed: number;
  documentsByType: Array<{
    type: string;
    count: number;
  }>;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DocumentCreatePayload {
  title: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
  folderId?: string;
}

export interface DocumentUpdatePayload {
  title?: string;
  content?: string;
  isPublic?: boolean;
  tags?: string[];
  folderId?: string | null;
}
