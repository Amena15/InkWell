import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth-options';
import type { User } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userData = session.user as User & { role?: string };

    return NextResponse.json({
      message: 'This is a protected route',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Protected route error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
