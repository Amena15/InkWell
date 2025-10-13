import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import { NavBar } from '@/components/navbar';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NavigationProvider } from '@/context/navigation-context';
import { authOptions } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InkWell',
  description: 'Your personal writing space',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://avatars.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.google.com; frame-src 'self' https://accounts.google.com" />
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background')}>
        <QueryProvider>
          <Providers session={session}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavigationProvider>
                <AuthProvider>
                  <NavBar />
                  <main className="container mx-auto py-8 px-4">
                    {children}
                  </main>
                </AuthProvider>
                <Toaster position="top-center" />
              </NavigationProvider>
            </ThemeProvider>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
