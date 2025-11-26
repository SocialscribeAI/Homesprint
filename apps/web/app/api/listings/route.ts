import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listingService } from '@/lib/db-service';
import { getCurrentUser } from '@/lib/auth';

const SearchSchema = z.object({
  query: z.string().optional(),
  minRent: z.coerce.number().int().positive().optional(),
  maxRent: z.coerce.number().int().positive().optional(),
  type: z.enum(['room', 'apartment']).optional(),
  neighborhood: z.string().optional(),
  furnished: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date_desc']).default('relevance'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = SearchSchema.parse(Object.fromEntries(searchParams));

    const { page, limit, query, ...searchFilters } = filters;
    const offset = (page - 1) * limit;

    // Use Supabase service for listings
    let listings;
    if (query) {
      listings = await listingService.search(query);
    } else {
      listings = await listingService.getActive({
        neighborhood: searchFilters.neighborhood,
        minRent: searchFilters.minRent,
        maxRent: searchFilters.maxRent,
        type: searchFilters.type,
        furnished: searchFilters.furnished,
        limit,
        offset,
      });
    }

    const total = listings.length;

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid search parameters',
          fields: error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    console.error('Listings Search Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search listings'
      }
    }, { status: 500 });
  }
}

const CreateListingSchema = z.object({
  type: z.enum(['room', 'apartment']),
  address: z.string().min(5).max(200),
  neighborhood: z.string().min(2).max(50),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  rent: z.number().int().positive().max(50000),
  billsAvg: z.number().int().nonnegative().optional(),
  deposit: z.number().int().nonnegative().optional(),
  sizeM2: z.number().int().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  floor: z.number().int().min(0).optional(),
  elevator: z.boolean().optional(),
  furnished: z.boolean().optional(),
  amenities: z.array(z.string()).max(20).default([]),
  accessibility: z.array(z.string()).default([]),
  roommates: z.any().optional(),
  policies: z.any().optional(),
  availableFrom: z.string().datetime(),
  leaseTermMonths: z.number().int().positive().optional(),
  photos: z.array(z.string().url()).min(1).max(15),
  videoUrl: z.string().url().optional(),
  description: z.string().min(30).max(1200)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'LISTER') {
      return NextResponse.json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only listers can create listings'
        }
      }, { status: 403 });
    }

    const body = await request.json();
    const listingData = CreateListingSchema.parse(body);

    const listing = await listingService.create({
      owner_user_id: user.id,
      type: listingData.type,
      address: listingData.address,
      neighborhood: listingData.neighborhood,
      lat: listingData.lat,
      lng: listingData.lng,
      rent: listingData.rent,
      description: listingData.description,
      available_from: listingData.availableFrom,
      bills_avg: listingData.billsAvg,
      deposit: listingData.deposit,
      size_m2: listingData.sizeM2,
      rooms: listingData.rooms,
      bathrooms: listingData.bathrooms,
      floor: listingData.floor,
      elevator: listingData.elevator,
      furnished: listingData.furnished,
      amenities: listingData.amenities,
      accessibility: listingData.accessibility,
      roommates: listingData.roommates,
      policies: listingData.policies,
      lease_term_months: listingData.leaseTermMonths,
      photos: listingData.photos,
      video_url: listingData.videoUrl,
    });

    return NextResponse.json({
      listing,
      message: 'Listing created successfully!'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid listing data',
          fields: error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    console.error('Create Listing Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create listing'
      }
    }, { status: 500 });
  }
}
