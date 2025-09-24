import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCookie } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Define the shape of our auth responses
type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
};

// Extend AxiosInstance to include custom auth methods
interface CustomAxiosInstance extends AxiosInstance {
  auth: {
    login: (credentials: { email: string; password: string }) => Promise<AxiosResponse<AuthResponse>>;
    signup: (userData: { email: string; password: string; name: string }) => Promise<AxiosResponse<AuthResponse>>;
    me: () => Promise<AxiosResponse<{ user: Omit<{ id: string; email: string; name: string; role: string; avatar?: string }, 'password'> }>>;
    logout: () => Promise<AxiosResponse<{ success: boolean }>>;
  };
}

// Create a wrapper function that will use mocks when needed
const createApiClient = (): CustomAxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }) as CustomAxiosInstance;

  // Add auth methods to the instance
  instance.auth = {
    login: (credentials) => instance.post('/api/auth/login', credentials),
    signup: (userData) => instance.post('/api/auth/signup', userData),
    me: () => instance.get('/api/auth/me'),
    logout: () => instance.post('/api/auth/logout'),
  };

  // Add a request interceptor to add the auth token to requests
  instance.interceptors.request.use(
    (config) => {
      const token = getCookie('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add a response interceptor to handle errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      
      // If the error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const response = await instance.post('/api/auth/refresh-token');
          const { token } = response.data;
          
          // Update the token in cookies
          document.cookie = `auth-token=${token}; path=/; samesite=lax`;
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return instance(originalRequest);
        } catch (error) {
          // If refresh token fails, clear the auth state
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export the API client instance
const apiClient = createApiClient();

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    apiClient.post<AuthResponse>('/api/auth/login', credentials),
  signup: (userData: { email: string; password: string; name: string }) => 
    apiClient.post<AuthResponse>('/api/auth/signup', userData),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get<{ user: any }>('/api/auth/me'),
};

// Documents API
export const documentsAPI = {
  getAll: () => apiClient.get('/api/documents'),
  getById: (id: string) => apiClient.get(`/api/documents/${id}`),
  create: (data: { title: string; content: string; isPublic?: boolean }) => 
    apiClient.post('/api/documents', data),
  update: (id: string, data: { title?: string; content?: string; isPublic?: boolean }) => 
    apiClient.put(`/api/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/documents/${id}`),
};

// AI API
export const aiAPI = {
  analyzeDocument: (documentId: string) => 
    apiClient.post(`/api/ai/analyze/${documentId}`),
  chat: (documentId: string, message: string) => 
    apiClient.post(`/api/ai/chat/${documentId}`, { message }),
};

// Metrics API
export const metricsAPI = {
  getDocumentMetrics: () => apiClient.get('/api/metrics/documents'),
  getUserActivity: () => apiClient.get('/api/metrics/activity'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiClient.get('/api/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/api/notifications/read-all'),
};

export default apiClient;
