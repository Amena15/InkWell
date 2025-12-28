import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({ 
      isAuthenticated: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Authentication test failed', details: error },
      { status: 500 }
    );
  }
}
