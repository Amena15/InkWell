"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "@/components/providers/session-provider";
import { NavigationProvider } from "@/context/navigation-context";
import { Toaster as SonnerToaster } from 'sonner';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <NavigationProvider>
            {children}
            <SonnerToaster position="top-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </NavigationProvider>
        </NextThemesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

// Export the Toaster component
export const Toaster = SonnerToaster;
