# Search & Matching System

## Overview
The Search & Matching system implements HomeSprint's core value proposition: intelligent, rule-based matching between property seekers and rental listings. The v0 system uses transparent scoring algorithms to connect compatible roommates and tenants with suitable properties.

## Core Components

### 1. Search Infrastructure

#### Search Filters
```typescript
interface SearchFilters {
  query?: string;           // Full-text search query
  minRent?: number;         // Minimum monthly rent
  maxRent?: number;         // Maximum monthly rent
  type?: 'room' | 'apartment';
  neighborhood?: string;    // Specific neighborhood
  minRooms?: number;        // Minimum number of rooms
  maxRooms?: number;        // Maximum number of rooms
  furnished?: boolean;      // Furnished requirement
  pets?: boolean;           // Pet-friendly requirement
  availableFrom?: Date;     // Earliest availability
  availableTo?: Date;       // Latest availability
  radius?: number;          // Search radius in km
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'completeness';
}
```

#### Search Results
```typescript
interface SearchResult {
  listing: Listing;
  score: number;           // 0-100 compatibility score
  matchReasons: string[];  // Why this listing matches
  distance?: number;       // Distance from preferred areas (km)
  priceFit: 'perfect' | 'good' | 'acceptable' | 'poor';
  availabilityFit: 'perfect' | 'good' | 'acceptable' | 'poor';
}
```

### 2. Matching Algorithm v0

#### Scoring Components (Total: 100 points)

##### Budget Compatibility (30 points)
- **Perfect Match**: Rent within user's budget range
- **Good Match**: Within 10% of budget range
- **Acceptable Match**: Within 20% of budget range
- **Poor Match**: Outside acceptable range

##### Move-in Timeline (20 points)
- **Perfect Match**: Listing available within user's date range
- **Partial Match**: Overlapping availability windows
- **Flexible Match**: Close to preferred dates (±1 month)

##### Location Preferences (15 points)
- **Distance Penalty**: Calculated based on proximity to preferred areas
- **Neighborhood Match**: Direct neighborhood preference match
- **Area Proximity**: Distance-based scoring with exponential decay

##### Lifestyle Compatibility (20 points)
- **Roommate Policies**: Smoking, pets, guests, noise preferences
- **Property Rules**: Furnishing, cleaning expectations, religious considerations
- **Hard Filters**: Absolute deal-breakers (no smoking in non-smoking listing)

##### Listing Quality (15 points)
- **Completeness Score**: Higher completeness = higher base score
- **Photo Quality**: Listings with good photos score higher
- **Verification Status**: Verified listers get bonus points

#### Hard Filters (No Match)
- **Occupancy Type**: Room seekers won't match apartments (and vice versa)
- **Absolute Preferences**: Hard "no" on smoking, pets, etc.
- **Availability**: Listings not yet available won't match

### 3. Saved Searches & Alerts

#### Saved Search Configuration
```typescript
interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  frequency: 'immediate' | 'daily' | 'weekly';
  lastNotified: Date;
  isActive: boolean;
  matchCount: number;      // New matches since last notification
}
```

#### Notification Types
- **Email Alerts**: HTML email with listing previews
- **SMS Alerts**: Text message with basic match info
- **In-App Notifications**: Push notifications for mobile
- **WhatsApp Integration**: Direct messaging for urgent matches

### 4. Performance Optimization

#### Database Indexing Strategy
- **GIST Index**: Geographic point data for location queries
- **B-tree Indexes**: Status, availableFrom, rent for filtering
- **Trigram Index**: Description text for full-text search
- **Composite Index**: (rent, neighborhood) for common queries

#### Caching Strategy
- **Redis Caching**: Hot listings and search results
- **Query Result Caching**: Popular search combinations
- **Profile Caching**: User preferences for matching
- **Geocoding Caching**: Address to coordinate mappings

## API Endpoints

### Search Operations
```
GET    /api/listings              # Main search endpoint with filters
GET    /api/listings/search       # Advanced search with scoring
GET    /api/listings/recommend    # Personalized recommendations
GET    /api/listings/nearby       # Location-based search
```

### Saved Searches
```
GET    /api/searches/saved        # List user's saved searches
POST   /api/searches/saved        # Create saved search
PUT    /api/searches/saved/:id    # Update saved search
DELETE /api/searches/saved/:id    # Delete saved search
GET    /api/searches/saved/:id/matches # Get new matches for search
```

### Matching Analytics
```
GET    /api/matching/profile      # User's matching profile analysis
GET    /api/matching/history      # Match history and trends
GET    /api/matching/preferences  # Preference optimization suggestions
```

## Database Schema

### Enhanced Listing Model (Search)
```prisma
model Listing {
  // ... existing fields ...

  // Search optimization fields
  searchVector    Unsupported("tsvector")?
  geoIndex        Unsupported("geography(Point,4326)") @db.Geography
  rentBucket      String?  // '0-2000', '2000-4000', etc.
  areaScore       Float?   // Pre-calculated area compatibility

  // Indexes for performance
  @@index([status, availableFrom])
  @@index([rent, neighborhood])
  @@index([geoIndex], type: Gist)
  @@index([searchVector], type: Gin)
}
```

### Saved Search Model
```prisma
model SavedSearch {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  name        String
  filters     Json     // Serialized SearchFilters
  frequency   String   @default("daily")
  lastRun     DateTime?
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, isActive])
}
```

