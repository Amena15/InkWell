'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    update,
  };
}
