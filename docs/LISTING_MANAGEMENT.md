# Listing Management System

## Overview
The Listing Management system provides comprehensive tools for creating, editing, publishing, and managing rental property listings. It includes automated completeness scoring, publishing workflows, and administrative oversight.

## Core Components

### 1. Listing Creation & Editing

#### Listing Structure
```typescript
interface Listing {
  id: string;
  ownerUserId: string;
  type: 'room' | 'apartment';
  address: string;
  neighborhood: string;
  geo: { lat: number; lng: number };
  rent: number;              // Monthly rent in ILS
  billsAvg?: number;         // Average monthly bills
  deposit?: number;          // Security deposit amount
  sizeM2?: number;           // Property size in square meters
  rooms?: number;            // Number of rooms
  bathrooms?: number;        // Number of bathrooms
  floor?: number;            // Floor number
  elevator?: boolean;        // Elevator access
  furnished?: boolean;       // Furnished property
  amenities: string[];       // Available amenities
  accessibility: string[];   // Accessibility features
  roommates?: RoommateInfo;  // Current roommate details
  policies?: PropertyPolicies; // Property rules
  availableFrom: Date;       // Earliest availability
  leaseTermMonths?: number;  // Preferred lease length
  photos: string[];          // Photo URLs (max 15)
  videoUrl?: string;         // Video tour URL
  description: string;       // Property description
  completeness: number;      // 0-100 completeness score
  status: ListingStatus;     // draft, active, filled, inactive
  createdAt: Date;
  updatedAt: Date;
}
```

#### Listing Status Flow
```
draft → active → filled/inactive
  ↑       ↓
  └──── paused
```

### 2. Completeness Scoring System

#### Scoring Categories (Total: 100 points)
- **Basic Information**: 25 points
  - Address and neighborhood: 10
  - Property type and size: 10
  - Available from date: 5

- **Financial Details**: 20 points
  - Rent amount: 10
  - Bills average: 5
  - Security deposit: 5

- **Property Features**: 20 points
  - Amenities list: 10
  - Room/bathroom count: 5
  - Furnished status: 5

- **Visual Content**: 20 points
  - At least 3 photos: 10
  - Property description: 5
  - Video tour: 5

- **Additional Details**: 15 points
  - Accessibility features: 5
  - Property policies: 5
  - Roommate information: 5

#### Publishing Requirements
- **Minimum Score**: 70% for publishing
- **Recommended Score**: 85% for optimal visibility
- **Premium Score**: 95% for featured placement

### 3. Publishing Workflow

#### Pre-Publishing Checks
- **Address Validation**: Verify Jerusalem address format
- **Duplicate Detection**: Check for similar listings by same owner
- **Photo Quality**: Basic image validation (size, format)
- **Content Moderation**: Automated inappropriate content detection

#### Publishing Process
1. **Draft Creation**: Initial listing saved as draft
2. **Completeness Check**: Automatic scoring and feedback
3. **Review Process**: Optional manual review for high-value listings
4. **Publishing**: Status changed to 'active'
5. **Visibility**: Appears in search results and feeds

#### Post-Publishing Management
- **Status Updates**: Mark as filled or inactive
- **Performance Tracking**: View counts, application rates
- **Edit Permissions**: Limited editing after publishing
- **Renewal Process**: Automatic or manual renewal options

## API Endpoints

### Listing CRUD
```
GET    /api/listings              # Search and filter listings
GET    /api/listings/:id          # Get specific listing details
POST   /api/listings              # Create new listing (Lister only)
PUT    /api/listings/:id          # Update listing (Owner only)
DELETE /api/listings/:id          # Delete listing (Owner/Admin only)

POST   /api/listings/:id/publish  # Publish draft listing
POST   /api/listings/:id/unpublish # Unpublish active listing
POST   /api/listings/:id/mark-filled # Mark listing as filled
POST   /api/listings/:id/renew    # Renew expired listing
```

### Photo Management
```
POST   /api/listings/:id/photos   # Upload listing photos
DELETE /api/listings/:id/photos/:photoId # Delete specific photo
PUT    /api/listings/:id/photos/reorder # Reorder photo sequence
```

### Listing Analytics (Owner)
```
GET    /api/listings/:id/analytics # View listing performance
GET    /api/listings/:id/views     # Detailed view tracking
GET    /api/listings/:id/applications # Application analytics
```

## Database Schema

