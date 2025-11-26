# HomeSprint Authentication Setup Guide

This guide walks you through setting up authentication for HomeSprint with both phone-based OTP and Google OAuth login.

## Quick Start

### 1. Install Dependencies

Make sure all dependencies are installed:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create or update `.env.local` in the root of your project with:

```env
# JWT Configuration (Required)
JWT_SECRET=your-very-secure-jwt-secret-here-generate-32-chars

# Supabase Configuration (Required for database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Google OAuth Configuration (Optional but recommended)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md) to:
- Create Supabase project
- Create database tables
- Enable Row Level Security (RLS)
- Seed sample data

### 4. Set Up Google OAuth (Optional)

Follow the [Google Auth Setup Guide](./docs/GOOGLE_AUTH_SETUP.md) to:
- Create Google Cloud project
- Generate OAuth credentials
- Configure redirect URIs
- Add credentials to `.env.local`

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` and test the authentication flows.

## Authentication Methods

### Phone + OTP Authentication

**Flow:**
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP to verify
4. System creates/updates user and issues JWT tokens

**Test in Development:**
- Phone: `+972501234567` (any format: `+972XXXXXXXXX`)
- OTP: Any 6-digit code in development mode

**Routes:**
- Login: `/login`
- Signup: `/signup`
- API: `/api/auth/otp/request`, `/api/auth/otp/verify`

### Google OAuth Authentication

**Flow:**
1. User clicks "Sign in with Google"
2. Redirects to Google login
3. User authenticates with Google
4. Redirects back with authorization code
5. System exchanges code for user info
6. User created/updated and logged in
7. Redirected to dashboard

**Routes:**
- Login with Google: `POST /api/auth/google`
- Callback: `GET /api/auth/google/callback`
- Login Page: `/login`
- Signup Page: `/signup`

## Project Structure

```
apps/web/
├── app/
│   ├── (auth)/              # Auth route group
│   │   ├── layout.tsx       # Auth layout (protects from already-logged-in users)
│   │   ├── login/
│   │   │   └── page.tsx     # Login page with OTP + Google
│   │   └── signup/
│   │       └── page.tsx     # Signup page with OTP + Google
│   └── api/auth/
│       ├── otp/
│       │   ├── request/     # POST OTP request
│       │   └── verify/      # POST OTP verification
│       ├── google/          # POST Google auth init
│       │   └── callback/    # GET Google callback handler
│       ├── logout/          # POST logout
│       └── me/              # GET current user
├── lib/
│   ├── auth-context.tsx     # Auth React Context
│   ├── auth.ts              # Auth utilities
│   ├── supabase.ts          # Supabase client
│   ├── db-service.ts        # Database queries layer
│   └── mock-db.ts           # Mock DB for development
└── components/
    └── forms/
        └── GoogleAuthButton.tsx  # Google auth button
```

## Key Files

### Auth Context (`lib/auth-context.tsx`)

Provides auth state and methods:

```typescript
const { 
  user,                    // Current user or null
  isAuthenticated,         // Boolean
  loading,                 // Loading state
  login,                   // (phone, otp) => Promise
  logout,                  // () => Promise
  requestOTP,              // (phone) => Promise
  loginWithGoogle,         // () => Promise
  setUser                  // (user) => void
} = useAuth()
```

### Database Service (`lib/db-service.ts`)

Centralized database operations:

```typescript
import { userService, profileService, listingService } from '@/lib/db-service'

// Create user
const user = await userService.create({ phone: '+972501234567' })

// Find user
const user = await userService.findByEmail('user@example.com')

// Get user with profile
const data = await userService.getWithProfile(userId)

// Create profile
const profile = await profileService.create({ user_id: userId, ... })

// Get active listings
const listings = await listingService.getActive({ neighborhood: 'Rehavia' })
```

### Google Auth Button (`components/forms/GoogleAuthButton.tsx`)

Reusable Google auth button component:

```typescript
import { GoogleAuthButton } from '@/components/forms/GoogleAuthButton'

export default function LoginPage() {
  return (
    <div>
      <GoogleAuthButton 
        isLoading={loading}
        onError={(error) => console.error(error)}
      />
    </div>
  )
}
```

## Database Queries

See [Supabase Database Queries Guide](./docs/SUPABASE_DATABASE_QUERIES.md) for:
- User operations (CRUD)
- Profile management
- Listing search and filters
- Advanced queries
- Real-time subscriptions
- Error handling

## API Endpoints

### Authentication

```
POST /api/auth/otp/request
  - Body: { phone: string }
  - Returns: { success: true, debug_otp?: string }

POST /api/auth/otp/verify
  - Body: { phone: string, otp: string }
  - Returns: { success: true, accessToken, refreshToken, user, redirectTo }

POST /api/auth/google
  - Body: {}
  - Returns: { authUrl: string }

GET /api/auth/google/callback?code=...&state=...
  - Callback from Google OAuth
  - Sets tokens and redirects to dashboard

POST /api/auth/logout
  - Headers: { Authorization: Bearer <token> }
  - Returns: { success: true }

GET /api/auth/me
  - Headers: { Authorization: Bearer <token> }
  - Returns: { user: User }
```

## Development vs Production

### Development

- OTP accepts any 6-digit code
- OTP shown in debug mode
- Google OAuth uses http://localhost:3000
- Mock database used if Supabase not configured

### Production

- OTP sent via SMS (Twilio/MessageBird)
- Google OAuth uses https://yourdomain.com
- Real database required (Supabase)
- Proper error handling and security

## Troubleshooting

### OTP Not Sending

1. Check console for debug OTP in development
2. Verify phone format: `+972` followed by 9 digits
3. Check rate limiting: max 5 requests/hour per phone
4. In production, ensure SMS service is configured

### Google Login Fails

1. Verify Client ID and Secret in `.env.local`
2. Check redirect URI matches Google Console settings
3. Ensure app URL in `.env` is correct
4. Check browser console for detailed errors

### User Not Created

1. Verify Supabase credentials
2. Check database tables exist
3. Review server logs for errors
4. Ensure RLS policies allow inserts

### Token Expired

1. Use refresh token to get new access token
2. Refresh tokens automatically handled by auth context
3. Check token expiration in JWT claims

## Security Best Practices

1. **Never commit secrets** - Use `.env.local` and add to `.gitignore`
2. **Use HTTPS in production** - Always use secure connections
3. **Store tokens securely** - Use httpOnly cookies or localStorage
4. **Validate input** - Phone and OTP validation on both client and server
5. **Rate limit requests** - Implemented for OTP endpoint
6. **Enable RLS policies** - Protect user data with row-level security
7. **Rotate credentials regularly** - Especially API keys and secrets
8. **Use strong JWT secrets** - 32+ characters with mix of types

## Next Steps

1. **Test locally** - Verify both OTP and Google auth work
2. **Set up production Supabase** - Create separate project
3. **Configure email/SMS** - Twilio or MessageBird
4. **Implement refresh token** - Handle expired tokens
5. **Add 2FA** - Optional enhanced security
6. **Set up analytics** - Track login events
7. **User onboarding** - Implement profile setup flow

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Auth](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages in console/logs
3. Test in development first
4. Verify environment variables
5. Check Supabase and Google Console for configs

