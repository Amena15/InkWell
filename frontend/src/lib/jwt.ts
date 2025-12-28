import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

type TokenPayload = {
  userId: string;
  email?: string;
  purpose?: string;
};

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export async function getAuthUser(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  
  const payload = verifyJwt(token);
  if (!payload) return null;
  
  return { id: payload.userId };
}
