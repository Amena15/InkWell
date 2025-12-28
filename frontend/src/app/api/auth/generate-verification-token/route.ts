import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a verification token
    const token = signJwt({
      userId: user.id,
      email: user.email,
      purpose: 'email-verification'
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating verification token:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification token' },
      { status: 500 }
    );
  }
}
