import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Extend the JWT type to match the one in auth-options.ts
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    accessToken?: string;
  }
}

// Public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/features',
  '/terms',
  '/privacy',
  '/_vercel',
  '/sitemap.xml',
  '/robots.txt'
];

// Paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/documents'];

// Admin-only paths
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and API routes
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );

  // Allow access to public paths and the root path
  if (isPublicPath || pathname === '/') {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // For API routes, return early
  if (pathname.startsWith('/api/')) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return NextResponse.next();
  }

  // Handle protected routes
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // If no token and trying to access protected path, redirect to login
  if ((isProtectedPath || isAdminPath) && !token) {
    const loginUrl = new URL('/login', request.url);
    // Store the intended URL to redirect back after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminPath && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
