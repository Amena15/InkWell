import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/login?error=AuthenticationError', process.env.NEXTAUTH_URL));
}

export async function POST() {
  return NextResponse.json(
    { error: 'Authentication error occurred' },
    { status: 401 }
  );
}
