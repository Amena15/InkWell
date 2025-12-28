/**
 * API Client Configuration
 * This client handles all API requests for the application
 * Uses relative paths to communicate with the frontend's own API routes
 * Implements automatic authentication token attachment
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCookie } from './cookies';

// Use relative paths to hit the frontend's own API routes
// Since this is a Next.js app, we can use relative paths to access local API routes
const API_BASE_URL = '';

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
    signup: (userData) => instance.post('/api/auth/register', userData), // Changed to register
    me: () => instance.get('/api/auth/me'),
    logout: () => instance.post('/api/auth/logout'),
  };

  // Add a request interceptor to add the auth token to requests
  instance.interceptors.request.use(
    (config) => {
      // First try to get token from cookies
      const cookieToken = getCookie('auth-token');

      // If not in cookies, try localStorage (fallback)
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const token = cookieToken || localStorageToken;

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
      // If the error is 401, redirect to login
      if (error.response?.status === 401) {
        // Clear the auth state from both cookies and localStorage
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        window.location.href = '/login';
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
    apiClient.post<AuthResponse>('/api/auth/register', userData), // Changed to register
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get<{ user: any }>('/api/auth/me'),
};

// Documents API - using relative paths to frontend API routes
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
