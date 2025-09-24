import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  token: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // In development, log the email to console
  if (process.env.NODE_ENV === 'development') {
    console.log('=== EMAIL SENDING ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    console.log('====================');
    return { success: true, message: 'Email logged to console in development' };
  }

  // In production, require SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const fromName = process.env.EMAIL_FROM_NAME || 'InkWell';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@inkwell.com';

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration is missing');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendPasswordResetEmail({ email, token }: SendPasswordResetEmailParams): Promise<{ success: boolean; message: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  
  return sendEmail({
    to: email,
    subject: 'Reset your InkWell password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
        ">
          Reset Password
        </a>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
    text: `To reset your password, click the following link: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
  });
}
