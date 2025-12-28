import { PrismaClient, User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
    }
  }
}

const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRES_IN'] as const;
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

const prisma = new PrismaClient();

type PublicUser = Omit<PrismaUser, 'password'> & { email: string };

function assertHasEmail(user: PrismaUser): asserts user is PrismaUser & { email: string } {
  if (!user.email) {
    throw new Error('User email is missing');
  }
}

function assertHasCredentials(user: PrismaUser): asserts user is PrismaUser & { email: string; password: string } {
  if (!user.email || !user.password) {
    throw new Error('User credentials are missing');
  }
}

function sanitizeUser(user: PrismaUser & { email: string }): PublicUser {
  const { password: _, ...rest } = user;
  return {
    ...rest,
    email: user.email,
  };
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string, name?: string): Promise<{ user: PublicUser; token: string }> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    assertHasEmail(user);
    const token = this.generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    assertHasCredentials(user);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  private generateToken(user: PrismaUser & { email: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async validateToken(token: string): Promise<PrismaUser | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      return this.prisma.user.findUnique({ where: { id: payload.userId } });
    } catch (error) {
      return null;
    }
  }
}
