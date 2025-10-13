import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateTokenSchema = z.object({
  token: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = validateTokenSchema.safeParse({
      token: searchParams.get('token'),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid request',
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { token } = result.data;

    // Find user with this token and check if it's still valid
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Error validating token' },
      { status: 500 }
    );
  }
}
