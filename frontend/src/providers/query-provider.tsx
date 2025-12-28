'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ReactNode = React.ReactNode;

export function QueryProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
