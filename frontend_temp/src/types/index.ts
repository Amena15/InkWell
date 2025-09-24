// Common document type
export interface Document {
  id: number | string
  name: string
  updatedAt: Date
  size?: number
  type?: string
  url?: string
}

// User type
export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// API response types
export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
}

// Dashboard statistics
export interface DashboardStats {
  totalDocuments: number
  totalStorage: number
  recentDocuments: Document[]
  storageQuota?: number
  storageUsed?: number
}

// Toast message type
export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Form field type
export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

// API error response
export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: Record<string, string[]>
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Search parameters
export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, string | string[]>
}
