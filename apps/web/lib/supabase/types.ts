export interface Database {
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
          verified_flags: any
          profile_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          email?: string | null
          name?: string | null
          role?: 'SEEKER' | 'LISTER' | 'ADMIN'
          lang?: string
          verified_flags?: any
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          email?: string | null
          name?: string | null
          role?: 'SEEKER' | 'LISTER' | 'ADMIN'
          lang?: string
          verified_flags?: any
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
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
          lifestyle: any
          bio: string | null
        }
        Insert: {
          user_id: string
          budget_min: number
          budget_max: number
          move_in_earliest: string
          move_in_latest: string
          areas: string[]
          occupancy_type: string
          lifestyle: any
          bio?: string | null
        }
        Update: {
          user_id?: string
          budget_min?: number
          budget_max?: number
          move_in_earliest?: string
          move_in_latest?: string
          areas?: string[]
          occupancy_type?: string
          lifestyle?: any
          bio?: string | null
        }
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
          roommates: any | null
          policies: any | null
          available_from: string
          lease_term_months: number | null
          photos: string[]
          video_url: string | null
          description: string
          completeness: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          type: 'room' | 'apartment'
          address: string
          neighborhood: string
          lat: number
          lng: number
          rent: number
          bills_avg?: number | null
          deposit?: number | null
          size_m2?: number | null
          rooms?: number | null
          bathrooms?: number | null
          floor?: number | null
          elevator?: boolean | null
          furnished?: boolean | null
          amenities?: string[]
          accessibility?: string[]
          roommates?: any | null
          policies?: any | null
          available_from: string
          lease_term_months?: number | null
          photos?: string[]
          video_url?: string | null
          description: string
          completeness?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          type?: 'room' | 'apartment'
          address?: string
          neighborhood?: string
          lat?: number
          lng?: number
          rent?: number
          bills_avg?: number | null
          deposit?: number | null
          size_m2?: number | null
          rooms?: number | null
          bathrooms?: number | null
          floor?: number | null
          elevator?: boolean | null
          furnished?: boolean | null
          amenities?: string[]
          accessibility?: string[]
          roommates?: any | null
          policies?: any | null
          available_from?: string
          lease_term_months?: number | null
          photos?: string[]
          video_url?: string | null
          description?: string
          completeness?: number
          status?: string
          created_at?: string
        }
      }
    }
  }
}

