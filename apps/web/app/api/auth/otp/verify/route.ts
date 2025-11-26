import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { mockDB } from '../../../../../lib/mock-db';

const VerifySchema = z.object({
  phone: z.string().regex(/^\+972\d{9}$/, 'Invalid Israeli phone number'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  name: z.string().optional(),
  role: z.enum(['SEEKER', 'LISTER', 'ADMIN']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, name, role } = VerifySchema.parse(body);

    // In production, verify OTP from SMS service or Redis cache
    // For MVP, we'll accept any 6-digit OTP for development
    const isValidOtp = process.env.NODE_ENV === 'development' || otp === '123456';

    if (!isValidOtp) {
      return NextResponse.json({
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP code'
        }
      }, { status: 401 });
    }

    // Find or create user
    let user = mockDB.findUserByPhone(phone);
    const isNewUser = !user;

    if (!user) {
      // Create new user
      user = mockDB.createUser({
        phone,
        name: name || undefined,
        role: role || 'SEEKER', // Default role
        verifiedFlags: { phone_verified: true }
      });
    } else {
      // Update existing user verification
      const updates: any = {
        verifiedFlags: { ...user.verifiedFlags, phone_verified: true }
      };
      if (name) updates.name = name;
      if (role) updates.role = role;
      user = mockDB.updateUser(user.id, updates)!;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
        iss: 'homesprint',
        aud: 'homesprint-api'
      },
      process.env.JWT_SECRET || 'development-secret-key',
      { algorithm: 'HS256' }
    );

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      process.env.JWT_SECRET || 'development-secret-key',
      { algorithm: 'HS256' }
    );

    // Update user's last login (mock - no timestamp tracking in mock DB)

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        lang: user.lang,
        verifiedFlags: user.verifiedFlags,
        profile: user.Profile,
        isNewUser
      },
      redirectTo: isNewUser ? '/onboarding' : '/me'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          fields: error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    console.error('OTP Verification Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify OTP'
      }
    }, { status: 500 });
  }
}
