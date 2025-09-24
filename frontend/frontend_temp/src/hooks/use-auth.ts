'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { authAPI } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';
import { setCookie, deleteCookie } from '@/lib/cookies';

type User = {
  id: string;
  email: string;
  name: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
};

// Mock user data that matches our mock login
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

// Base URL for API requests
const API_URL = '/api';

export function useUser() {
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        // Check for token in cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        // In a real app, you would verify the token with your backend
        // For the mock, we'll just return the mock user
        return mockUser;
      } catch (error) {
        // Clear any invalid tokens
        if (typeof window !== 'undefined') {
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          localStorage.removeItem('user');
        }
        throw error; // Re-throw to trigger isError state
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retryDelay: 1000,
  });

  // Log errors for debugging
  useEffect(() => {
    if (isError) {
      console.error('Error fetching user:', error);
    }
  }, [isError, error]);

  return { 
    user: user as User | undefined, 
    isLoading: isLoading && !isError,
    isError,
    error
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(`${API_URL}/mock-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies to be set
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the auth state
      queryClient.setQueryData(['user'], data.user);
      
      // Redirect to the dashboard or the page the user was trying to access
      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to log in. Please check your credentials.',
        variant: 'destructive',
      });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await fetch(`${API_URL}/mock-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies to be set
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Signup failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the auth state
      queryClient.setQueryData(['user'], data.user);
      
      // Redirect to dashboard after successful signup
      router.push('/dashboard');
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/mock-logout`, {
        method: 'POST',
        credentials: 'include', // Important for cookies to be cleared
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Clear the user data from the cache
      queryClient.setQueryData(['user'], null);
      
      // Redirect to the login page
      router.push('/login');
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
    onError: () => {
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