### Listing Model
```prisma
model Listing {
  id              String   @id @default(cuid())
  ownerUserId     String
  owner           User     @relation(fields: [ownerUserId], references: [id])

  type            String
  address         String
  neighborhood    String
  geo             Unsupported("geography(Point,4326)")
  rent            Int
  billsAvg        Int?
  deposit         Int?
  sizeM2          Int?
  rooms           Int?
  bathrooms       Int?
  floor           Int?
  elevator        Boolean?
  furnished       Boolean?
  amenities       String[]
  accessibility   String[]
  roommates       Json?
  policies        Json?
  availableFrom   DateTime
  leaseTermMonths Int?
  photos          String[]
  videoUrl        String?
  description     String
  completeness    Int      @default(0)
  status          String   @default("draft")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  Applications    Application[]
  Viewings        Viewing[]
  Reports         Report[]
}
```

## Implementation Details

### Photo Upload System
- **File Validation**: Type (JPEG/PNG), size (max 10MB), dimensions
- **Processing**: Sharp-based resizing and optimization
- **Storage**: Cloudflare R2 or AWS S3 with signed URLs
- **Security**: MIME type checking, virus scanning
- **Limits**: Maximum 15 photos per listing

### Duplicate Prevention
- **Address Matching**: Fuzzy matching for similar addresses
- **Owner Check**: Prevent multiple identical listings per owner
- **Content Analysis**: Text similarity detection in descriptions
- **Geographic Proximity**: Distance-based duplicate detection

### Content Moderation
- **Automated Checks**: Keyword filtering, image analysis
- **Manual Review**: Queue system for flagged content
- **Appeal Process**: Lister ability to contest moderation decisions
- **Escalation**: Automatic admin notification for repeated violations

### Performance Optimization
- **Caching**: Redis caching for hot listings
- **Indexing**: Database indexes on status, location, price
- **Pagination**: Efficient large result set handling
- **Search Optimization**: Full-text search with trigram indexes

## Error Handling

### Listing Validation Errors
- `LISTING_INCOMPLETE`: Completeness score below publishing threshold
- `DUPLICATE_LISTING`: Similar listing already exists
- `INVALID_ADDRESS`: Address format or location validation failed
- `PHOTO_UPLOAD_FAILED`: File upload or processing error
- `INSUFFICIENT_PERMISSIONS`: User lacks listing modification rights

### Publishing Errors
- `MODERATION_FAILED`: Content flagged for review
- `LOCATION_INVALID`: Address outside supported areas
- `PHOTO_QUALITY_LOW`: Images don't meet quality standards

## Security Considerations

### Access Control
- **Ownership Verification**: Server-side owner checks for all modifications
- **Permission Levels**: Different access for owners vs admins
- **Audit Logging**: All listing changes tracked with user attribution
- **Rate Limiting**: Prevent spam listing creation

### Data Protection
- **Address Privacy**: Partial address hiding for security
- **Photo Security**: Signed URLs with expiration
- **Content Sanitization**: HTML sanitization in descriptions
- **PII Protection**: Personal information removal from public data

## Integration Points

### Search Integration
- **Index Updates**: Automatic search index updates on listing changes
- **Filter Support**: Complex filtering based on listing attributes
- **Sorting Options**: Multiple sort criteria (price, date, relevance)
- **Geospatial Queries**: Location-based search with radius filtering

### Matching Integration
- **Profile Compatibility**: Listing attributes matched against seeker preferences
- **Scoring Algorithm**: Automated compatibility scoring
- **Recommendation Engine**: Personalized listing suggestions
- **Saved Searches**: Automatic notifications for new matching listings

### Notification Integration
- **Listing Events**: Email/SMS notifications for status changes
- **Application Alerts**: New application notifications for listers
- **Review Reminders**: Prompts for listing updates
- **Expiration Warnings**: Advance notice of listing expiration

### Analytics Integration
- **Performance Metrics**: View counts, application conversion rates
- **Engagement Tracking**: Time spent viewing, feature interactions
- **Conversion Funnel**: From view to application to viewing
- **Market Insights**: Pricing and demand trend analysis

## Testing Strategy

### Unit Tests
- Completeness scoring calculations
- Validation logic for listing fields
- Permission checking for CRUD operations
- Photo upload and processing functions

### Integration Tests
- Complete listing creation and publishing flow
- Photo upload and management
- Search and filter functionality
- Permission-based access control

### E2E Tests
- Listing creation wizard
- Publishing and unpublishing workflows
- Photo management interface
- Admin listing moderation tools

### Performance Tests
- Large-scale listing search operations
- Photo upload under load
- Concurrent listing modifications
- Database query optimization

