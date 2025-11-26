import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { profileService, userService } from '@/lib/db-service';
import { getCurrentUser } from '@/lib/auth';

const ProfileSchema = z.object({
  budgetMin: z.number().int().positive().min(1000).max(50000),
  budgetMax: z.number().int().positive().min(1000).max(50000),
  moveInEarliest: z.string().datetime(),
  moveInLatest: z.string().datetime(),
  areas: z.array(z.string()).min(1).max(10),
  occupancyType: z.enum(['room', 'apartment']),
  lifestyle: z.object({
    smoking: z.enum(['no', 'occasional', 'regular']),
    pets: z.enum(['no', 'cats', 'dogs', 'both']),
    guests: z.enum(['rarely', 'occasionally', 'frequently']),
    cleaning: z.enum(['very_important', 'somewhat_important', 'flexible']),
    noise: z.enum(['quiet', 'moderate', 'lively']),
    religion: z.enum(['observant', 'traditional', 'secular'])
  }),
  bio: z.string().max(500).optional()
}).refine(data => data.budgetMin <= data.budgetMax, {
  message: "Minimum budget must be less than or equal to maximum budget",
  path: ["budgetMin"]
}).refine(data => new Date(data.moveInEarliest) <= new Date(data.moveInLatest), {
  message: "Earliest move-in date must be before latest date",
  path: ["moveInEarliest"]
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await profileService.get(user.id);

    if (!profile) {
      return NextResponse.json({
        profile: null,
        message: 'Profile not found. Please complete your profile.'
      });
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Get Profile Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve profile'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ProfileSchema.parse(body);

    const profile = await profileService.upsert({
      user_id: user.id,
      budget_min: validatedData.budgetMin,
      budget_max: validatedData.budgetMax,
      move_in_earliest: validatedData.moveInEarliest,
      move_in_latest: validatedData.moveInLatest,
      areas: validatedData.areas,
      occupancy_type: validatedData.occupancyType,
      lifestyle: validatedData.lifestyle,
      bio: validatedData.bio,
    });

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness(profile);
    await userService.update(user.id, { profile_completeness: completeness });

    return NextResponse.json({
      profile: { ...profile, completeness },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile data',
          fields: error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    console.error('Update Profile Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile'
      }
    }, { status: 500 });
  }
}

function calculateProfileCompleteness(profile: any): number {
  let score = 0;
  const maxScore = 100;

  // Budget (20 points)
  if (profile.budget_min && profile.budget_max) score += 20;

  // Move-in dates (15 points)
  if (profile.move_in_earliest && profile.move_in_latest) score += 15;

  // Areas (15 points)
  if (profile.areas && profile.areas.length > 0) score += 15;

  // Occupancy type (10 points)
  if (profile.occupancy_type) score += 10;

  // Lifestyle preferences (20 points)
  if (profile.lifestyle) {
    const lifestyleKeys = Object.keys(profile.lifestyle);
    const completedLifestyle = lifestyleKeys.filter(key => profile.lifestyle[key]).length;
    score += Math.round((completedLifestyle / lifestyleKeys.length) * 20);
  }

  // Bio (10 points)
  if (profile.bio && profile.bio.trim().length > 0) score += 10;

  return Math.min(score, maxScore);
}

