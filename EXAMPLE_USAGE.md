# HomeSprint - Example Usage Guide

This guide shows practical examples of using the authentication system and database queries in your code.

## Authentication Examples

### Using the Auth Context

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Welcome, {user?.name || user?.phone}!</h1>
      <p>Role: {user?.role}</p>
      <button onClick={() => logout().then(() => router.push('/login'))}>
        Logout
      </button>
    </div>
  );
}
```

### Protecting Routes

```typescript
// app/(dashboard)/layout.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  return (
    <div>
      <header>
        <nav>
          <span>Welcome, {user?.name}</span>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Role-Based Access Control

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/me');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  );
}
```

## Database Usage Examples

### Create a New User

```typescript
import { userService } from '@/lib/db-service';

// After successful OTP verification
const newUser = await userService.create({
  phone: '+972501234567',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'SEEKER',
});

console.log('User created:', newUser);
```

### Get User Information

```typescript
import { userService } from '@/lib/db-service';

// Find user by phone
const user = await userService.findByPhone('+972501234567');

// Find user by email
const user = await userService.findByEmail('user@example.com');

// Get user with their profile
const userWithProfile = await userService.getWithProfile('user-id');
```

### Create User Profile

```typescript
import { profileService } from '@/lib/db-service';

const profile = await profileService.create({
  user_id: 'user-123',
  budget_min: 3000,
  budget_max: 5000,
  move_in_earliest: '2024-12-01',
  move_in_latest: '2025-02-01',
  areas: ['Rehavia', 'Nachlaot', 'German Colony'],
  occupancy_type: 'room',
  lifestyle: {
    smoking: 'no',
    pets: 'cats_allowed',
    guests: 'occasionally',
    cleaning: 'shared_responsibility',
  },
  bio: 'Looking for a quiet room near campus',
});
```

### Create a Listing

```typescript
import { listingService } from '@/lib/db-service';

const listing = await listingService.create({
  owner_user_id: 'user-456',
  type: 'room',
  address: 'Rehavia 45, Jerusalem',
  neighborhood: 'Rehavia',
  lat: 31.7714,
  lng: 35.2094,
  rent: 3500,
  bills_avg: 300,
  size_m2: 25,
  rooms: 1,
  bathrooms: 1,
  furnished: true,
  amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
  accessibility: ['Elevator'],
  policies: {
    smoking: 'no',
    pets: 'cats_allowed',
    guests: 'occasionally',
  },
  available_from: '2024-12-01',
  description: 'Beautiful furnished room in Rehavia',
  photos: ['https://example.com/photo1.jpg'],
});
```

### Search and Filter Listings

```typescript
import { listingService } from '@/lib/db-service';

// Get all active listings
const allListings = await listingService.getActive();

// Filter by neighborhood and price
const filtered = await listingService.getActive({
  neighborhood: 'Rehavia',
  minRent: 3000,
  maxRent: 4500,
  type: 'room',
  furnished: true,
  limit: 20,
  offset: 0,
});

// Search with text query
const searchResults = await listingService.search('quiet room');

// Get user's listings
const myListings = await listingService.getUserListings('user-456');

// Get listing details
const listing = await listingService.getById('listing-123');
```

### Get Matching Listings

```typescript
import { listingService } from '@/lib/db-service';

// Get listings matching user's profile
const matches = await listingService.getMatchingForUser('user-123');

// This will:
// 1. Get user's profile (budget, areas, preferences)
// 2. Search for active listings matching those criteria
// 3. Sort by rent
```

### Update User Information

```typescript
import { userService } from '@/lib/db-service';

const updated = await userService.update('user-123', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  verified_flags: {
    phone_verified: true,
    email_verified: true,
  },
});
```

### Update Profile

```typescript
import { profileService } from '@/lib/db-service';

const updated = await profileService.update('user-123', {
  budget_max: 6000,
  areas: ['Rehavia', 'Nachlaot', 'German Colony', 'Tamarisk'],
});
```

### Update Listing

```typescript
import { listingService } from '@/lib/db-service';

const updated = await listingService.update('listing-123', {
  rent: 3600,
  description: 'Updated description',
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
});
```

## API Examples

### Using Database Service in API Routes

```typescript
// app/api/listings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/lib/db-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await listingService.getById(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Search Endpoint

