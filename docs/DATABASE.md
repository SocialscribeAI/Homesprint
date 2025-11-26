# Database Architecture

## Overview
HomeSprint uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The schema is optimized for the rental matching platform with geospatial features, full-text search, and complex relationships.

## Core Schema Design

### 1. User Management Tables

#### User Table
```sql
CREATE TABLE users (
  id          VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  role        user_role NOT NULL CHECK (role IN ('seeker', 'lister', 'admin')),
  phone       VARCHAR(15) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE,
  name        VARCHAR(100),
  lang        VARCHAR(2) DEFAULT 'en' CHECK (lang IN ('en', 'he')),
  verified_flags JSONB DEFAULT '{}',
  profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, verified_flags);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Profile Table
```sql
CREATE TABLE profiles (
  user_id               VARCHAR(25) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  budget_min            INTEGER CHECK (budget_min > 0),
  budget_max            INTEGER CHECK (budget_max > 0 AND budget_max >= budget_min),
  move_in_earliest      TIMESTAMPTZ,
  move_in_latest        TIMESTAMPTZ,
  areas                 TEXT[] DEFAULT '{}',
  occupancy_type        VARCHAR(20) CHECK (occupancy_type IN ('room', 'apartment')),
  lifestyle             JSONB DEFAULT '{}',
  bio                   TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (move_in_earliest <= move_in_latest)
);
```

### 2. Listing Management Tables

#### Listing Table
```sql
CREATE TABLE listings (
  id              VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  owner_user_id   VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type            VARCHAR(10) NOT NULL CHECK (type IN ('room', 'apartment')),
  address         VARCHAR(200) NOT NULL,
  neighborhood    VARCHAR(50) NOT NULL,
  geo             GEOGRAPHY(POINT, 4326),  -- PostGIS geospatial data
  rent            INTEGER NOT NULL CHECK (rent > 0),
  bills_avg       INTEGER CHECK (bills_avg >= 0),
  deposit         INTEGER CHECK (deposit >= 0),
  size_m2         INTEGER CHECK (size_m2 > 0),
  rooms           INTEGER CHECK (rooms > 0),
  bathrooms       INTEGER CHECK (bathrooms > 0),
  floor           INTEGER CHECK (floor >= 0),
  elevator        BOOLEAN,
  furnished       BOOLEAN,
  amenities       TEXT[] DEFAULT '{}',
  accessibility   TEXT[] DEFAULT '{}',
  roommates       JSONB,  -- Current roommate details
  policies        JSONB,  -- Property rules and policies
  available_from  TIMESTAMPTZ NOT NULL,
  lease_term_months INTEGER CHECK (lease_term_months > 0),
  photos          TEXT[] DEFAULT '{}',
  video_url       VARCHAR(500),
  description     TEXT NOT NULL,
  completeness    INTEGER DEFAULT 0 CHECK (completeness >= 0 AND completeness <= 100),
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'filled', 'inactive')),

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_listings_owner_status ON listings(owner_user_id, status);
CREATE INDEX idx_listings_status_available ON listings(status, available_from);
CREATE INDEX idx_listings_rent_neighborhood ON listings(rent, neighborhood);
CREATE INDEX idx_listings_geo ON listings USING GIST (geo);
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- Full-text search
ALTER TABLE listings ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_listings_search ON listings USING GIN (search_vector);
```

### 3. Application & Matching Tables

#### Application Table
```sql
CREATE TABLE applications (
  id            VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  listing_id    VARCHAR(25) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seeker_user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  score         JSONB DEFAULT '{}',  -- Matching algorithm results
  message       TEXT,
  viewing_requested BOOLEAN DEFAULT FALSE,
  viewing_scheduled BOOLEAN DEFAULT FALSE,
  viewing_completed BOOLEAN DEFAULT FALSE,
  viewing_count INTEGER DEFAULT 0,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, seeker_user_id)
);

