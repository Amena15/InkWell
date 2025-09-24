import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email to support
    await resend.emails.send({
      from: 'InkWell Support <support@inkwell.com>',
      to: 'support@inkwell.com',
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
      html: `
        <div>
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: 'InkWell Support <support@inkwell.com>',
      to: email,
      subject: 'We\'ve received your message',
      text: `
        Dear ${name},

        Thank you for contacting InkWell. We've received your message and our team will get back to you as soon as possible.

        Here's a copy of your message:
        ${message}

        Best regards,
        The InkWell Team
      `,
      html: `
        <div>
          <p>Dear ${name},</p>
          <p>Thank you for contacting InkWell. We've received your message and our team will get back to you as soon as possible.</p>
          <p>Here's a copy of your message:</p>
          <blockquote style="border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; font-style: italic;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <p>Best regards,<br>The InkWell Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}
