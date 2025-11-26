# HomeSprint Authentication - Quick Reference Card

## 🚀 Setup in 5 Steps

```bash
# 1. Install
pnpm install

# 2. Create .env.local with credentials
# 3. Setup Supabase (run SQL scripts)
# 4. Add Google OAuth credentials (optional)
# 5. Start dev server
pnpm dev
```

## 🔐 Auth Context Hook

```typescript
const { user, isAuthenticated, loading, login, logout, requestOTP, loginWithGoogle } = useAuth()
```

## 🗄️ Database Queries

### Users
```typescript
await userService.create({ phone, email, name, role })
await userService.findByPhone(phone)
await userService.findByEmail(email)
await userService.findById(userId)
await userService.update(userId, updates)
```

### Profiles
```typescript
await profileService.create(profileData)
await profileService.get(userId)
await profileService.update(userId, updates)
```

### Listings
```typescript
await listingService.getActive({ neighborhood, minRent, maxRent, type })
await listingService.getUserListings(userId)
await listingService.getById(listingId)
await listingService.search(query)
await listingService.getMatchingForUser(userId)
```

## 🛡️ Protect Routes

```typescript
'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (!loading && !isAuthenticated) router.push('/login');
  if (loading) return <LoadingScreen />;

  return <div>Protected content</div>;
}
```

## 🧪 Test Credentials

| Method | Phone | OTP | Notes |
|--------|-------|-----|-------|
| Phone OTP | +972501234567 | Any 6 digits | Development only |
| Google OAuth | N/A | N/A | Requires setup |

## 📍 Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/login` | GET | Login page |
| `/signup` | GET | Signup page |
| `/api/auth/otp/request` | POST | Request OTP |
| `/api/auth/otp/verify` | POST | Verify OTP |
| `/api/auth/google` | POST | Start Google OAuth |
| `/api/auth/google/callback` | GET | Google OAuth callback |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Get current user |

## 🔑 Environment Variables

```env
# Required
JWT_SECRET=<32-char-random-string>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Documentation Files

| File | Contains |
|------|----------|
| `AUTH_SETUP_GUIDE.md` | Complete setup instructions |
| `SETUP_SUMMARY.md` | Overview of changes |
| `EXAMPLE_USAGE.md` | Code examples |
| `docs/GOOGLE_AUTH_SETUP.md` | Google OAuth setup |
| `docs/SUPABASE_DATABASE_QUERIES.md` | Database queries |

## 🎯 Common Patterns

### Check User Role
```typescript
if (user?.role === 'ADMIN') { /* admin content */ }
if (user?.role === 'LISTER') { /* lister features */ }
if (user?.role === 'SEEKER') { /* seeker features */ }
```

### Create Listing
```typescript
const listing = await listingService.create({
  owner_user_id: userId,
  type: 'room',
  address: 'Address',
  neighborhood: 'Neighborhood',
  lat: 31.7683,
  lng: 35.2137,
  rent: 3500,
  description: 'Description',
  available_from: new Date().toISOString()
})
```

### Search Listings
```typescript
const results = await listingService.getActive({
  neighborhood: 'Rehavia',
  minRent: 3000,
  maxRent: 5000,
  type: 'room',
  limit: 20
})
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not sending | Check phone format: `+972` + 9 digits |
| Google OAuth fails | Verify Client ID and redirect URI |
| Database errors | Check Supabase credentials and tables |
| User not found | Check database has RLS policies enabled |

## 🔗 File Locations

```
Core Files:
- lib/auth-context.tsx      ← Auth state & hooks
- lib/db-service.ts         ← All database queries
- lib/supabase.ts           ← Supabase config

Auth Pages:
- app/(auth)/login/page.tsx ← Login page
- app/(auth)/signup/page.tsx ← Signup page
- app/(auth)/layout.tsx     ← Route protection

API Routes:
- app/api/auth/otp/request/route.ts
- app/api/auth/otp/verify/route.ts
- app/api/auth/google/route.ts
- app/api/auth/google/callback/route.ts

Components:
- components/forms/GoogleAuthButton.tsx
```

## 📊 User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | All users, listings, reports, moderation |
| LISTER | Create/manage listings, message seekers |
| SEEKER | Browse, search, apply, message listers |

## ⏱️ Token Expiration

- Access Token: 15 minutes
- Refresh Token: 7 days
- OTP: 10 minutes

## 🚦 Rate Limiting

- OTP Requests: 5 per hour per phone
- Login Attempts: Progressive lockout after 5 failures
- API: 60 requests per minute per IP

## 📈 Flow Diagrams

### Phone OTP Flow
```
User enters phone
    ↓
OTP requested → SMS sent → OTP shown in console (dev)
    ↓
User enters OTP
    ↓
OTP verified → User created/updated → JWT tokens issued
    ↓
User logged in → Redirected to dashboard
```

### Google OAuth Flow
```
Click "Sign in with Google"
    ↓
Redirected to Google login
    ↓
User authenticates
    ↓
Redirected back with code
    ↓
Code exchanged for tokens → User info fetched
    ↓
User created/updated → JWT issued
    ↓
User logged in → Redirected to dashboard
```

## 💡 Pro Tips

1. **Use db-service in all API routes** - Consistency and less code
2. **Import type definitions** - `import { User, Profile, Listing } from '@/lib/db-service'`
3. **Handle errors with try-catch** - Use `handleSupabaseError()` helper
4. **Test with mock data first** - Dev credentials work without Supabase
5. **Check auth context before rendering** - Prevent flashing unauthorized content
6. **Use environment variables** - Never hardcode secrets or URLs

## 🎓 Next: Learn More

- Read: `AUTH_SETUP_GUIDE.md`
- Setup: `SUPABASE_SETUP.md`
- Code: `EXAMPLE_USAGE.md`
- Query: `docs/SUPABASE_DATABASE_QUERIES.md`

## ✅ Checklist for Production

- [ ] `.env.local` configured with all required variables
- [ ] Supabase project created and tables set up
- [ ] Google OAuth credentials configured (if using)
- [ ] Database RLS policies enabled
- [ ] SMS service configured for OTP
- [ ] Error logging and monitoring set up
- [ ] Security headers configured
- [ ] Rate limiting properly configured
- [ ] Database backups configured
- [ ] Testing completed on all auth flows

---

**Save this file for quick reference during development!**

