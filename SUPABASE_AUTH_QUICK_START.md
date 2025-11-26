# Supabase Email & Gmail Auth - Quick Start

Set up authentication with email/password and Gmail in 10 minutes.

## ✅ Step 1: Create `.env` File

Create a file named `.env` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=generate-a-random-secret-string-here
```

**Get these values from:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project
3. Settings → API → Copy the URL and anon key

## ✅ Step 2: Install Dependencies

```bash
pnpm install
```

## ✅ Step 3: Enable Email Auth in Supabase

1. Go to Supabase dashboard
2. Click **Authentication** → **Providers**
3. Find **Email** and make sure it's **Enabled** (green toggle)
4. Done! Email authentication is ready

## ✅ Step 4: Enable Gmail Auth (Optional)

1. Go to Supabase dashboard
2. Click **Authentication** → **Providers**  
3. Find **Google** and toggle **Enabled**
4. That's it! Gmail login is ready

> For production, you can add your own Google credentials instead of using Supabase's default.

## ✅ Step 5: Set Redirect URL

1. In Supabase: **Authentication** → **URL Configuration**
2. Under "Redirect URLs", add:
   - `http://localhost:3000/**` (development)
   - `https://yourdomain.com/**` (production)
3. Click "Update"

## ✅ Step 6: Create Users Table (Database)

Open Supabase dashboard and go to **SQL Editor**. Run this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'SEEKER',
  lang TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read own data
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT USING (auth.uid() = id);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role)
  VALUES (NEW.id, NEW.email, 'SEEKER')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_on_auth_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();
```

## ✅ Step 7: Start the App

```bash
pnpm dev
```

## ✅ Step 8: Test It!

### Test Email/Password Signup
1. Visit: `http://localhost:3000/signup`
2. Enter email and password
3. Click "Create Account"
4. You should be redirected to `/auth/verify-email` or dashboard

### Test Email/Password Login
1. Visit: `http://localhost:3000/login`
2. Enter the email and password you just created
3. Click "Sign In"
4. You should be logged in!

### Test Gmail Login
1. Visit: `http://localhost:3000/login` or `/signup`
2. Click "Sign in with Gmail"
3. You'll be redirected to Google
4. Sign in with your Gmail account
5. You'll be redirected back and logged in!

## 🎉 That's It!

You now have:
- ✅ Email/password authentication
- ✅ Gmail authentication
- ✅ User management in Supabase
- ✅ Database ready for profiles, listings, etc.

## 📖 What's Happening Behind the Scenes

**Frontend (Pages)**
- `/login` - Login page with email and Gmail options
- `/signup` - Signup page with email and Gmail options
- `/auth/callback` - Handles Gmail redirect

**Backend**
- Supabase Auth handles all authentication
- Users are auto-created in the `users` table
- Database service (`lib/db-service.ts`) has query methods ready

**Auth Context**
- `useAuth()` hook provides:
  - `user` - Current user info
  - `login(email, password)` - Login with email/password
  - `signUpWithEmail(email, password)` - Create account
  - `loginWithGmail()` - Login with Gmail
  - `logout()` - Logout
  - `isAuthenticated` - Check if user is logged in

## 💡 Common Tasks

### Get Current User
```typescript
import { useAuth } from '@/lib/auth-context';

export default function Component() {
  const { user } = useAuth();
  return <div>Hello, {user?.email}</div>;
}
```

### Protect a Route
```typescript
'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
  }

  return <div>Only logged in users can see this</div>;
}
```

### Query User Data
```typescript
import { userService } from '@/lib/db-service';

const user = await userService.findByEmail('user@example.com');
```

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid credentials" | Check email/password are correct |
| Gmail button doesn't work | Make sure Google provider is enabled in Supabase |
| User not created | Check that `users` table exists and trigger is created |
| Redirect loop | Check URL Configuration in Supabase |
| Can't find .env values | Make sure you copied from Supabase API settings, not Auth settings |

## 📚 Learn More

- [Supabase Auth Setup Doc](./docs/SUPABASE_AUTH_SETUP.md) - Full setup guide
- [Database Queries](./docs/SUPABASE_DATABASE_QUERIES.md) - Query examples
- [Code Examples](./EXAMPLE_USAGE.md) - How to use auth in your code
- [Supabase Docs](https://supabase.com/docs/guides/auth) - Official docs

## 🚀 Next Steps

1. Customize the login/signup pages (colors, text, etc.)
2. Add profile fields to the `users` table
3. Create profiles and listings tables
4. Add email verification requirement (optional)
5. Deploy to production

---

**Questions?** Check the setup docs or Supabase documentation!

