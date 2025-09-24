import { NextResponse } from 'next/server';

type SignupData = {
  name: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as SignupData;
    
    // Simple validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Mock user data - in a real app, this would be saved to a database
    const mockUser = {
      id: `user-${Math.floor(Math.random() * 10000)}`,
      name,
      email,
    };

    // Mock token - in a real app, you would generate a JWT or similar
    const mockToken = `mock-jwt-token-${Date.now()}`;

    // Create response with user data
    const response = NextResponse.json(
      { user: mockUser, token: mockToken },
      { status: 201 }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
