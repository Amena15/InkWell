import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Invalidate the session
  const response = NextResponse.json({ message: 'Successfully signed out' });
  
  // Clear the session cookie
  response.cookies.set({
    name: 'next-auth.session-token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
