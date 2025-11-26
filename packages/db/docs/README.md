# Database Package 📊

Prisma-based database layer for HomeSprint, including schema definitions, migrations, and seed data.

## Overview

This package contains the complete database schema for HomeSprint using Prisma ORM. It defines all the core entities for the rental platform including users, listings, applications, messaging, scheduling, and payments.

## Schema Overview

### Core Entities

- **Users**: Platform users with roles (SEEKER, LISTER, ADMIN)
- **Profiles**: Detailed user preferences and requirements
- **Listings**: Rental property listings with full details
- **Applications**: Rental applications from seekers to listings
- **Threads & Messages**: In-platform messaging system
- **Viewings**: Scheduled property viewing appointments
- **Reports**: Admin moderation and user reporting system
- **Payments**: Stripe-based payment processing

### Key Features

- **Role-based Access**: Three user types with different permissions
- **Geospatial Data**: Property locations stored as PostGIS geography
- **Real-time Messaging**: Thread-based conversation system
- **Application Workflow**: Complete rental application process
- **Payment Integration**: Secure payment processing with Stripe
- **Admin Moderation**: Reporting and moderation tools

## Database Setup

### Prerequisites

- PostgreSQL database (Supabase recommended)
- Node.js 18+ and pnpm

### Environment Variables

Create a `.env` file in the db package directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/homesprint"
```

### Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed with sample data
pnpm db:seed
```

## Schema Details

### Users Table
- Authentication and profile management
- Role-based permissions (SEEKER/LISTER/ADMIN)
- Verification flags for trust indicators
- Multi-language support

### Listings Table
- Complete property information
- Geospatial indexing for location queries
- Media management (photos, videos)
- Status workflow (draft → active → inactive)

### Applications Table
- Rental application process
- Scoring system for matching
- Viewing scheduling integration
- Status tracking

### Messaging System
- Thread-based conversations
- Real-time messaging support
- Unread count management
- Attachment support

### Payment System
- Stripe integration
- Multiple fee types
- Transaction tracking
- Refund management

## Development

### Adding New Models

1. Update `prisma/schema.prisma` with new models
2. Run `pnpm db:generate` to update the client
3. Update seed data if needed
4. Test with `pnpm db:studio`

### Database Migrations

For production deployments:

```bash
# Create a new migration
pnpm db:migrate

# Apply migrations
pnpm db:migrate deploy
```

### Query Optimization

The schema includes strategic indexes for:
- Location-based searches (`geo` column)
- Status-based filtering (applications, listings)
- Time-based queries (availability, messages)
- User-specific queries (ownership, applications)

## Testing

```bash
# Seed with test data
pnpm db:seed

# Use Prisma Studio to verify data
pnpm db:studio
```

## Integration

This package is used by the main web application through the Prisma Client. Import the client:

```typescript
import { prisma } from '@homesprint/db'
```

The Prisma client is configured with connection pooling and is ready for production use with Supabase.
