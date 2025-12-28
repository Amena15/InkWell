import { DefaultSession, NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// Define our custom User type
type Role = 'USER' | 'ADMIN';

interface CustomUser extends NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  token?: string;
}

// Extend built-in types for NextAuth
declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: Role;
    token?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Call backend API for authentication
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.BACKEND_API_URL ||
            'http://localhost:3001';

          const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password
          });

          const { user, token } = response.data;

          if (!user || !token) {
            throw new Error('Invalid credentials');
          }

          // Store the token in localStorage for API calls
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }

          // Return user with role and token
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0], // Use email prefix as name if not provided
            role: user.role || 'USER',
            token: token,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.response?.data?.error || error.message || 'Invalid email or password');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role || 'USER',
          accessToken: user.token,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session.user exists, even if token is null
      session.user = {
        id: token?.id as string,
        role: token?.role as 'USER' | 'ADMIN' || 'USER',
        name: token?.name || session?.user?.name || null,
        email: token?.email || session?.user?.email || null,
        image: token?.picture || token?.image || session?.user?.image || null,
      };

      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/api/auth/error', // Custom error page
    newUser: '/register',
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('Auth error:', { code, metadata });
    },
    warn(code) {
      console.warn('Auth warning:', code);
    },
    debug(code, metadata) {
      console.debug('Auth debug:', { code, metadata });
    },
  },
  // Session configuration is already set at the top level with strategy: 'jwt'
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
