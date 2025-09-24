import * as React from 'react';
import { Head, Html, Text, Button, Section, Container } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetUrl: string;
  email: string;
}

export function ResetPasswordEmail({ resetUrl, email }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head>
        <title>Reset your password</title>
      </Head>
      <Container style={container}>
        <Text style={logo}>InkWell</Text>
        <Text style={heading}>Reset your password</Text>
        <Text style={paragraph}>
          We received a request to reset the password for your InkWell account. Click the button below to set a new password:
        </Text>
        <Section style={buttonContainer}>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
        </Section>
        <Text style={paragraph}>
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have questions.
        </Text>
        <Text style={footer}>
          Sent to: {email}
        </Text>
      </Container>
    </Html>
  );
}

const container = {
  padding: '20px',
  maxWidth: '580px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif',
  lineHeight: '1.5',
  color: '#333',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2563eb',
  marginBottom: '20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0',
};

const paragraph = {
  margin: '16px 0',
  fontSize: '16px',
  lineHeight: '1.5',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const footer = {
  marginTop: '32px',
  fontSize: '14px',
  color: '#6b7280',
};
