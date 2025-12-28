import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/jwt';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Verification token is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = verifyEmailSchema.parse(body);

    // Verify the JWT token
    const payload = verifyJwt(token);
    
    if (!payload || payload.email !== email) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
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

    // Update the user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired (24 hours)
    const hasExpired = new Date(verificationToken!.expires) < new Date();
    if (hasExpired) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Find user by identifier (should be the email)
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken!.identifier
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerified: new Date() },
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying your email' },
      { status: 500 }
    );
  }
}
