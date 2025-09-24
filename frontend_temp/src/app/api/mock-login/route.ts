import { NextResponse } from 'next/server';

type LoginCredentials = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginCredentials;
    
    // Simple validation - in a real app, you would verify credentials against a database
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock user data - in a real app, this would come from your database
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    // Mock token - in a real app, you would generate a JWT or similar
    const mockToken = 'mock-jwt-token';

    // Set an HTTP-only cookie with the token
    const response = NextResponse.json(
      { user: mockUser, token: mockToken },
      { status: 200 }
    );

    // Set the token in an HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: mockToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
