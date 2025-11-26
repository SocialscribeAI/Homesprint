# Supabase Setup for HomeSprint MVP

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Create a new project
4. Wait for setup to complete (2-3 minutes)

## 2. Get Your Credentials
After project creation, go to Settings → API and copy:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Create Environment File
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
JWT_SECRET=generate-a-secure-random-string-here
```

## 4. Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'SEEKER' CHECK (role IN ('SEEKER', 'LISTER', 'ADMIN')),
  lang TEXT DEFAULT 'en',
  verified_flags JSONB DEFAULT '{}',
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  move_in_earliest TIMESTAMP WITH TIME ZONE NOT NULL,
  move_in_latest TIMESTAMP WITH TIME ZONE NOT NULL,
  areas TEXT[] DEFAULT '{}',
  occupancy_type TEXT NOT NULL,
  lifestyle JSONB DEFAULT '{}',
  bio TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own profiles
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);
```

### Listings Table
```sql
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'apartment')),
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rent INTEGER NOT NULL,
  bills_avg INTEGER,
  deposit INTEGER,
  size_m2 INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  elevator BOOLEAN,
  furnished BOOLEAN,
  amenities TEXT[] DEFAULT '{}',
  accessibility TEXT[] DEFAULT '{}',
  roommates JSONB,
  policies JSONB,
  available_from TIMESTAMP WITH TIME ZONE NOT NULL,
  lease_term_months INTEGER,
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  description TEXT NOT NULL,
  completeness INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active listings
CREATE POLICY "Public can view active listings" ON listings
  FOR SELECT USING (status = 'active');

-- Allow owners to manage their listings
CREATE POLICY "Owners can manage own listings" ON listings
  FOR ALL USING (auth.uid() = owner_user_id);

-- Create indexes for performance
CREATE INDEX idx_listings_status_available ON listings(status, available_from);
CREATE INDEX idx_listings_rent_neighborhood ON listings(rent, neighborhood);
CREATE INDEX idx_listings_owner_status ON listings(owner_user_id, status);
```

## 5. Seed Initial Data

Run this SQL to add some sample data:

```sql
-- Sample users
INSERT INTO users (phone, email, name, role, verified_flags) VALUES
('+972501234567', 'admin@homesprint.com', 'Admin User', 'ADMIN', '{"phone_verified": true, "email_verified": true}'),
('+972502468135', 'sarah@homesprint.com', 'Sarah Cohen', 'LISTER', '{"phone_verified": true, "email_verified": true, "lister_verified": true}'),
('+972506843297', 'maya@homesprint.com', 'Maya Student', 'SEEKER', '{"phone_verified": true}');

-- Sample profiles
INSERT INTO profiles (user_id, budget_min, budget_max, move_in_earliest, move_in_latest, areas, occupancy_type, lifestyle, bio) VALUES
((SELECT id FROM users WHERE phone = '+972506843297'), 3000, 4500, '2024-12-01', '2025-02-01', ARRAY['Rehavia', 'Nachlaot'], 'room', '{"smoking": "no", "pets": "cats"}', 'Hebrew University student looking for a quiet room');

-- Sample listings
INSERT INTO listings (owner_user_id, type, address, neighborhood, lat, lng, rent, bills_avg, furnished, amenities, available_from, photos, description, completeness, status) VALUES
((SELECT id FROM users WHERE phone = '+972502468135'), 'room', 'Rehavia 45, Jerusalem', 'Rehavia', 31.7714, 35.2094, 3500, 300, true, ARRAY['WiFi', 'Kitchen'], '2024-12-01', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], 'Beautiful furnished room in Rehavia', 95, 'active');
```

## 6. Test the Setup

1. Start your dev server: `pnpm dev`
2. Visit `http://localhost:3001`
3. Try the OTP login flow (use phone: +972501234567, OTP: 123456 for testing)

## 7. Supabase Features to Explore Later

- **Authentication**: Built-in user auth (we're using custom OTP for now)
- **Storage**: File uploads for listing photos
- **Real-time**: Live updates for new listings/messages
- **Edge Functions**: Serverless functions for complex logic
- **Analytics**: Built-in database analytics

## Troubleshooting

**Connection Issues:**
- Double-check your `.env.local` credentials
- Ensure your Supabase project is active
- Check Supabase dashboard for any service outages

**RLS Issues:**
- Make sure policies are correctly created
- Test with authenticated users only
- Check Supabase logs for policy violations

**Migration Issues:**
- Run SQL commands in the correct order
- Ensure foreign key constraints are satisfied
- Check for any syntax errors in SQL

