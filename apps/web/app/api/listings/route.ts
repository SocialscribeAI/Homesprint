import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mockDB } from '../../../lib/mock-db';
import { getCurrentUser } from '../../../lib/auth';

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

    const { page, limit, sortBy, ...searchFilters } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active'
    };

    // Apply filters
    if (searchFilters.minRent || searchFilters.maxRent) {
      where.rent = {};
      if (searchFilters.minRent) where.rent.gte = searchFilters.minRent;
      if (searchFilters.maxRent) where.rent.lte = searchFilters.maxRent;
    }

    if (searchFilters.type) {
      where.type = searchFilters.type;
    }

    if (searchFilters.neighborhood) {
      where.neighborhood = { contains: searchFilters.neighborhood, mode: 'insensitive' };
    }

    if (searchFilters.furnished !== undefined) {
      where.furnished = searchFilters.furnished;
    }

    // Full-text search
    if (searchFilters.query) {
      // For MVP, use simple text search
      where.OR = [
        { description: { contains: searchFilters.query, mode: 'insensitive' } },
        { address: { contains: searchFilters.query, mode: 'insensitive' } },
        { neighborhood: { contains: searchFilters.query, mode: 'insensitive' } }
      ];
    }

    // Build order by
    let orderBy: any;
    switch (sortBy) {
      case 'price_asc':
        orderBy = { rent: 'asc' };
        break;
      case 'price_desc':
        orderBy = { rent: 'desc' };
        break;
      case 'date_desc':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { completeness: 'desc' }; // Relevance proxy
    }

    // Execute query using mock DB
    const listings = mockDB.findListings({
      ...searchFilters,
      sortBy
    }).slice(skip, skip + limit);

    const total = mockDB.getListingsCount(searchFilters);

    // Add owner info to listings (mock)
    const listingsWithOwners = listings.map(listing => ({
      ...listing,
      owner: mockDB.findUserById(listing.ownerUserId) ? {
        id: listing.ownerUserId,
        name: mockDB.findUserById(listing.ownerUserId)?.name,
        verifiedFlags: mockDB.findUserById(listing.ownerUserId)?.verifiedFlags
      } : undefined
    }));

    return NextResponse.json({
      listings: listingsWithOwners,
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

    // Calculate completeness
    const completeness = calculateListingCompleteness(listingData);

    const listing = mockDB.createListing({
      ownerUserId: user.id,
      type: listingData.type,
      address: listingData.address,
      neighborhood: listingData.neighborhood,
      lat: listingData.lat,
      lng: listingData.lng,
      rent: listingData.rent,
      billsAvg: listingData.billsAvg,
      deposit: listingData.deposit,
      sizeM2: listingData.sizeM2,
      rooms: listingData.rooms,
      bathrooms: listingData.bathrooms,
      floor: listingData.floor,
      elevator: listingData.elevator,
      furnished: listingData.furnished,
      amenities: listingData.amenities,
      accessibility: listingData.accessibility,
      roommates: listingData.roommates,
      policies: listingData.policies,
      availableFrom: new Date(listingData.availableFrom),
      leaseTermMonths: listingData.leaseTermMonths,
      photos: listingData.photos,
      videoUrl: listingData.videoUrl,
      description: listingData.description,
      completeness
    });

    return NextResponse.json({
      listing,
      message: completeness >= 70 ? 'Listing created and published!' : 'Listing created as draft. Complete more fields to publish.'
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

function calculateListingCompleteness(data: any): number {
  let score = 0;

  // Basic info (25 points)
  if (data.address && data.neighborhood && data.type) score += 25;

  // Financial (20 points)
  if (data.rent) score += 20;

  // Property features (20 points)
  if (data.amenities && data.amenities.length > 0) score += 10;
  if (data.sizeM2 || data.rooms) score += 5;
  if (data.furnished !== undefined) score += 5;

  // Visual content (20 points)
  if (data.photos && data.photos.length > 0) score += 10;
  if (data.description) score += 5;
  if (data.videoUrl) score += 5;

  // Additional details (15 points)
  if (data.accessibility && data.accessibility.length > 0) score += 5;
  if (data.policies) score += 5;
  if (data.roommates) score += 5;

  return Math.min(score, 100);
}
