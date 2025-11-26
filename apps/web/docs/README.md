# Web Application 🌐

The main Next.js web application for HomeSprint, featuring marketing pages and authenticated user experiences.

## Overview

Built with Next.js 14 App Router, this application serves both marketing content and the full authenticated rental platform experience. It includes OTP-based authentication, property listings, messaging, applications, and scheduling features.

## Architecture

### Route Groups

- **`(marketing)`**: Public marketing pages (homepage, pricing, legal)
- **`(auth)`**: Authentication flows (OTP login)
- **`(app)`**: Protected authenticated application routes

### Key Features

- **Marketing Site**: Homepage, pricing, university pages, legal docs
- **Authentication**: OTP-based phone number verification
- **Property Listings**: Browse, search, and view rental properties
- **User Dashboard**: Profile management, saved listings, applications
- **Messaging**: In-platform communication between seekers and listers
- **Applications**: Rental application process with scheduling
- **Admin Panel**: Moderation tools and platform management

## Route Structure

### Marketing Routes (`(marketing)`)

```
/                     # Homepage with hero, features, testimonials
/pricing              # Pricing plans and features
/universities/[slug]  # University-specific landing pages
/legal/privacy        # Privacy policy
/legal/terms          # Terms of service
```

### Authentication Routes (`(auth)`)

```
/login/otp           # OTP verification page
```

### Application Routes (`(app)`)

#### Public Routes
```
/listings            # Browse all active listings
/listing/[id]        # Individual listing details page
```

#### Protected Routes (require authentication)
```
/me                   # User dashboard/profile
/me/listings          # User's property listings (listers only)
/me/applications      # User's rental applications (seekers)
/me/saved             # Saved/favorited listings
/messages             # Message inbox
/messages/[id]        # Individual conversation thread
/schedule             # Viewing appointments calendar
```

#### Admin Routes
```
/admin/flags          # Admin moderation dashboard
/admin/listings       # All platform listings (admin view)
```

## API Routes

### Authentication
- `POST /api/auth/otp/request` - Request OTP code
- `POST /api/auth/otp/verify` - Verify OTP and login
- `POST /api/auth/logout` - Logout user

### Listings
- `GET /api/listings` - Get listings with filtering
- `GET /api/listings/[id]` - Get specific listing
- `POST /api/listings/[id]/viewings` - Schedule viewing

### User Management
- `GET /api/me/profile` - Get user profile
- `PUT /api/me/profile` - Update user profile

### Messaging
- `GET /api/threads/[id]/messages` - Get thread messages
- `POST /api/threads/[id]/messages` - Send message

### Payments
- `POST /api/payments/checkout` - Create payment session
- `POST /api/payments/webhook` - Stripe webhook handler

## Key Components

### Layouts
- **Marketing Layout**: Header/footer for public pages
- **App Layout**: Sidebar navigation for authenticated users

### Pages
- **Homepage**: Hero section, feature highlights, testimonials
- **Listings Page**: Search, filters, property grid
- **Listing Detail**: Full property information, image gallery
- **User Profile**: Profile completion, preferences
- **Messages**: Thread list and conversation view
- **Schedule**: Calendar view of appointments

## Development

### Getting Started

```bash
cd apps/web
pnpm dev
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=secure-random-string
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Key Technologies

- **Next.js 14**: App Router, server components, API routes
- **Supabase**: Database, real-time subscriptions, auth
- **Tailwind CSS**: Styling with custom design tokens
- **Framer Motion**: Animations and transitions
- **Radix UI**: Accessible component primitives
- **Stripe**: Payment processing

### Authentication Flow

1. User enters phone number
2. OTP sent via SMS/email
3. User enters OTP code
4. JWT token created and stored
5. User redirected to dashboard

### Data Fetching

- **Server Components**: Initial page loads, SEO-critical data
- **Client Components**: Interactive features, real-time updates
- **Supabase Client**: Direct database queries from client
- **API Routes**: Complex business logic, external integrations

### Real-time Features

- **Live Messaging**: Real-time message updates
- **Listing Availability**: Instant availability changes
- **Application Status**: Live status updates
- **Viewing Confirmations**: Real-time scheduling

## Deployment

The application is configured for Vercel deployment with:

- **Edge Functions**: API routes at edge locations
- **Image Optimization**: Next.js built-in optimization
- **Static Generation**: Marketing pages pre-rendered
- **ISR**: Dynamic pages with incremental regeneration

## Testing

```bash
# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Integration Points

- **Database**: Direct Supabase queries and Prisma client
- **UI Components**: Shared components from `@homesprint/ui`
- **Payments**: Stripe integration for secure transactions
- **File Storage**: Supabase Storage for listing photos
- **Real-time**: Supabase real-time subscriptions
