import { getSession } from 'next-auth/react';

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

    const response = await fetch(`/api${endpoint}`, {
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
