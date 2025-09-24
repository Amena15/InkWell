import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/lib/api-client';

type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Store token in localStorage for axios
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({ email, password, name });
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Store token in localStorage for axios
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set(initialState);
        // Clear auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      },

      clearError: () => set({ error: null }),
      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => {
        set({ token, isAuthenticated: !!token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state from localStorage if available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    // Set the token in the auth store
    const { setToken } = useAuthStore.getState();
    setToken(token);
  }
}
