import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

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

    // Check if the email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate a new verification token
    const verificationToken = signJwt({ 
      userId: user.id, 
      email: user.email 
    });

    // In a real app, you would send an email with this token
    console.log('New verification token:', verificationToken);
    
    // For now, we'll just log it and return the token in the response
    // In production, you would send an email with a verification link
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent',
      token: verificationToken // Only for development
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
