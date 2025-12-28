import * as React from 'react';
import { Head, Html, Text, Button, Section, Container, Heading, Hr } from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  date?: string;
}

export const ContactEmail = ({
  name,
  email,
  subject,
  message,
  date = new Date().toLocaleString(),
}: ContactEmailProps) => {
  return (
    <Html>
      <Head>
        <title>New Contact Message</title>
      </Head>
      <Section style={main}>
        <Container style={container}>
          <Heading style={heading}>New Contact Message</Heading>
          <Text style={paragraph}>
            You've received a new message from your website contact form.
          </Text>
          
          <Section style={contentSection}>
            <Text style={label}>From:</Text>
            <Text style={value}>{name} ({email})</Text>
            
            <Text style={label}>Subject:</Text>
            <Text style={value}>{subject}</Text>
            
            <Text style={label}>Date:</Text>
            <Text style={value}>{date}</Text>
            
            <Text style={label}>Message:</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>
          
          <Hr style={hr} />
        </Container>
      </Section>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#000',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#333',
  textAlign: 'center' as const,
};

const contentSection = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  margin: '8px 0 4px 0',
};

const value = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
};

const messageStyle = {
  fontSize: '14px',
  color: '#333',
  margin: '0 0 0 0',
  lineHeight: '1.5',
  whiteSpace: 'pre-line' as const,
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

export default ContactEmail;