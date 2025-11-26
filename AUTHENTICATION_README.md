# HomeSprint Authentication System

Complete authentication setup with Phone OTP and Google OAuth, plus a comprehensive database service layer for Supabase.

## 🎯 What's Included

### Authentication Methods
- ✅ **Phone + OTP**: Traditional authentication via SMS verification
- ✅ **Google OAuth**: Modern OAuth 2.0 integration with Google
- ✅ **JWT Tokens**: Secure token-based sessions
- ✅ **Role-Based Access**: Support for ADMIN, LISTER, and SEEKER roles

### Components & Pages
- ✅ Beautiful login page with both auth methods
- ✅ Comprehensive signup page with role selection
- ✅ Protected auth routes (prevents already-logged-in users)
- ✅ Google auth button component
- ✅ Loading states and error handling

### Backend Infrastructure
- ✅ OTP request/verification API routes
- ✅ Google OAuth initialization and callback handlers
- ✅ JWT token generation and management
- ✅ Database service layer with 25+ query methods
- ✅ Rate limiting and security measures

### Database Layer
- ✅ User management (CRUD)
- ✅ Profile management
- ✅ Listing management with advanced filters
- ✅ Search and matching algorithms
- ✅ Type-safe queries with TypeScript

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `AUTH_SETUP_GUIDE.md` | **START HERE** - Complete setup instructions |
| `SETUP_SUMMARY.md` | Overview of all changes and file structure |
| `EXAMPLE_USAGE.md` | Practical code examples and usage patterns |
| `docs/GOOGLE_AUTH_SETUP.md` | Detailed Google OAuth configuration |
| `docs/SUPABASE_DATABASE_QUERIES.md` | Database queries reference |
| `SUPABASE_SETUP.md` | Supabase database initialization |

## 🚀 Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp environment-keys.txt .env.local

# Edit .env.local with your values:
# - JWT_SECRET (generate a random string)
# - Supabase URL and key
# - Google OAuth credentials (optional)
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Supabase
```bash
# Open SUPABASE_SETUP.md and follow the SQL scripts
# Or ask your team for database credentials
```

### 4. Start Development
```bash
pnpm dev
# Visit http://localhost:3000
```

### 5. Test Authentication
- **Phone OTP**: Go to `/signup` → Enter `+972501234567` → OTP: any 6 digits
- **Google OAuth**: Click "Sign in with Google" button (requires Google setup)

## 📁 File Organization

```
apps/web/
├── app/(auth)/                    # Authentication route group
│   ├── layout.tsx                 # Redirect authenticated users
│   ├── login/page.tsx             # Login with OTP & Google
│   └── signup/page.tsx            # Signup with OTP & Google
│
├── app/api/auth/                  # API endpoints
│   ├── otp/
│   │   ├── request/route.ts       # Generate OTP
│   │   └── verify/route.ts        # Verify OTP & login
│   ├── google/
│   │   ├── route.ts               # Start OAuth flow
│   │   └── callback/route.ts      # Handle OAuth callback
│   ├── logout/route.ts            # Logout endpoint
│   └── me/route.ts                # Get current user
│
├── lib/
│   ├── auth-context.tsx           # React auth context & hooks
│   ├── db-service.ts              # Database queries (25+ methods)
│   ├── supabase.ts                # Supabase client config
│   └── mock-db.ts                 # Mock DB for development
│
└── components/forms/
    └── GoogleAuthButton.tsx       # Reusable Google auth button
```

## 🔑 Key Features

### Authentication Context
```typescript
const { user, isAuthenticated, loading, login, logout, requestOTP, loginWithGoogle } = useAuth()
```

### Database Service
```typescript
// Users
userService.create({ phone, email, name, role })
userService.findByPhone(phone)
userService.findByEmail(email)
userService.getWithProfile(userId)

// Listings
listingService.getActive({ neighborhood, minRent, maxRent })
listingService.search(query)
listingService.getMatchingForUser(userId)

// Profiles
profileService.create(profileData)
profileService.update(userId, updates)
```

## 🔐 Security

