-- Supabase Schema Migration (Safe Update)
-- This script safely updates the database without failing if objects already exist.

-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- 1. ENUMS (Safe creation)
do $$
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as enum ('SEEKER', 'LISTER', 'ADMIN');
    end if;
end
$$;

-- 2. CREATE TABLES (if they don't exist)

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role user_role default 'SEEKER'::user_role,
  phone text unique not null,
  email text unique,
  name text,
  lang text default 'en',
  verified_flags jsonb default '{}'::jsonb,
  profile_completeness numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFILES
create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  budget_min integer not null,
  budget_max integer not null,
  move_in_earliest timestamptz not null,
  move_in_latest timestamptz not null,
  areas text[] not null,
  occupancy_type text not null,
  lifestyle jsonb default '{}'::jsonb,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LISTINGS
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  address text not null,
  neighborhood text not null,
  geo geography(Point, 4326),
  lat double precision,
  lng double precision,
  rent integer not null,
  bills_avg integer,
  deposit integer,
  size_m2 integer,
  rooms integer,
  bathrooms integer,
  floor integer,
  elevator boolean,
  furnished boolean,
  amenities text[],
  accessibility text[],
  roommates jsonb,
  policies jsonb,
  available_from timestamptz not null,
  lease_term_months integer,
  photos text[],
  video_url text,
  description text not null,
  completeness integer default 0,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LISTING INDEXES
create index if not exists listings_status_available_from_idx on public.listings (status, available_from);
create index if not exists listings_rent_neighborhood_idx on public.listings (rent, neighborhood);
create index if not exists listings_owner_user_id_status_idx on public.listings (owner_user_id, status);
create index if not exists listings_geo_idx on public.listings using GIST (geo);

-- APPLICATIONS
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seeker_user_id uuid not null references public.users(id) on delete cascade,
  status text default 'pending',
  score jsonb default '{}'::jsonb,
  message text,
  viewing_requested boolean default false,
  viewing_scheduled boolean default false,
  viewing_completed boolean default false,
  viewing_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, seeker_user_id)
);

create index if not exists applications_listing_id_status_idx on public.applications (listing_id, status);
create index if not exists applications_seeker_user_id_status_idx on public.applications (seeker_user_id, status);

-- THREADS
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  participants uuid[] not null,
  listing_id uuid references public.listings(id),
  application_id uuid references public.applications(id),
  title text not null,
  last_message_at timestamptz default now(),
  is_active boolean default true,
  message_count integer default 0,
  unread_count jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists threads_participants_idx on public.threads using gin (participants);
create index if not exists threads_last_message_at_idx on public.threads (last_message_at);
create index if not exists threads_is_active_idx on public.threads (is_active);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  body text not null,
  attachments jsonb default '[]'::jsonb,
  sent_at timestamptz default now(),
  read_at jsonb,
  edited_at timestamptz,
  reply_to_id uuid,
  is_system_message boolean default false
);

create index if not exists messages_thread_id_sent_at_idx on public.messages (thread_id, sent_at);
create index if not exists messages_sender_id_idx on public.messages (sender_id);

-- VIEWINGS
create table if not exists public.viewings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  seeker_id uuid not null references public.users(id),
  proposed_times timestamptz[],
  confirmed_time timestamptz,
  duration integer default 30,
  status text default 'pending',
  location jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists viewings_listing_id_status_idx on public.viewings (listing_id, status);
create index if not exists viewings_seeker_id_status_idx on public.viewings (seeker_id, status);
create index if not exists viewings_confirmed_time_idx on public.viewings (confirmed_time);

-- REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id),
  target_type text not null,
  target_id text not null,
  reason text not null,
  description text not null,
  evidence text[] default array[]::text[],
  status text default 'pending',
  priority text default 'medium',
  assigned_to text,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  updated_at timestamptz default now()
);

create index if not exists reports_status_priority_idx on public.reports (status, priority);
create index if not exists reports_target_type_target_id_idx on public.reports (target_type, target_id);

-- PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  seeker_id uuid not null references public.users(id),
  lister_id uuid not null,
  amount double precision not null,
  currency text default 'ils',
  status text not null,
  stripe_payment_intent_id text unique not null,
  stripe_charge_id text,
  fee_type text not null,
  match_id text,
  created_at timestamptz default now(),
  processed_at timestamptz,
  refunded_at timestamptz
);

create index if not exists payments_listing_id_status_idx on public.payments (listing_id, status);
create index if not exists payments_seeker_id_idx on public.payments (seeker_id);

-- UPDATED AT TRIGGER
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Safe Trigger Creation
do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'update_users_updated_at') then
        create trigger update_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_profiles_updated_at') then
        create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_listings_updated_at') then
        create trigger update_listings_updated_at before update on public.listings for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_applications_updated_at') then
        create trigger update_applications_updated_at before update on public.applications for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_threads_updated_at') then
        create trigger update_threads_updated_at before update on public.threads for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_viewings_updated_at') then
        create trigger update_viewings_updated_at before update on public.viewings for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'update_reports_updated_at') then
        create trigger update_reports_updated_at before update on public.reports for each row execute procedure update_updated_at_column();
    end if;
