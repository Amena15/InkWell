"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster as SonnerToaster } from 'sonner';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <SonnerToaster
          position="top-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-background text-foreground',
              title: 'text-sm font-medium',
              description: 'text-sm opacity-90',
              actionButton: '!bg-primary !text-primary-foreground',
              cancelButton: '!bg-muted !text-muted-foreground',
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </NextThemesProvider>
    </QueryClientProvider>
  );
}

// Export the Toaster component
export const Toaster = SonnerToaster;
