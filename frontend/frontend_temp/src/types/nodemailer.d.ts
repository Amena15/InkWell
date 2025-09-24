declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface MailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
    envelope: any;
    accepted: string[];
    rejected: string[];
    pending: string[];
    response: string;
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
  }

  export function createTransport(
    transport: TransportOptions | string,
    defaults?: any
  ): Transporter;

  export function getTestMessageUrl(info: SentMessageInfo): string | false;
  export function createTestAccount(): Promise<{
    user: string;
    pass: string;
    smtp: { host: string; port: number; secure: boolean };
  }>;
}
