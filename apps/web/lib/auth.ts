import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { mockDB } from './mock-db';

export interface AuthUser {
  id: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  role: string;
  lang: string;
  verifiedFlags: any;
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret-key'
    ) as jwt.JwtPayload;

    if (!decoded.sub) {
      return null;
    }

    const user = mockDB.findUserById(decoded.sub as string);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      lang: user.lang,
      verifiedFlags: user.verifiedFlags
    };

  } catch (error) {
    console.error('Auth Error:', error);
    return null;
  }
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign(
    {
      sub: userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      iss: 'homesprint',
      aud: 'homesprint-api'
    },
    process.env.JWT_SECRET || 'development-secret-key',
    { algorithm: 'HS256' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    },
    process.env.JWT_SECRET || 'development-secret-key',
    { algorithm: 'HS256' }
  );
}
