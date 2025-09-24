import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, don't reveal if the email exists or not
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the reset token to the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      message: 'If an account with that email exists, you will receive a password reset link',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function POSTReset(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if the email exists or not
      return NextResponse.json(
        { message: 'If an account with that email exists, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the reset token to the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: 'If an account with that email exists, you will receive a password reset link',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
