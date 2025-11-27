/**
 * Database Service Layer
 * Handles all Supabase queries for HomeSprint
 * 
 * This service provides a centralized place for all database operations,
 * making it easier to manage queries and ensure consistency.
 */

import { createClient } from './supabase/client'
import type { Database } from './supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Default client for client-side usage
const defaultClient = createClient()

// Type definitions
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']

// Helper type for untyped Supabase client operations
type AnySupabaseClient = SupabaseClient<any, any, any>

// ============================================
// USER OPERATIONS
// ============================================

export const userService = {
  /**
   * Create a new user
   */
  async create(userData: {
    phone?: string
    email?: string
    name?: string
    role?: 'SEEKER' | 'LISTER' | 'ADMIN'
  }, client?: AnySupabaseClient): Promise<User> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          phone: userData.phone || '', // Ensure required fields
          email: userData.email || null,
          name: userData.name || null,
          role: userData.role || 'SEEKER',
          lang: 'en',
          verified_flags: userData.email ? { email_verified: true } : {},
          profile_completeness: 0,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data as User
  },

  /**
   * Find user by phone
   */
  async findByPhone(phone: string, client?: AnySupabaseClient): Promise<User | null> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`)
    }
    return data ? (data as User) : null
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string, client?: AnySupabaseClient): Promise<User | null> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`)
    }
    return data ? (data as User) : null
  },

  /**
   * Find user by ID
   */
  async findById(userId: string, client?: AnySupabaseClient): Promise<User | null> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`)
    }
    return data ? (data as User) : null
  },

  /**
   * Update user
   */
  async update(userId: string, updates: Partial<User>, client?: AnySupabaseClient): Promise<User> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data as User
  },

  /**
   * Get user with profile
   */
  async getWithProfile(userId: string, client?: AnySupabaseClient) {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return data || null
  },
}

// ============================================
// PROFILE OPERATIONS
// ============================================

export const profileService = {
  /**
   * Create user profile
   */
  async create(profileData: {
    user_id: string
    budget_min: number
    budget_max: number
    move_in_earliest: string
    move_in_latest: string
    areas: string[]
    occupancy_type: string
    lifestyle: Record<string, any>
    bio?: string
  }, client?: AnySupabaseClient): Promise<Profile> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) throw new Error(`Failed to create profile: ${error.message}`)
    return data as Profile
  },

  /**
   * Get user profile
   */
  async get(userId: string, client?: AnySupabaseClient): Promise<Profile | null> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get profile: ${error.message}`)
    }
    return data ? (data as Profile) : null
  },

  /**
   * Update profile
   */
  async update(userId: string, updates: Partial<Profile>, client?: AnySupabaseClient): Promise<Profile> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data as Profile
  },

  /**
   * Upsert profile (create or update)
   */
  async upsert(profileData: Partial<Profile> & { user_id: string }, client?: AnySupabaseClient): Promise<Profile> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profileData])
      .select()
      .single()

    if (error) throw new Error(`Failed to upsert profile: ${error.message}`)
    return data as Profile
  },
}

// ============================================
// LISTING OPERATIONS
// ============================================

export const listingService = {
  /**
   * Create listing
   */
  async create(listingData: {
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
  }, client?: AnySupabaseClient): Promise<Listing> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          ...listingData,
          status: 'draft',
          completeness: 0,
          amenities: listingData.amenities || [],
          accessibility: listingData.accessibility || [],
          photos: listingData.photos || [],
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Failed to create listing: ${error.message}`)
    return data as Listing
  },

  /**
   * Get active listings with optional filters
   */
  async getActive(filters?: {
    neighborhood?: string
    minRent?: number
    maxRent?: number
    type?: 'room' | 'apartment'
    furnished?: boolean
    limit?: number
    offset?: number
  }, client?: AnySupabaseClient): Promise<Listing[]> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    let query = supabase
      .from('listings')
      .select(
        `
        *,
        users:owner_user_id(id, name, verified_flags)
      `
      )
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

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to get listings: ${error.message}`)
    return (data as Listing[]) || []
  },

  /**
   * Get user's listings
   */
  async getUserListings(userId: string, client?: AnySupabaseClient): Promise<Listing[]> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get user listings: ${error.message}`)
    return (data as Listing[]) || []
  },

  /**
   * Get listing by ID
   */
  async getById(listingId: string, client?: AnySupabaseClient): Promise<Listing | null> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        users:owner_user_id(id, name, phone, email, verified_flags)
      `
      )
      .eq('id', listingId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get listing: ${error.message}`)
    }
    return data ? (data as Listing) : null
  },

  /**
   * Update listing
   */
  async update(listingId: string, updates: Partial<Listing>, client?: AnySupabaseClient): Promise<Listing> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update listing: ${error.message}`)
    return data as Listing
  },

  /**
   * Search listings
   */
  async search(query: string, client?: AnySupabaseClient): Promise<Listing[]> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        users:owner_user_id(id, name)
      `
      )
      .eq('status', 'active')
      .or(`address.ilike.%${query}%,neighborhood.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to search listings: ${error.message}`)
    return (data as Listing[]) || []
  },

  /**
   * Get listings matching user profile
   */
  async getMatchingForUser(userId: string, client?: AnySupabaseClient): Promise<Listing[]> {
    // Get user profile first
    const profile = await profileService.get(userId, client)
    if (!profile) return []

    const supabase = client || (defaultClient as AnySupabaseClient)
    let query = supabase
      .from('listings')
      .select(
        `
        *,
        users:owner_user_id(id, name)
      `
      )
      .eq('status', 'active')

    if (profile.areas && profile.areas.length > 0) {
      query = query.in('neighborhood', profile.areas)
    }

    if (profile.budget_min) {
      query = query.gte('rent', profile.budget_min)
    }

    if (profile.budget_max) {
      query = query.lte('rent', profile.budget_max)
    }

    const { data, error } = await query.order('rent', { ascending: true })

    if (error) throw new Error(`Failed to get matching listings: ${error.message}`)
    return (data as Listing[]) || []
  },

  /**
   * Delete listing
   */
  async delete(listingId: string, client?: AnySupabaseClient): Promise<void> {
    const supabase = client || (defaultClient as AnySupabaseClient)
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (error) throw new Error(`Failed to delete listing: ${error.message}`)
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate distance between two coordinates in km
 */
export function calculateDistance(
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

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: any): string {
  if (error.code === 'PGRST116') {
    return 'No records found'
  } else if (error.code === '23505') {
    return 'Record already exists'
  } else if (error.code === '42P01') {
    return 'Database table not found'
  } else if (error.code === '42703') {
    return 'Database column not found'
  } else {
    return error.message || 'Unknown database error'
  }
}
