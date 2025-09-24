import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Types
type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

type Document = {
  id: string;
  title: string;
  content: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
};

type AuthResponse = {
  user: Omit<User, 'password'>;
  token: string;
};

// Mock data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
  role: 'user',
  avatar: 'https://i.pravatar.cc/150?img=1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Welcome to InkWell',
    content: 'This is your first document. Start writing!',
    userId: 'user-123',
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
let users: User[] = [mockUser];
let documents: Document[] = [...mockDocuments];

// Helper function to create axios response
const createAxiosResponse = <T>(data: T, status = 200): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers,
    config: {
      headers,
      url: '',
      method: 'GET',
    },
  };
};

// Create a mock Axios instance
const createMockAxiosInstance = (): AxiosInstance => {
  const instance = {
    defaults: {
      headers: new AxiosHeaders(),
    },
    interceptors: {
      request: {
        use: () => 0,
        eject: () => {},
        clear: () => {},
      },
      response: {
        use: () => 0,
        eject: () => {},
        clear: () => {},
      },
    },
    getUri: () => '',
    request: async <T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> => {
      // Create a new AxiosHeaders instance
      const headers = new AxiosHeaders();
      
      // Convert to InternalAxiosRequestConfig with proper headers
      const internalConfig: InternalAxiosRequestConfig = {
        ...config,
        headers: config.headers ? new AxiosHeaders(config.headers as any) : new AxiosHeaders(),
        method: (config.method || 'get').toUpperCase() as any,
        url: config.url || '',
      };

      // Handle different HTTP methods
      const method = internalConfig.method?.toLowerCase() || 'get';
      const url = internalConfig.url || '';
      
      // Handle GET requests
      if (method === 'get') {
        // Handle documents list
        if (url === '/api/documents') {
          return createAxiosResponse<Document[]>(documents) as R;
        }
        
        // Handle single document
        const docMatch = url.match(/^\/api\/documents\/([^\/]+)$/);
        if (docMatch) {
          const doc = documents.find(d => d.id === docMatch[1]);
          if (!doc) {
            throw new AxiosError(
              'Document not found',
              '404',
              internalConfig,
              undefined,
              {
                status: 404,
                statusText: 'Not Found',
                config: internalConfig,
                headers: new AxiosHeaders(),
                data: { message: 'Document not found' },
              }
            );
          }
          return createAxiosResponse<Document>(doc) as R;
        }
      }
      
      // Handle POST requests
      if (method === 'post') {
        // Handle document creation
        if (url === '/api/documents' && internalConfig.data) {
          const newDoc: Document = {
            id: `doc-${uuidv4()}`,
            title: internalConfig.data.title,
            content: internalConfig.data.content || '',
            userId: 'user-123',
            isPublic: internalConfig.data.isPublic || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          documents.push(newDoc);
          return createAxiosResponse<Document>(newDoc, 201) as R;
        }
      }
      
      // Handle PUT requests
      if (method === 'put') {
        const updateMatch = url.match(/^\/api\/documents\/([^\/]+)$/);
        if (updateMatch && internalConfig.data) {
          const docIndex = documents.findIndex(d => d.id === updateMatch[1]);
          if (docIndex === -1) {
            throw new Error('Document not found');
          }
          
          const updatedDoc = {
            ...documents[docIndex],
            ...internalConfig.data,
            updatedAt: new Date().toISOString(),
          };
          
          documents[docIndex] = updatedDoc;
          return createAxiosResponse<Document>(updatedDoc) as R;
        }
      }
      
      // Handle DELETE requests
      if (method === 'delete') {
        const deleteMatch = url.match(/^\/api\/documents\/([^\/]+)$/);
        if (deleteMatch) {
          const docIndex = documents.findIndex(d => d.id === deleteMatch[1]);
          if (docIndex === -1) {
            throw new Error('Document not found');
          }
          
          documents.splice(docIndex, 1);
          return createAxiosResponse({ success: true }) as R;
        }
      }
      
      throw new Error(`Mock API route not handled: ${method.toUpperCase()} ${url}`);
    },
    get: function <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
      return this.request<T, R>({ ...config, method: 'GET', url });
    },
    delete: function <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
      return this.request<T, R>({ ...config, method: 'DELETE', url });
    },
    head: function <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
      return this.request<T, R>({ ...config, method: 'HEAD', url });
    },
    options: function <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
      return this.request<T, R>({ ...config, method: 'OPTIONS', url });
    },
    post: function <T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R> {
      return this.request<T, R>({ ...config, method: 'POST', url, data });
    },
    put: function <T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R> {
      return this.request<T, R>({ ...config, method: 'PUT', url, data });
    },
    patch: function <T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R> {
      return this.request<T, R>({ ...config, method: 'PATCH', url, data });
    },
  };

  return instance as unknown as AxiosInstance;
};

// Create the mock API client
export const mockApiClient = createMockAxiosInstance();

// Add auth methods to the mock client
Object.assign(mockApiClient, {
  auth: {
    async login(credentials: { email: string; password: string }) {
      await delay(300);
      const user = users.find(u => u.email === credentials.email);
      
      if (!user || user.password !== credentials.password) {
        throw new AxiosError(
          'Invalid email or password',
          '401',
          { 
            headers: new AxiosHeaders(),
            method: 'POST',
            url: '/api/auth/login' 
          },
          {},
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: new AxiosHeaders(),
            config: { 
              headers: new AxiosHeaders(),
              method: 'POST',
              url: '/api/auth/login' 
            },
            data: { message: 'Invalid email or password' },
          }
        );
      }

      const { password, ...userWithoutPassword } = user;
      return createAxiosResponse<AuthResponse>({
        user: userWithoutPassword,
        token: 'mock-jwt-token',
      });
    },

    async signup(userData: { email: string; password: string; name: string }) {
      await delay(300);
      const existingUser = users.find(u => u.email === userData.email);
      
      if (existingUser) {
        throw new AxiosError(
          'Email already in use',
          '400',
          { 
            headers: new AxiosHeaders(),
            method: 'POST',
            url: '/api/auth/signup' 
          },
          {},
          {
            status: 400,
            statusText: 'Bad Request',
            headers: new AxiosHeaders(),
            config: { 
              headers: new AxiosHeaders(),
              method: 'POST',
              url: '/api/auth/signup' 
            },
            data: { message: 'Email already in use' },
          }
        );
      }

      const newUser: User = {
        id: `user-${uuidv4()}`,
        ...userData,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      const { password, ...userWithoutPassword } = newUser;
      
      return createAxiosResponse<AuthResponse>({
        user: userWithoutPassword,
        token: 'mock-jwt-token',
      });
    },

    async me() {
      await delay(300);
      const user = users[0];
      if (!user) {
        throw new AxiosError(
          'Unauthorized',
          '401',
          { 
            headers: new AxiosHeaders(),
            method: 'GET',
            url: '/api/auth/me' 
          },
          {},
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: new AxiosHeaders(),
            config: { 
              headers: new AxiosHeaders(),
              method: 'GET',
              url: '/api/auth/me' 
            },
            data: { message: 'Not authenticated' },
          }
        );
      }
      
      const { password, ...userWithoutPassword } = user;
      return createAxiosResponse({
        user: userWithoutPassword,
      });
    },

    async logout() {
      await delay(300);
      return createAxiosResponse({ success: true });
    },
  },
});

export default mockApiClient;
