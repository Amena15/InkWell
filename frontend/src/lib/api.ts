import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestBody = BodyInit | Record<string, any> | undefined;

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  token?: string;
  isFormData?: boolean;
  headers?: Record<string, string>;
  body?: RequestBody;
}

interface SessionWithToken {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken?: string;
  expires: string;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.message || `HTTP error! status: ${response.status}` 
      };
    }

    const responseData = await response.json().catch(() => ({}));
    return { data: responseData };
  } catch (error) {
    console.error('API Request Error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function api<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: string }> {
  const { token, isFormData, headers, body, ...fetchOptions } = options;
  
  // Get session if token is not provided
  const session = token ? { accessToken: token } : (await getSession()) as SessionWithToken | null;
  
  const defaultHeaders: Record<string, string> = {};
  
  // Set content type if not FormData
  if (!isFormData && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if user is authenticated
  if (session?.accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${session.accessToken}`;
  }

  try {
    const requestBody = body instanceof FormData || typeof body === 'string' || body === undefined 
      ? body 
      : JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...fetchOptions,
      body: requestBody,
      headers: {
        ...defaultHeaders,
        ...(headers || {}),
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return {};
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || 'An error occurred';
      return { error: errorMessage };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error occurred' };
  }
}

// Helper methods for common HTTP methods
export const apiClient = {
  get: <T = any>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}) =>
    api<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(
    endpoint: string,
    body?: RequestBody,
    options: Omit<RequestOptions, 'body'> = {}
  ) =>
    api<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
      isFormData: body instanceof FormData,
    }),
    
  put: <T = any>(
    endpoint: string,
    body?: RequestBody,
    options: Omit<RequestOptions, 'body'> = {}
  ) =>
    api<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    }),
    
  delete: <T = any>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}) =>
    api<T>(endpoint, { ...options, method: 'DELETE' }),
    
  patch: <T = any>(
    endpoint: string,
    body?: RequestBody,
    options: Omit<RequestOptions, 'body'> = {}
  ) =>
    api<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    }),
};

export const apiUtil = {
  get: <T = any>(path: string, options?: RequestInit) => 
    apiRequest<T>('GET', path, undefined, options),
    
  post: <T = any>(path: string, data?: any, options?: RequestInit) => 
    apiRequest<T>('POST', path, data, options),
    
  put: <T = any>(path: string, data?: any, options?: RequestInit) => 
    apiRequest<T>('PUT', path, data, options),
    
  delete: <T = any>(path: string, options?: RequestInit) => 
    apiRequest<T>('DELETE', path, undefined, options),
};

export default apiUtil;