```typescript
// app/api/listings/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const neighborhood = searchParams.get('neighborhood');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const type = searchParams.get('type');

    const listings = await listingService.getActive({
      neighborhood: neighborhood || undefined,
      minRent: minRent ? parseInt(minRent) : undefined,
      maxRent: maxRent ? parseInt(maxRent) : undefined,
      type: (type as any) || undefined,
    });

    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error('Error searching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Create Listing Endpoint

```typescript
// app/api/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/lib/db-service';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listing = await listingService.create({
      ...body,
      owner_user_id: 'user-id', // From decoded token
    });

    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Component Examples

### Listing Card Component

```typescript
// components/ListingCard.tsx
import { Listing } from '@/lib/db-service';
import Link from 'next/link';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <img
          src={listing.photos[0]}
          alt={listing.address}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg">{listing.address}</h3>
          <p className="text-gray-600">{listing.neighborhood}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">
              ₪{listing.rent}
            </span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {listing.type === 'room' ? 'Room' : 'Apartment'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

### User Menu Component

```typescript
// components/UserMenu.tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <span>{user.name || user.phone}</span>
      <Link href="/me/profile">Profile</Link>
      <Link href="/me/listings">My Listings</Link>
      {user.role === 'ADMIN' && (
        <Link href="/admin">Admin Panel</Link>
      )}
      <button
        onClick={() => logout().then(() => router.push('/'))}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
```

## Error Handling Examples

```typescript
import { listingService, handleSupabaseError } from '@/lib/db-service';

async function getListingWithError(listingId: string) {
  try {
    const listing = await listingService.getById(listingId);
    if (!listing) {
      console.log('Listing not found');
      return null;
    }
    return listing;
  } catch (error) {
    const message = handleSupabaseError(error);
    console.error('Database error:', message);
    throw new Error(message);
  }
}
```

## Testing Examples

```typescript
// Test creating and finding user
async function testUserFlow() {
  // Create user
  const user = await userService.create({
    phone: '+972501234567',
    name: 'Test User',
    role: 'SEEKER',
  });
  console.log('Created user:', user.id);

  // Find user
  const found = await userService.findByPhone('+972501234567');
  console.log('Found user:', found?.id);

  // Update user
  const updated = await userService.update(user.id, {
    name: 'Updated Name',
  });
  console.log('Updated user:', updated.name);
}

// Test listing operations
async function testListingFlow() {
  // Create listing
  const listing = await listingService.create({
    owner_user_id: 'user-123',
    type: 'room',
    address: 'Test Address',
    neighborhood: 'Test Neighborhood',
    lat: 31.7683,
    lng: 35.2137,
    rent: 3500,
    description: 'Test listing',
    available_from: new Date().toISOString(),
  });
  console.log('Created listing:', listing.id);

  // Search listings
  const listings = await listingService.getActive({
    neighborhood: 'Test Neighborhood',
  });
  console.log('Found listings:', listings.length);

  // Get listing by ID
  const found = await listingService.getById(listing.id);
  console.log('Found listing:', found?.address);
}
```

## Type Safety Examples

```typescript
import { User, Profile, Listing } from '@/lib/db-service';

function displayUserInfo(user: User) {
  console.log(`${user.name} (${user.role})`);
  console.log(`Phone: ${user.phone}`);
  console.log(`Email: ${user.email}`);
}

function displayListing(listing: Listing) {
  console.log(`${listing.address} - ₪${listing.rent}/month`);
  console.log(`Type: ${listing.type}`);
  console.log(`Area: ${listing.size_m2}m²`);
}

function displayProfile(profile: Profile) {
  console.log(`Budget: ₪${profile.budget_min} - ₪${profile.budget_max}`);
  console.log(`Areas: ${profile.areas.join(', ')}`);
}
```

---

## Summary

The examples above show how to:
1. Use the auth context for authentication
2. Protect routes based on authentication
3. Implement role-based access control
4. Create and manage users
5. Create and search listings
6. Handle errors properly
7. Build components that use auth and database
8. Create API endpoints
9. Type your code properly

For more information, see:
- `AUTH_SETUP_GUIDE.md`
- `docs/SUPABASE_DATABASE_QUERIES.md`
- `SETUP_SUMMARY.md`

