import * as React from 'react';
import { Head, Html, Text, Button, Section, Container } from '@react-email/components';

interface VerificationEmailProps {
  verificationUrl: string;
  email: string;
}

export function VerificationEmail({ verificationUrl, email }: VerificationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Verify your email address</title>
      </Head>
      <Container style={container}>
        <Text style={logo}>InkWell</Text>
        <Text style={heading}>Verify your email address</Text>
        <Text style={paragraph}>
          Thanks for signing up for InkWell! Please verify your email address by clicking the button below:
        </Text>
        <Section style={buttonContainer}>
          <Button href={verificationUrl} style={button}>
            Verify Email
          </Button>
        </Section>
        <Text style={paragraph}>
          If you didn't create an account with InkWell, you can safely ignore this email.
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
