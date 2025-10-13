import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = { id: "test", email: "test@example.com", name: "Test User" };
    

    return NextResponse.json({
      message: 'This is a protected route',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Protected route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
