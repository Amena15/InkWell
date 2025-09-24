import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response that will clear the auth token
    const response = NextResponse.json(
      { message: 'Successfully logged out' },
      { status: 200 }
    );

    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
