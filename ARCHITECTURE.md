# HomeSprint Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         │
│  │  Auth Context   │         │  Auth Pages      │         │
│  │  (useAuth)      │◄────────┤  /login          │         │
│  │                 │         │  /signup         │         │
│  └────────┬────────┘         └──────────────────┘         │
│           │                                                 │
│  ┌────────▼─────────────────────────────────────┐         │
│  │  Protected Components & Routes               │         │
│  │  - useAuth() for authentication state        │         │
│  │  - Role-based access control                 │         │
│  │  - Auto-redirect unauthorized users          │         │
│  └───────────┬──────────────────────────────────┘         │
│              │                                              │
└──────────────┼──────────────────────────────────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (API Routes)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐           │
│  │ OTP Auth         │      │ Google OAuth     │           │
│  ├──────────────────┤      ├──────────────────┤           │
│  │ /api/auth/otp    │      │ /api/auth/google │           │
│  │ ├─ request       │      │ ├─ route (init)  │           │
│  │ └─ verify        │      │ └─ callback      │           │
│  └────────┬─────────┘      └────────┬─────────┘           │
│           │                         │                      │
│  ┌────────▼──────────────────────────▼─────────┐          │
│  │  Auth Logic                                  │          │
│  │  - JWT token generation                     │          │
│  │  - User creation/update                     │          │
│  │  - Session management                       │          │
│  └────────┬──────────────────────────────────┬─┘          │
│           │                                  │             │
│  ┌────────▼─────────────────────────────────▼─────────┐   │
│  │  Database Service Layer (db-service.ts)           │   │
│  │                                                    │   │
│  │  ├─ User Service    (CRUD + queries)              │   │
│  │  ├─ Profile Service (CRUD + queries)              │   │
│  │  └─ Listing Service (CRUD + search/filter)        │   │
│  └────────┬───────────────────────────────────────────┘   │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┘
            │ Supabase Client
            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Database)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Users Table   │  │ Profiles Table  │                 │
│  │                 │  │                 │                 │
│  │ - id (PK)       │  │ - user_id (FK)  │                 │
│  │ - phone         │  │ - budget_min    │                 │
│  │ - email         │  │ - budget_max    │                 │
│  │ - name          │  │ - move_in dates │                 │
│  │ - role          │  │ - areas         │                 │
│  │ - verified      │  │ - lifestyle     │                 │
│  │ - verified_flags│  │ - bio           │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │     Listings Table                  │                   │
│  │                                     │                   │
│  │ - id (PK)                           │                   │
│  │ - owner_user_id (FK → users)       │                   │
│  │ - type (room/apartment)             │                   │
│  │ - address, neighborhood             │                   │
│  │ - lat, lng (location)               │                   │
│  │ - rent, bills_avg, deposit          │                   │
│  │ - amenities, accessibility          │                   │
│  │ - photos, description               │                   │
│  │ - status, completeness              │                   │
│  │ - available_from, lease_term        │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │  Row Level Security (RLS) Policies  │                   │
│  │                                     │                   │
│  │ - Users can view own profile        │                   │
│  │ - Users can update own profile      │                   │
│  │ - Public can view active listings   │                   │
│  │ - Owners can manage own listings    │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Phone OTP Authentication Flow

```
Frontend (Login Page)
    │
    ├─── [1] User enters phone number
    │
    └─► Backend: POST /api/auth/otp/request
        │
        ├─── [2] Validate phone format
        │
        ├─── [3] Check rate limiting
        │
        ├─── [4] Generate 6-digit OTP
        │
        ├─► SMS Service: Send OTP (production)
        │   └─ OR Console log OTP (development)
        │
        └─► Frontend: { success: true, debug_otp }
            │
            ├─── [5] Show OTP input field
            │
            └─► User enters OTP
                    │
                    └─► Backend: POST /api/auth/otp/verify
                        │
                        ├─── [6] Validate OTP
                        │
                        ├─► DB: Find or create user
                        │    └─ userService.findByPhone()
                        │    └─ userService.create()
                        │
                        ├─── [7] Generate JWT tokens
                        │    └─ accessToken (15 min)
                        │    └─ refreshToken (7 days)
                        │
                        └─► Frontend: { accessToken, refreshToken, user, redirectTo }
                            │
                            ├─── [8] Store tokens in localStorage
                            │
                            ├─── [9] Set user in auth context
                            │
                            └─── [10] Redirect to dashboard or onboarding
```

### Google OAuth Authentication Flow

```
Frontend (Login/Signup Page)
    │
    ├─── [1] User clicks "Sign in with Google"
    │
    └─► Backend: POST /api/auth/google
        │
        ├─── [2] Generate random state
        │
        ├─── [3] Build Google OAuth URL
        │    └─ client_id
        │    └─ redirect_uri
        │    └─ scope: openid profile email
        │    └─ state (CSRF protection)
        │
        └─► Frontend: { authUrl }
            │
            └─► window.location.href = authUrl
                │
                └─► Google Login Page
                    │
                    ├─ User enters credentials
                    │
                    ├─ User grants permissions
                    │
                    └─► Google redirects to callback URI
                        │
                        └─► Backend: GET /api/auth/google/callback?code=...&state=...
                            │
                            ├─── [4] Verify state (CSRF check)
                            │
                            ├─── [5] Exchange code for tokens
                            │    └─► Google OAuth endpoint
                            │
                            ├─── [6] Fetch user info from Google
                            │
                            ├─► DB: Find or create user
                            │    └─ userService.findByEmail()
                            │    └─ userService.create()
                            │
                            ├─── [7] Update user verification flags
                            │    └─ email_verified: true
                            │    └─ google_verified: true
                            │
                            ├─── [8] Generate JWT tokens
                            │    └─ accessToken (15 min)
                            │    └─ refreshToken (7 days)
                            │
                            └─► Frontend: Set cookies + redirect
                                │
                                ├─── [9] Set httpOnly cookies with tokens
                                │
                                └─── [10] Redirect to /onboarding (new) or /me (existing)
```

