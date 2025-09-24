import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();

  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await nextAuthSignIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign in');
    },
  });

  const register = useMutation({
    mutationFn: async (data: { name?: string; email: string; password: string }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || '',
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return {
    login: login.mutate,
    isLoggingIn: login.isPending,
    register: register.mutate,
    isRegistering: register.isPending,
    logout,
  };
}
