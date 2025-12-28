import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Invalid email or password',
          requiresVerification: data.requiresVerification,
          email: data.email,
        },
        { status: response.status },
      );
    }

    // For NextAuth compatibility, we don't set the token as a cookie here
    // NextAuth handles the session token internally
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 },
    );
  }
}
