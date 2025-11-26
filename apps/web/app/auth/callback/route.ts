import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  console.log('Auth callback received:', { code: !!code, error, origin })

  // Handle errors from Supabase
  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
        origin
      )
    )
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(
        new URL('/login?error=Configuration error', origin)
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message)}`,
            origin
          )
        )
      }

      console.log('Session created successfully for user:', data.user?.email)

      // Create response with redirect to dashboard
      const response = NextResponse.redirect(new URL('/me', origin))
      
      // Set session cookies if available
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }

      return response
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', origin)
      )
    }
  }

  // If no code or error, redirect to home (not login to avoid loop)
  console.log('No code or error in callback, redirecting to home')
  return NextResponse.redirect(new URL('/', origin))
}

