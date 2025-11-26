import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../../packages/db/src';

// Rate limiting (simplified for MVP)
const otpRequests = new Map<string, { count: number; resetTime: number }>();

const RequestSchema = z.object({
  phone: z.string().regex(/^\+972\d{9}$/, 'Invalid Israeli phone number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = RequestSchema.parse(body);

    // Rate limiting: 5 requests per hour per phone
    const now = Date.now();
    const windowStart = now - (60 * 60 * 1000); // 1 hour ago

    if (otpRequests.has(phone)) {
      const requestData = otpRequests.get(phone)!;
      if (requestData.resetTime > now) {
        if (requestData.count >= 5) {
          return NextResponse.json(
            { error: { code: 'RATE_LIMITED', message: 'Too many OTP requests. Try again later.' } },
            { status: 429 }
          );
        }
        requestData.count++;
      } else {
        otpRequests.set(phone, { count: 1, resetTime: now + (60 * 60 * 1000) });
      }
    } else {
      otpRequests.set(phone, { count: 1, resetTime: now + (60 * 60 * 1000) });
    }

    // Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, integrate with SMS service (MessageBird/Twilio)
    // For MVP, we'll log the OTP and simulate sending
    console.log(`📱 OTP for ${phone}: ${otp}`);

    // Store OTP in database (in production, use Redis with TTL)
    // For MVP, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // In production, don't expose this
      debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
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

    console.error('OTP Request Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send OTP'
      }
    }, { status: 500 });
  }
}