-- Indexes
CREATE INDEX idx_applications_listing_status ON applications(listing_id, status);
CREATE INDEX idx_applications_seeker_status ON applications(seeker_user_id, status);
CREATE INDEX idx_applications_created_at ON applications(created_at);
```

### 4. Communication Tables

#### Thread Table
```sql
CREATE TABLE threads (
  id            VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  participants  VARCHAR(25)[] NOT NULL,  -- Array of user IDs
  listing_id    VARCHAR(25) REFERENCES listings(id),
  application_id VARCHAR(25) REFERENCES applications(id),

  title         VARCHAR(200) NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT TRUE,
  message_count INTEGER DEFAULT 0,
  unread_count  JSONB DEFAULT '{}',  -- Unread count per user

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_threads_participants ON threads USING GIN (participants);
CREATE INDEX idx_threads_last_message ON threads(last_message_at);
CREATE INDEX idx_threads_active ON threads(is_active);
```

#### Message Table
```sql
CREATE TABLE messages (
  id              VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  thread_id       VARCHAR(25) NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id       VARCHAR(25) NOT NULL REFERENCES users(id),

  body            TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]',
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  read_at         JSONB,  -- Read timestamps per user
  edited_at       TIMESTAMPTZ,
  reply_to_id     VARCHAR(25) REFERENCES messages(id),
  is_system_message BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_thread_sent ON messages(thread_id, sent_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

### 5. Scheduling Tables

#### Viewing Table
```sql
CREATE TABLE viewings (
  id            VARCHAR(25) PRIMARY KEY DEFAULT cuid(),
  listing_id    VARCHAR(25) NOT NULL REFERENCES listings(id),
  seeker_id     VARCHAR(25) NOT NULL REFERENCES users(id),
  lister_id     VARCHAR(25) NOT NULL,  -- Denormalized for performance

  proposed_times TIMESTAMPTZ[] NOT NULL,
  confirmed_time TIMESTAMPTZ,
  duration      INTEGER DEFAULT 30 CHECK (duration >= 15 AND duration <= 120),
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  location      JSONB,  -- Flexible location data
  notes         TEXT,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_viewings_listing_status ON viewings(listing_id, status);
CREATE INDEX idx_viewings_seeker_status ON viewings(seeker_id, status);
CREATE INDEX idx_viewings_confirmed_time ON viewings(confirmed_time);
```

## Database Optimization

### Indexing Strategy

#### Performance Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_listings_search_filters
ON listings (status, rent, neighborhood, available_from);

-- Partial indexes for active listings
CREATE INDEX CONCURRENTLY idx_active_listings_geo
ON listings USING GIST (geo) WHERE status = 'active';

-- Trigram indexes for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY idx_listing_description_trgm
ON listings USING gin (description gin_trgm_ops);
```

#### Index Maintenance
```sql
-- Reindexing strategy
REINDEX INDEX CONCURRENTLY idx_listings_geo;
ANALYZE listings;  -- Update table statistics

-- Index usage monitoring
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Query Optimization

#### Efficient Listing Search
```sql
-- Optimized search query with CTE
WITH filtered_listings AS (
  SELECT
    l.*,
    ST_Distance(l.geo, ST_GeomFromText($1, 4326)) as distance
  FROM listings l
  WHERE l.status = 'active'
    AND l.rent BETWEEN $2 AND $3
    AND l.neighborhood = ANY($4)
    AND l.available_from <= $5
    AND ST_DWithin(l.geo, ST_GeomFromText($1, 4326), $6)
),
scored_listings AS (
  SELECT
    fl.*,
    ts_rank(fl.search_vector, plainto_tsquery('english', $7)) as text_score,
    CASE
      WHEN fl.distance < 1000 THEN 15
      WHEN fl.distance < 3000 THEN 12
      WHEN fl.distance < 5000 THEN 8
      ELSE 4
    END as location_score
  FROM filtered_listings fl
  WHERE fl.search_vector @@ plainto_tsquery('english', $7)
)
SELECT
  id, address, rent, photos,
  (text_score * 0.4 + location_score * 0.6) as relevance_score
FROM scored_listings
ORDER BY relevance_score DESC, rent ASC
LIMIT $8 OFFSET $9;
```

### Data Integrity & Constraints

#### Check Constraints
```sql
-- Budget validation
ALTER TABLE profiles ADD CONSTRAINT valid_budget_range
CHECK (budget_min <= budget_max AND budget_min > 0);

-- Date validation
ALTER TABLE profiles ADD CONSTRAINT valid_move_dates
CHECK (move_in_earliest <= move_in_latest);

-- Completeness bounds
ALTER TABLE listings ADD CONSTRAINT valid_completeness
CHECK (completeness >= 0 AND completeness <= 100);
```

#### Foreign Key Relationships
```sql
-- Cascade deletes for data consistency
ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Restrict deletes for audit purposes
ALTER TABLE applications ADD CONSTRAINT applications_listing_id_fkey
FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT;
```

## Migration Strategy

### Prisma Migrations
```bash
# Generate migration
npx prisma migrate dev --name add_user_profiles

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration Best Practices
- **Incremental Changes**: Small, focused migrations
- **Backward Compatibility**: Support for rolling deployments
- **Data Preservation**: Careful handling of existing data
- **Rollback Plans**: Reversible migration strategies

## Backup & Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -h localhost -U homesprint -d homesprint_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -h localhost -U homesprint -d homesprint_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Continuous archiving
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

### Point-in-Time Recovery
```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/archive/%f';

-- Restore to specific time
SELECT pg_stop_backup();
RESTORE POINT 'before_migration';
RECOVERY TARGET TIME '2024-01-15 14:30:00';
RECOVERY TARGET INCLUSIVE = false;
```

## Performance Monitoring

### Query Performance Analysis
```sql
-- Slow query log analysis
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage analysis
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Connection Pooling
```javascript
// Prisma configuration
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ['query', 'info', 'warn', 'error'],
});

// Connection pool settings
const poolConfig = {
  max: 20,        // Maximum connections
  min: 5,         // Minimum connections
  idle: 10000,    // Idle timeout
  acquire: 60000, // Acquire timeout
};
```

## Security Implementation

### Row Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY listing_owner_policy ON listings
FOR ALL USING (owner_user_id = current_user_id());

CREATE POLICY message_participant_policy ON messages
FOR SELECT USING (thread_id IN (
  SELECT id FROM threads WHERE participants @> ARRAY[current_user_id()]
));
```

### Data Encryption
```sql
-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted phone storage
UPDATE users
SET phone_encrypted = pgp_sym_encrypt(phone, 'encryption_key')
WHERE phone_encrypted IS NULL;
```

## Testing Strategy

### Database Unit Tests
- Schema validation testing
- Constraint testing
- Index performance verification
- Migration testing

### Integration Tests
- Full query flow testing
- Transaction integrity testing
- Concurrent access testing
- Performance benchmark testing

### Data Migration Tests
- Migration script validation
- Data integrity verification
- Rollback testing
- Performance impact assessment

