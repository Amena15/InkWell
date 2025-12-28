import { NextResponse } from 'next/server';
import authOptions from '@/lib/auth-options';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}
