# Google OAuth Setup for HomeSprint

This guide walks you through setting up Google OAuth authentication for the HomeSprint application.

## Prerequisites

- A Google Cloud Console account
- Access to your HomeSprint project
- Node.js and npm/pnpm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "HomeSprint" (or your preferred name)
5. Click "CREATE"
6. Wait for the project to be created (this may take a minute)

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to the search bar and search for "Google+ API"
2. Click on "Google+ API" in the results
3. Click the "ENABLE" button
4. Wait for it to be enabled

## Step 3: Create OAuth 2.0 Credentials

1. In the Google Cloud Console, click on "Credentials" in the left sidebar
2. Click "Create Credentials" at the top
3. Select "OAuth client ID"
4. If prompted, first click on "Configure OAuth consent screen"

### Configure OAuth Consent Screen

1. Choose "External" for User Type and click "CREATE"
2. Fill in the OAuth consent screen form:
   - **App name**: HomeSprint
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
3. Click "SAVE AND CONTINUE"
4. On "Scopes" page, click "ADD OR REMOVE SCOPES"
5. Add these scopes:
   - `openid`
   - `email`
   - `profile`
6. Click "UPDATE" and then "SAVE AND CONTINUE"
7. Click "SAVE AND CONTINUE" on the "Test users" page
8. Review and click "BACK TO DASHBOARD"

### Create OAuth Client ID

1. Go back to "Credentials" page
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name it: "HomeSprint Web"
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Click "CREATE"
8. Copy your Client ID and Client Secret

## Step 4: Add Credentials to Your Project

1. Open or create `.env.local` in the root of your HomeSprint project:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace:
   - `your-client-id-here.apps.googleusercontent.com` with your actual Client ID
   - `your-client-secret-here` with your actual Client Secret
   - `http://localhost:3000` with your app's URL

## Step 5: Test Google Authentication

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3000/signup or http://localhost:3000/login

3. Click the "Sign in with Google" button

4. You should be redirected to the Google login page

5. After logging in, you should be redirected back to your app

## Troubleshooting

### "Invalid Client" Error

- Double-check that your Client ID and Client Secret are correct
- Ensure you copied the entire Client ID (including `.apps.googleusercontent.com`)
- Make sure your Client Secret is NOT exposed in frontend code

### "Redirect URI Mismatch" Error

- Verify that your redirect URI in Google Cloud Console exactly matches what you're using in your app
- Check that the protocol (http vs https) matches
- Ensure there are no trailing slashes or extra characters

### "Access Blocked" or "This app isn't verified" Error

- This happens when using unverified Google OAuth apps in development
- Click "Continue" or "Go to [app name]" to proceed
- To remove this warning in production, you need to complete the Google verification process

### User Not Created in Database

- Check that your database is properly configured
- Verify Supabase credentials in `.env.local`
- Check the server logs for any database errors

## Production Deployment

Before deploying to production:

1. Update your environment variables with production URLs
2. Add your production domain to Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`
3. Ensure your `.env` variables are set in your hosting platform (Vercel, etc.)
4. Submit your app for verification to remove the "App isn't verified" warning

## How It Works

1. User clicks "Sign in with Google"
2. User is redirected to Google's login page
3. After successful login, Google redirects back to `/api/auth/google/callback`
4. Your app exchanges the code for tokens
5. User info is fetched from Google
6. User is created or updated in your database
7. JWT tokens are generated
8. User is logged in and redirected to dashboard

## Security Notes

- Never commit your Client Secret to version control
- Always use HTTPS in production
- Store credentials in environment variables, not in code
- Keep your refresh tokens secure and server-side when possible
- Regularly rotate credentials if they're exposed

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Next.js OAuth Setup](https://nextjs.org/docs)

