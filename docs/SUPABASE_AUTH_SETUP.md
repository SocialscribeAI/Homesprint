# Supabase Email & Gmail Authentication Setup

This guide shows how to set up email/password and Gmail authentication using Supabase Auth (much simpler than custom OAuth!).

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Environment variables configured in `.env`

## Step 1: Get Your Credentials

Go to your Supabase project dashboard:
1. Click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add to your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication → Providers**
2. Click on **Email** provider
3. Make sure it's **enabled** (green toggle)
4. You can configure:
   - Email confirmations (optional)
   - Password requirements
   - Email templates

The default settings are fine for development!

## Step 3: Enable Google/Gmail Authentication (Optional)

### Option A: Use Supabase Default (Easiest)
1. Go to **Authentication → Providers**
2. Click on **Google**
3. Toggle **Enabled** to ON
4. That's it! Supabase provides built-in Google OAuth

### Option B: Use Your Own Google Credentials (Better for Production)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Create OAuth credentials:
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (dev)
     - `https://yourdomain.com/auth/callback` (prod)
4. Copy Client ID and Client Secret
5. In Supabase **Authentication → Providers → Google**:
   - Paste Client ID
   - Paste Client Secret
   - Enable the provider

## Step 4: Set Redirect URL

1. Go to **Authentication → URL Configuration**
2. Under "Redirect URLs", add:
   - `http://localhost:3000/**` (development)
   - `https://yourdomain.com/**` (production)

This allows Supabase to redirect back to your app after authentication.

## Step 5: Test Email/Password Login

1. Start your app: `pnpm dev`
2. Go to `http://localhost:3000/signup`
3. Sign up with an email and password
4. You should be redirected to verify email (or directly to dashboard depending on settings)
5. Go to `http://localhost:3000/login`
6. Login with the same email and password

## Step 6: Test Gmail Login

1. Go to `http://localhost:3000/login` or `/signup`
2. Click "Sign in with Gmail"
3. You'll be redirected to Google login
4. After logging in with Gmail, you'll be redirected back
5. A new account will be created with your Gmail address

## Environment Variables (.env)

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (from .env.local if needed)
JWT_SECRET=your-jwt-secret
```

## Using Supabase Auth in Code

### Login with Email/Password
```typescript
import { useAuth } from '@/lib/auth-context';

const { login } = useAuth();

await login(email, password);
// User is now logged in
```

### Sign Up with Email/Password
```typescript
import { useAuth } from '@/lib/auth-context';

const { signUpWithEmail } = useAuth();

await signUpWithEmail(email, password);
// New account created, user may need to verify email
```

### Login with Gmail
```typescript
import { useAuth } from '@/lib/auth-context';

const { loginWithGmail } = useAuth();

await loginWithGmail();
// Redirects to Google login, then back to /auth/callback
```

### Get Current User
```typescript
import { useAuth } from '@/lib/auth-context';

const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log('User:', user.email);
}
```

### Logout
```typescript
import { useAuth } from '@/lib/auth-context';

const { logout } = useAuth();

await logout();
// User is now logged out
```

## Database Setup (Users Table)

You'll need to create a custom `users` table to store additional user info:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'SEEKER',
  lang TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read own data
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role)
  VALUES (NEW.id, NEW.email, 'SEEKER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_on_auth_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();
```

## Email Verification (Optional)

To require email verification before login:

1. Go to **Authentication → Email Templates**
2. Customize the confirmation email template
3. Go to **Authentication → Providers → Email**
4. Enable "Confirm email" toggle

Users will receive a confirmation email and must click the link before they can login.

## Common Issues

### "Invalid request" when logging in
- Check that email/password are correct
- Make sure Email provider is enabled in Supabase
- Check browser console for error details

### Gmail login not working
- Verify Google provider is enabled in Supabase
- Check redirect URL is set correctly in both Google Console and Supabase
- Clear browser cookies and try again
- In dev mode, check browser console for errors

### User creation fails
- Check that the `users` table exists (run SQL from "Database Setup" above)
- Check RLS policies allow inserts
- Verify the `create_user_on_auth_signup` trigger is working

### Redirect loop
- Check that redirect URL in Supabase matches your app URL
- Clear browser cookies
- Verify `auth/callback` route exists in your app

## Production Deployment

Before deploying to production:

1. **Enable email verification** - Require users to confirm email
2. **Configure Google OAuth** - Use your own credentials, not Supabase default
3. **Update redirect URLs** - Change from localhost to production domain
4. **Enable password requirements** - Set minimum complexity
5. **Set up SMTP** - Configure email sending service
6. **Enable HTTPS** - Supabase requires secure connections
7. **Test all flows** - Email/password and Gmail login

## Next Steps

1. Follow the "Database Setup" section to create the users table
2. Test email/password login at `/login` and `/signup`
3. (Optional) Set up Gmail login
4. Use the database service layer (`lib/db-service.ts`) to query user data
5. Build your features!

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Auth](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Supabase Dashboard](https://app.supabase.com)