## Component Architecture

```
┌─────────────────────────────────────────────────────┐
│              Authentication Context                 │
│         (lib/auth-context.tsx)                      │
└──────────────────┬──────────────────────────────────┘
                   │ provides useAuth() hook
     ┌─────────────┼─────────────┬──────────────────┐
     │             │             │                  │
     ▼             ▼             ▼                  ▼
 LoginPage    SignupPage   ProtectedRoutes   GoogleAuthButton
     │             │             │                  │
     └─────────────┼─────────────┴──────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
  requestOTP  loginWithGoogle  logout
      │            │            │
      └────────────┼────────────┘
                   │
              API Routes
                   │
     ┌─────────────┼──────────────┐
     │             │              │
     ▼             ▼              ▼
  /otp/*      /google/*        /logout
     │             │              │
     └─────────────┼──────────────┘
                   │
            Database Service
                   │
     ┌─────────────┼──────────────┐
     │             │              │
     ▼             ▼              ▼
userService profileService listingService
     │             │              │
     └─────────────┼──────────────┘
                   │
              Supabase
                   │
     ┌─────────────┼──────────────┐
     │             │              │
     ▼             ▼              ▼
  users       profiles        listings
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│           Security Layers                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [1] Input Validation                              │
│  ├─ Phone format validation (E.164)               │
│  ├─ OTP format validation (6 digits)              │
│  ├─ Email validation                              │
│  └─ Zod schema validation                         │
│                                                     │
│  [2] Rate Limiting                                 │
│  ├─ OTP requests: 5/hour per phone               │
│  ├─ Login attempts: Progressive lockout           │
│  └─ API endpoints: 60/min per IP                 │
│                                                     │
│  [3] JWT Token Management                         │
│  ├─ Access tokens: 15 min expiration             │
│  ├─ Refresh tokens: 7 day expiration             │
│  ├─ HS256 signature algorithm                    │
│  └─ Claims: sub, role, exp, iss, aud            │
│                                                     │
│  [4] Database Security (RLS)                      │
│  ├─ Row Level Security policies                  │
│  ├─ Users can only access own data              │
│  ├─ Owners can manage own listings              │
│  └─ Public read-only for active listings        │
│                                                     │
│  [5] Environment Security                        │
│  ├─ Secrets in .env.local (not committed)       │
│  ├─ No secrets in frontend code                 │
│  ├─ httpOnly cookies in production              │
│  └─ HTTPS in production                         │
│                                                     │
│  [6] OAuth Security                              │
│  ├─ CSRF protection with state parameter        │
│  ├─ Code exchange server-side                   │
│  ├─ Secure redirect validation                  │
│  └─ Email verification on OAuth login           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## File Dependencies

```
Auth Pages
    ├─ /login → auth-context → useAuth hook
    ├─ /signup → auth-context → useAuth hook
    └─ /otp/[page] → auth-context → useAuth hook

Auth Context (auth-context.tsx)
    ├─ Uses: fetch API
    ├─ Provides: useAuth hook
    └─ Manages: User state, tokens

API Routes
    ├─ /auth/otp/request → mockDB, JWT
    ├─ /auth/otp/verify → mockDB, JWT
    ├─ /auth/google → JWT
    ├─ /auth/google/callback → mockDB, JWT
    └─ /auth/logout → JWT

Database Service (db-service.ts)
    ├─ Uses: supabase client
    ├─ Provides: userService, profileService, listingService
    └─ Exports: Query methods + type definitions

Supabase Client (supabase.ts)
    ├─ Uses: @supabase/supabase-js
    └─ Exports: supabase instance + types

Components
    ├─ GoogleAuthButton → useAuth hook
    ├─ Protected routes → useAuth hook
    └─ User menu → useAuth hook
```

## Deployment Architecture

```
Development Environment
    ├─ Mock database (in-memory)
    ├─ Debug OTP in console
    ├─ http://localhost:3000
    └─ Simulated SMS

Staging Environment
    ├─ Real Supabase project
    ├─ Real Google OAuth
    ├─ https://staging.yourdomain.com
    ├─ Test SMS service
    └─ Staging deployment

Production Environment
    ├─ Production Supabase
    ├─ Verified Google OAuth
    ├─ https://yourdomain.com
    ├─ Production SMS service
    ├─ Vercel/hosting platform
    └─ Monitoring & logging
        ├─ Error tracking (Sentry)
        ├─ Analytics tracking
        ├─ Database backups
        └─ Security logging
```

## Scalability Considerations

```
Current Architecture (Ready for)
├─ User growth to ~100k
├─ 1000s of listings
├─ Real-time updates (Supabase)
└─ Global deployment (Vercel)

Future Enhancements
├─ Messaging system (Supabase Real-time)
├─ Photo uploads (Supabase Storage)
├─ Advanced matching (PostgreSQL Full Text Search)
├─ Analytics (Supabase Analytics)
├─ Email notifications
├─ Push notifications
└─ Payment processing (Stripe)
```

---

This architecture ensures:
✅ Security - Multiple layers of protection
✅ Scalability - Designed for growth
✅ Maintainability - Clear separation of concerns
✅ Testability - Isolated services
✅ Performance - Efficient database queries
✅ User Experience - Fast, responsive auth flows