## Implementation Details

### Matching Algorithm Implementation

#### Budget Scoring Function
```typescript
function calculateBudgetScore(listingRent: number, userBudget: BudgetRange): number {
  const { min, max } = userBudget;
  const midPoint = (min + max) / 2;

  if (listingRent >= min && listingRent <= max) {
    // Perfect fit within range
    return 30;
  }

  const deviation = Math.abs(listingRent - midPoint) / midPoint;
  if (deviation <= 0.1) return 25;  // Within 10%
  if (deviation <= 0.2) return 20;  // Within 20%
  if (deviation <= 0.3) return 10;  // Within 30%

  return 0;  // Too far from budget
}
```

#### Location Scoring Function
```typescript
function calculateLocationScore(listingGeo: GeoPoint, userAreas: string[]): number {
  const distances = userAreas.map(area => {
    const areaCenter = getAreaCenter(area);
    return calculateDistance(listingGeo, areaCenter);
  });

  const minDistance = Math.min(...distances);

  // Exponential decay scoring
  if (minDistance <= 1) return 15;      // Within 1km
  if (minDistance <= 3) return 12;      // Within 3km
  if (minDistance <= 5) return 8;       // Within 5km
  if (minDistance <= 10) return 4;      // Within 10km

  return 0;  // Too far
}
```

#### Lifestyle Compatibility
```typescript
function calculateLifestyleScore(
  listingPolicies: PropertyPolicies,
  userPreferences: LifestylePreferences
): number {
  let score = 0;
  const maxScore = 20;

  // Hard filters - automatic disqualification
  if (userPreferences.smoking === 'no' && listingPolicies.smoking !== 'no') {
    return 0;
  }

  if (userPreferences.pets === 'no' && listingPolicies.petsAllowed) {
    return 0;
  }

  // Compatibility scoring
  if (listingPolicies.cleaning === userPreferences.cleaning) score += 5;
  if (listingPolicies.guests === userPreferences.guests) score += 5;
  if (listingPolicies.noise === userPreferences.noise) score += 5;
  if (listingPolicies.religion === userPreferences.religion) score += 5;

  return Math.min(score, maxScore);
}
```

### Search Query Optimization

#### Full-Text Search Setup
```sql
-- Create trigram index for fuzzy text search
CREATE INDEX CONCURRENTLY idx_listing_description_trgm
ON listings USING gin (description gin_trgm_ops);

-- Create searchable vector for weighted search
ALTER TABLE listings ADD COLUMN search_vector tsvector;
CREATE INDEX idx_listing_search ON listings USING gin(search_vector);

-- Update search vector function
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.neighborhood, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();
```

### Real-time Search Processing

#### Debounced Search
- **Frontend**: 300ms debounce on search input
- **Backend**: Query optimization with prepared statements
- **Caching**: Redis cache for popular search terms

#### Pagination Strategy
- **Cursor-based**: Efficient for large result sets
- **Page size**: 20 listings per page (configurable)
- **Sorting**: Relevance, price, date, distance options

## Error Handling

### Search Errors
- `INVALID_FILTERS`: Malformed search parameters
- `LOCATION_NOT_FOUND`: Unable to geocode search location
- `SEARCH_TIMEOUT`: Query took too long to execute
- `RATE_LIMITED`: Too many searches in short time

### Matching Errors
- `PROFILE_INCOMPLETE`: User profile missing required matching data
- `NO_COMPATIBLE_LISTINGS`: No listings match user's criteria
- `LOCATION_UNAVAILABLE`: Search location outside supported area

## Security Considerations

### Search Security
- **Input Sanitization**: All search parameters validated and sanitized
- **Rate Limiting**: Prevent search abuse and DoS attacks
- **Result Filtering**: Sensitive information removed from search results
- **Audit Logging**: Search queries logged for abuse detection

### Privacy Protection
- **Anonymous Searching**: No personal data in search logs
- **Location Privacy**: Approximate location for privacy
- **Preference Encryption**: Sensitive preferences encrypted
- **Data Minimization**: Only necessary data exposed in results

## Integration Points

### Frontend Integration
- **Search Interface**: Real-time search with instant results
- **Filter UI**: Intuitive filter controls with visual feedback
- **Map Integration**: Location-based search with Mapbox
- **Results Display**: Sortable, filterable listing grid

### Notification Integration
- **Match Alerts**: Instant notifications for perfect matches
- **Saved Search Updates**: Regular digests for saved searches
- **Price Drop Alerts**: Notifications when prices decrease
- **New Listing Alerts**: Area-specific new listing notifications

### Analytics Integration
- **Search Analytics**: Popular search terms and patterns
- **Conversion Tracking**: From search to application metrics
- **Performance Monitoring**: Search query performance and latency
- **User Behavior**: Search refinement and abandonment analysis

## Testing Strategy

### Unit Tests
- Individual scoring function accuracy
- Filter validation and sanitization
- Search query construction
- Result sorting and pagination

### Integration Tests
- End-to-end search flow with database
- Matching algorithm accuracy validation
- Saved search notification system
- Geospatial search functionality

### E2E Tests
- Complete search and filter workflow
- Matching results accuracy verification
- Saved search creation and notifications
- Mobile search interface functionality

### Performance Tests
- Search query performance under load
- Large result set pagination efficiency
- Concurrent search operations
- Database query optimization validation

