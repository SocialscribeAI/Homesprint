import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { userService } from './db-service';
import { createClient } from './supabase/server';
import { cookies } from 'next/headers';

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
    // First check for Supabase Auth session (preferred)
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (supabaseUser) {
      // Fetch full user profile from DB
      const user = await userService.findById(supabaseUser.id, supabase);
      
      if (user) {
        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          lang: user.lang,
          verifiedFlags: user.verified_flags
        };
      }
    }

    // Fallback to JWT token check (for legacy/custom auth)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'development-secret-key'
      ) as jwt.JwtPayload;

      if (decoded.sub) {
        const user = await userService.findById(decoded.sub as string, supabase);

        if (user) {
          return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            role: user.role,
            lang: user.lang,
            verifiedFlags: user.verified_flags
          };
        }
      }
    }

    return null;

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
