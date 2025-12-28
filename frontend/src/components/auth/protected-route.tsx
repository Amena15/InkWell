"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

type UserWithRole = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export function ProtectedRoute({
  children,
  requiredRole,
  loadingComponent = (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
  unauthorizedComponent = (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-muted-foreground">
        You don't have permission to view this page.
      </p>
    </div>
  ),
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login but save the current route to return to after login
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <>{loadingComponent}</>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    // Return the loading component or unauthorized component while redirecting
    return <>{loadingComponent}</>;
  }

  const userRole = session.user?.role;

  // Check if the user has the required role if specified
  if (requiredRole && userRole !== requiredRole) {
    return <>{unauthorizedComponent}</>;
  }

  return <>{children}</>;
}

export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function WithAuthComponent(props: T) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...(props as any)} />
      </ProtectedRoute>
    );
  };
}

// Usage example:
// <ProtectedRoute>
//   <Dashboard />
// </ProtectedRoute>

// With role-based access:
// <ProtectedRoute requiredRole="admin">
//   <AdminDashboard />
// </ProtectedRoute>
