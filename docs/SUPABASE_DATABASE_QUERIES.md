# Supabase Database Queries Guide

This document provides database queries and integration examples for HomeSprint using Supabase.

## Setup

### 1. Initialize Supabase Client

Create or update `apps/web/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 2. Create Database Types

Create `apps/web/lib/database.types.ts`:

```typescript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          email: string | null
          name: string | null
          role: 'SEEKER' | 'LISTER' | 'ADMIN'
          lang: string
          verified_flags: Record<string, any>
          profile_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      profiles: {
        Row: {
          user_id: string
          budget_min: number
          budget_max: number
          move_in_earliest: string
          move_in_latest: string
          areas: string[]
          occupancy_type: string
          lifestyle: Record<string, any>
          bio: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      listings: {
        Row: {
          id: string
          owner_user_id: string
          type: 'room' | 'apartment'
          address: string
          neighborhood: string
          lat: number
          lng: number
          rent: number
          bills_avg: number | null
          deposit: number | null
          size_m2: number | null
          rooms: number | null
          bathrooms: number | null
          floor: number | null
          elevator: boolean | null
          furnished: boolean | null
          amenities: string[]
          accessibility: string[]
          roommates: Record<string, any> | null
          policies: Record<string, any> | null
          available_from: string
          lease_term_months: number | null
          photos: string[]
          video_url: string | null
          description: string
          completeness: number
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
    }
  }
}
```

## Common Database Queries

### Users

#### Create User

```typescript
async function createUser(userData: {
  phone: string
  email?: string
  name?: string
  role?: 'SEEKER' | 'LISTER' | 'ADMIN'
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      phone: userData.phone,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'SEEKER',
      lang: 'en',
      verified_flags: { phone_verified: true },
      profile_completeness: 0
    }])
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Find User by Phone

```typescript
async function findUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}
```

#### Find User by Email

```typescript
async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}
```

#### Update User

```typescript
async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get User with Profile

```typescript
async function getUserWithProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      profiles (*)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

### Profiles

#### Create Profile

```typescript
async function createProfile(profileData: {
  user_id: string
  budget_min: number
  budget_max: number
  move_in_earliest: string
  move_in_latest: string
  areas: string[]
  occupancy_type: string
  lifestyle: Record<string, any>
  bio?: string
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Update Profile

```typescript
async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get User Profile

```typescript
async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}
```

### Listings

#### Create Listing

```typescript
async function createListing(listingData: {
  owner_user_id: string
  type: 'room' | 'apartment'
  address: string
  neighborhood: string
  lat: number
  lng: number
  rent: number
  description: string
  available_from: string
  [key: string]: any
}) {
  const { data, error } = await supabase
    .from('listings')
    .insert([{
      ...listingData,
      status: 'draft',
      completeness: 0,
      amenities: listingData.amenities || [],
      accessibility: listingData.accessibility || [],
      photos: listingData.photos || []
    }])
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get Active Listings (Public)

```typescript
async function getActiveListings(filters?: {
  neighborhood?: string
  minRent?: number
  maxRent?: number
  type?: 'room' | 'apartment'
  furnished?: boolean
}) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      users:owner_user_id(id, name, verified_flags)
    `)
    .eq('status', 'active')

  if (filters?.neighborhood) {
    query = query.ilike('neighborhood', `%${filters.neighborhood}%`)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.minRent) {
    query = query.gte('rent', filters.minRent)
  }

  if (filters?.maxRent) {
    query = query.lte('rent', filters.maxRent)
  }

  if (filters?.furnished !== undefined) {
    query = query.eq('furnished', filters.furnished)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

#### Get User's Listings

```typescript
async function getUserListings(userId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

#### Update Listing

```typescript
async function updateListing(listingId: string, updates: Partial<Listing>) {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get Listing by ID

```typescript
async function getListingById(listingId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:owner_user_id(id, name, phone, email, verified_flags)
    `)
    .eq('id', listingId)
    .single()

  if (error) throw error
  return data
}
```

### Advanced Queries

#### Search Listings with Full Text Search

```typescript
async function searchListings(query: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:owner_user_id(id, name)
    `)
    .eq('status', 'active')
    .or(`address.ilike.%${query}%,neighborhood.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

#### Get Listings Near Coordinates

```typescript
async function getListingsNear(
  lat: number,
  lng: number,
  radiusKm: number = 5
) {
  // This requires PostGIS extension or alternative distance calculation
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:owner_user_id(id, name)
    `)
    .eq('status', 'active')

  if (error) throw error

  // Simple distance calculation in memory
  return data?.filter(listing => {
    const distance = calculateDistance(lat, lng, listing.lat, listing.lng)
    return distance <= radiusKm
  }) || []
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
```

#### Get Listings Matching User Profile

```typescript
async function getMatchingListings(userId: string) {
  // Get user profile
  const userProfile = await getUserProfile(userId)
  if (!userProfile) return []

  // Search for matching listings
  let query = supabase
    .from('listings')
    .select(`
      *,
      users:owner_user_id(id, name)
    `)
    .eq('status', 'active')

  if (userProfile.areas && userProfile.areas.length > 0) {
    query = query.in(
      'neighborhood',
      userProfile.areas
    )
  }

  if (userProfile.budget_min) {
    query = query.gte('rent', userProfile.budget_min)
  }

  if (userProfile.budget_max) {
    query = query.lte('rent', userProfile.budget_max)
  }

  const { data, error } = await query.order('rent', { ascending: true })

  if (error) throw error
  return data
}
```

## Real-time Subscriptions

### Subscribe to Listings Updates

```typescript
function subscribeToListings(
  onUpdate: (listing: Listing) => void,
  onDelete: (listingId: string) => void
) {
  const channel = supabase
    .channel('listings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: 'status=eq.active'
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onDelete(payload.old.id)
        } else {
          onUpdate(payload.new)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

### Subscribe to User Profile Changes

```typescript
function subscribeToProfile(
  userId: string,
  onUpdate: (profile: Profile) => void
) {
  const channel = supabase
    .channel(`profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

## Best Practices

1. **Always handle errors** - Check error codes and handle them appropriately
2. **Use row-level security** - Enable RLS policies for data protection
3. **Index frequently queried columns** - For better performance
4. **Paginate large result sets** - Use `.range()` for pagination
5. **Cache results** - Use React Query or SWR for caching
6. **Use prepared statements** - Always parameterize queries (Supabase does this automatically)
7. **Monitor performance** - Check query execution plans

## Error Handling

```typescript
async function handleSupabaseError(error: any) {
  if (error.code === 'PGRST116') {
    // No rows returned
    return null
  } else if (error.code === '23505') {
    // Unique constraint violation
    throw new Error('Record already exists')
  } else if (error.code === '42P01') {
    // Table doesn't exist
    throw new Error('Database table not found')
  } else {
    throw error
  }
}
```

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostGIS for Geographic Queries](https://postgis.net/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