- Rate limiting: 5 OTP requests/hour per phone
- JWT expiration: 15 min access + 7 day refresh
- Phone validation: International E.164 format
- Environment variables for all secrets
- Row-level security on Supabase
- HTTPS-only cookies in production

## 🧪 Testing

### Test Phone OTP
```
Phone: +972501234567
OTP: Any 6-digit number (in development)
```

### Test Google OAuth
1. Set up Google OAuth credentials (see `docs/GOOGLE_AUTH_SETUP.md`)
2. Click "Sign in with Google" button
3. Authenticate with Google account
4. User auto-created or authenticated

### Mock Data
Development database includes:
- Admin user: `+972501234567`
- Lister user: `+972502468135`
- Seeker user: `+972506843297`

## 📚 Common Tasks

### Protecting Routes
```typescript
'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (!loading && !isAuthenticated) {
    router.push('/login');
  }

  return <div>Protected content</div>;
}
```

### Checking User Role
```typescript
const { user } = useAuth();

if (user?.role === 'ADMIN') {
  // Show admin panel
}

if (user?.role === 'LISTER') {
  // Show lister features
}
```

### Querying Database
```typescript
import { listingService } from '@/lib/db-service';

// Get active listings
const listings = await listingService.getActive({
  neighborhood: 'Rehavia',
  maxRent: 5000
});

// Get user's listings
const myListings = await listingService.getUserListings(userId);

// Search listings
const results = await listingService.search('quiet room');
```

### Creating API Endpoints
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const listings = await listingService.getActive();
    return NextResponse.json({ data: listings });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## 🐛 Troubleshooting

### OTP Not Working
1. Check phone format: `+972` + 9 digits
2. In development, any 6 digits works
3. Check rate limiting: max 5/hour per phone
4. View debug OTP in browser console (dev mode)

### Google OAuth Not Working
1. Verify Client ID in `.env.local`
2. Check redirect URI matches Google Console
3. Ensure `NEXT_PUBLIC_APP_URL` is correct
4. Clear browser cache and try again

### User Not Authenticating
1. Verify Supabase credentials
2. Check database tables exist
3. Ensure RLS policies allow reads
4. Check browser console for errors

### Database Queries Failing
1. Verify Supabase is configured
2. Check network tab for failed requests
3. Review Supabase dashboard logs
4. Verify table schema matches types

## 📱 Environment Variables

**Minimal Setup** (phone OTP only)
```env
JWT_SECRET=generate-random-32-char-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Full Setup** (with Google OAuth)
```env
JWT_SECRET=generate-random-32-char-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment Checklist

- [ ] Environment variables set in hosting platform
- [ ] Supabase production project created
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] JWT secret is secure and unique
- [ ] Database tables created with RLS policies
- [ ] Email/SMS service configured for OTP (optional)
- [ ] Logging and monitoring set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Security headers configured

## 📞 Next Steps

1. **Read the setup guide**: `AUTH_SETUP_GUIDE.md`
2. **Set up Supabase**: `SUPABASE_SETUP.md`
3. **Configure Google OAuth** (optional): `docs/GOOGLE_AUTH_SETUP.md`
4. **Review examples**: `EXAMPLE_USAGE.md`
5. **Check database queries**: `docs/SUPABASE_DATABASE_QUERIES.md`

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Google OAuth Flow](https://developers.google.com/identity/protocols/oauth2)
- [Next.js App Router](https://nextjs.org/docs/app)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ✨ What Makes This Special

- **Complete Solution**: Both phone OTP and Google OAuth included
- **Type Safe**: Full TypeScript support throughout
- **Database Ready**: 25+ pre-built query methods
- **Well Documented**: Multiple guide documents with examples
- **Production Ready**: Security best practices implemented
- **Developer Friendly**: Mock data and debug modes included
- **Scalable**: Service layer architecture for easy expansion

## 📝 License

Part of the HomeSprint project - Private and proprietary.

---

**Status**: ✅ Ready to Use

All components are built and documented. Follow `AUTH_SETUP_GUIDE.md` to get started!

