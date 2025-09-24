import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { VerificationEmail } from '@/emails/verification-email';
import { ResetPasswordEmail } from '@/emails/reset-password-email';

// Ensure required environment variables are set
const EMAIL_SERVER_HOST = process.env.EMAIL_SERVER_HOST || '';
const EMAIL_SERVER_PORT = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
const EMAIL_SERVER_USER = process.env.EMAIL_SERVER_USER || '';
const EMAIL_SERVER_PASSWORD = process.env.EMAIL_SERVER_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'InkWell';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  host: EMAIL_SERVER_HOST,
  port: EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: EMAIL_SERVER_USER,
    pass: EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  const emailHtml = await render(
    VerificationEmail({ verificationUrl, email })
  ) as string;

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    subject: 'Verify your email',
    html: emailHtml,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const emailHtml = await render(
    ResetPasswordEmail({ resetUrl, email })
  ) as string;

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    subject: 'Reset your password',
    html: emailHtml,
  });
}