end
$$;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
-- We drop existing policies to ensure the new logic is applied cleanly without errors about duplicate policies.

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.applications enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.viewings enable row level security;
alter table public.reports enable row level security;
alter table public.payments enable row level security;

-- Drop all existing policies to avoid conflicts
drop policy if exists "Public users are viewable by everyone" on public.users;
drop policy if exists "Users are viewable if they own an active listing" on public.users;
drop policy if exists "Users can update own record" on public.users;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Profiles are viewable if user owns active listing" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Active listings are viewable by everyone" on public.listings;
drop policy if exists "Owners can view own listings" on public.listings;
drop policy if exists "Owners can insert own listings" on public.listings;
drop policy if exists "Owners can update own listings" on public.listings;
drop policy if exists "Owners can delete own listings" on public.listings;

drop policy if exists "Seekers can view own applications" on public.applications;
drop policy if exists "Seekers can create applications" on public.applications;
drop policy if exists "Owners can view applications for their listings" on public.applications;

drop policy if exists "Participants can view threads" on public.threads;
drop policy if exists "Participants can create threads" on public.threads;

drop policy if exists "Thread participants can view messages" on public.messages;
drop policy if exists "Participants can insert messages" on public.messages;

drop policy if exists "Seekers can view own viewings" on public.viewings;
drop policy if exists "Owners can view viewings for their listings" on public.viewings;

drop policy if exists "Users can view own payments" on public.payments;


-- RE-CREATE POLICIES

-- USERS
-- Public read access to basic user info (ONLY if they are an owner of an active listing)
create policy "Users are viewable if they own an active listing"
  on public.users for select
  using (
    exists (
      select 1 from public.listings
      where listings.owner_user_id = users.id
      and listings.status = 'active'
    )
    or auth.uid() = id -- Users can always see themselves
  );

-- Users can update own record
create policy "Users can update own record"
  on public.users for update
  using ( auth.uid() = id );

-- PROFILES
-- Profiles are viewable ONLY if the user owns an active listing
create policy "Profiles are viewable if user owns active listing"
  on public.profiles for select
  using (
    exists (
      select 1 from public.listings
      where listings.owner_user_id = profiles.user_id
      and listings.status = 'active'
    )
    or auth.uid() = user_id -- Users can always see their own profile
  );

-- Users can insert/update own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = user_id );

-- LISTINGS
-- Active listings are viewable by everyone
create policy "Active listings are viewable by everyone"
  on public.listings for select
  using ( status = 'active' );

-- Owners can view all their listings (draft/archived)
create policy "Owners can view own listings"
  on public.listings for select
  using ( auth.uid() = owner_user_id );

-- Owners can insert/update own listings
create policy "Owners can insert own listings"
  on public.listings for insert
  with check ( auth.uid() = owner_user_id );

create policy "Owners can update own listings"
  on public.listings for update
  using ( auth.uid() = owner_user_id );

create policy "Owners can delete own listings"
  on public.listings for delete
  using ( auth.uid() = owner_user_id );

-- APPLICATIONS
-- Seekers can view/create their own applications
create policy "Seekers can view own applications"
  on public.applications for select
  using ( auth.uid() = seeker_user_id );

create policy "Seekers can create applications"
  on public.applications for insert
  with check ( auth.uid() = seeker_user_id );

-- Listing owners can view applications for their listings
create policy "Owners can view applications for their listings"
  on public.applications for select
  using ( 
    exists (
      select 1 from public.listings
      where listings.id = applications.listing_id
      and listings.owner_user_id = auth.uid()
    )
  );

-- THREADS
-- Participants can view threads they are in
create policy "Participants can view threads"
  on public.threads for select
  using ( auth.uid() = any(participants) );

-- Participants can insert threads
create policy "Participants can create threads"
  on public.threads for insert
  with check ( auth.uid() = any(participants) );

-- MESSAGES
-- Participants of the parent thread can view messages
create policy "Thread participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.threads
      where threads.id = messages.thread_id
      and auth.uid() = any(threads.participants)
    )
  );

-- Participants can send messages to threads they belong to
create policy "Participants can insert messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.threads
      where threads.id = messages.thread_id
      and auth.uid() = any(threads.participants)
    )
  );

-- VIEWINGS
-- Seekers can view their own viewings
create policy "Seekers can view own viewings"
  on public.viewings for select
  using ( auth.uid() = seeker_id );

-- Listing owners can view viewings for their listings
create policy "Owners can view viewings for their listings"
  on public.viewings for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = viewings.listing_id
      and listings.owner_user_id = auth.uid()
    )
  );

-- PAYMENTS
-- Users can view their own payments (as seeker or lister)
create policy "Users can view own payments"
  on public.payments for select
  using ( auth.uid() = seeker_id or auth.uid() = lister_id );
