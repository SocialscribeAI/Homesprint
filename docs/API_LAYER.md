# API Layer Architecture

## Overview
The API layer provides a RESTful interface for all HomeSprint platform functionality, built with Next.js Route Handlers and validated using Zod schemas. It implements consistent error handling, authentication middleware, and performance optimizations.

## Core Architecture

### 1. Route Handler Structure

#### Standard Route Handler Pattern
```typescript
// app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const QuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20).max(100),
  // ... other query parameters
});

const BodySchema = z.object({
  // Request body validation
});

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await auth.getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query parameter validation
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Business logic
    const data = await performOperation(query, user);

    return NextResponse.json({
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total: await getTotalCount(query)
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          fields: error.flatten().fieldErrors
        }
      }, { status: 400 });
    }

    console.error('API Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}
```

### 2. Middleware Stack

#### Authentication Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/api/auth', '/api/health'];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verify JWT token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  try {
    const user = await auth.verifyToken(token);
    // Add user to request headers for route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

#### Rate Limiting Middleware
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour for auth
  analytics: true,
});

export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute for API
  analytics: true,
});
```

### 3. Validation Layer

#### Zod Schema Library
```typescript
// lib/schemas/index.ts
export const UserSchema = z.object({
  id: z.string().cuid(),
  phone: z.string().regex(/^\+972\d{9}$/),
  email: z.string().email().optional(),
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['seeker', 'lister', 'admin']),
  lang: z.enum(['en', 'he']).default('en'),
});

export const ListingSchema = z.object({
  type: z.enum(['room', 'apartment']),
  address: z.string().min(5).max(200),
  neighborhood: z.string().min(2).max(50),
  rent: z.number().int().positive().max(50000),
  description: z.string().min(30).max(1200),
  photos: z.array(z.string().url()).min(1).max(15),
  amenities: z.array(z.string()).max(20),
});

export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  minRent: z.number().int().positive().optional(),
  maxRent: z.number().int().positive().optional(),
  type: z.enum(['room', 'apartment']).optional(),
  neighborhood: z.string().optional(),
  furnished: z.boolean().optional(),
  pets: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
```

## API Endpoints Overview

### Authentication Routes
```
POST /api/auth/otp/request     # Request OTP SMS
POST /api/auth/otp/verify      # Verify OTP and return tokens
POST /api/auth/logout          # Invalidate session
```

### User Management Routes
```
GET  /api/me/profile           # Get current user profile
PUT  /api/me/profile           # Update user profile
GET  /api/me/listings          # Get user's listings (lister only)
GET  /api/me/applications      # Get user's applications (seeker only)
GET  /api/me/saved             # Get saved listings
```

### Listing Routes
```
GET  /api/listings              # Search and filter listings
GET  /api/listings/:id          # Get specific listing
POST /api/listings              # Create listing (lister only)
PUT  /api/listings/:id          # Update listing (owner only)
POST /api/listings/:id/publish  # Publish draft listing
POST /api/listings/:id/photos   # Upload listing photos
```

### Application Routes
```
POST /api/listings/:id/applications    # Apply to listing
GET  /api/applications                # Get user's applications
PUT  /api/applications/:id            # Update application status
```

### Messaging Routes
```
GET  /api/threads                     # Get message threads
GET  /api/threads/:id/messages        # Get thread messages
POST /api/threads/:id/messages        # Send message
POST /api/messages/attachments        # Upload attachment
```

### Scheduling Routes
```
POST /api/listings/:id/viewings        # Propose viewing times
PUT  /api/viewings/:id                # Confirm/cancel viewing
GET  /api/calendar/availability       # Check availability
POST /api/calendar/events             # Create calendar event
```

### Admin Routes
```
GET  /api/admin/users                 # List all users
PUT  /api/admin/users/:id             # Update user (admin actions)
GET  /api/admin/queue                 # Moderation queue
POST /api/admin/moderate/listing/:id  # Moderate listing
GET  /api/admin/analytics             # Platform analytics
```

## Error Response Format

### Standardized Error Schema
```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    fields?: Record<string, string[]>;  // Field-specific validation errors
    details?: any;          // Additional error context
  };
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data or parameters
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error
- `MAINTENANCE_MODE`: Service temporarily unavailable

## Performance Optimizations

### Caching Strategy
- **Response Caching**: Redis caching for frequently accessed data
- **Database Query Caching**: Prepared statements and query result caching
- **CDN Integration**: Static asset optimization through CDN

### Database Optimizations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Strategic indexing and query planning
- **Pagination**: Cursor-based pagination for large result sets

### Request Optimization
- **Compression**: Gzip compression for API responses
- **Batch Operations**: Support for bulk API operations
- **Streaming**: Large response streaming for better performance

## Security Implementation

### Input Validation
- **Schema Validation**: Comprehensive Zod schema validation
- **Sanitization**: HTML and XSS protection
- **Type Safety**: TypeScript enforcement throughout

### Authentication & Authorization
- **JWT Validation**: Secure token verification
- **Role-Based Access**: Permission checking per endpoint
- **Request Signing**: API request authentication

### Rate Limiting & Abuse Prevention
- **IP-Based Limiting**: Request rate limiting by IP
- **User-Based Limiting**: Per-user rate limiting
- **Automated Blocking**: Suspicious activity detection

## Monitoring & Observability

### Request Logging
```typescript
// lib/logging.ts
export function logApiRequest(req: NextRequest, res: NextResponse, duration: number) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status: res.status,
    duration,
    userAgent: req.headers.get('user-agent'),
    ip: req.ip,
    userId: req.headers.get('x-user-id'),
  }));
}
```

### Health Checks
```
GET /api/health  # System health status
GET /api/health/db  # Database connectivity check
GET /api/health/redis  # Redis connectivity check
```

## Testing Strategy

### Unit Tests
- Route handler logic testing
- Schema validation testing
- Middleware functionality testing
- Error response formatting

### Integration Tests
- End-to-end API flow testing
- Database integration testing
- External service integration testing
- Authentication flow testing

### E2E Tests
- Complete user journey API testing
- Cross-browser API compatibility
- Mobile API functionality testing
- Error scenario handling

### Performance Tests
- API endpoint load testing
- Concurrent request handling
- Database query performance
- Caching effectiveness validation

### Security Tests
- Authentication bypass attempts
- Input validation edge cases
- Rate limiting effectiveness
- SQL injection prevention

