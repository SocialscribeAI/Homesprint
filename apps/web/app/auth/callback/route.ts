import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    )

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message)}`,
            origin
          )
        )
      }

      console.log('Session exchanged successfully, redirecting to /me')
      
      // Redirect to dashboard
      return NextResponse.redirect(new URL('/me', origin))
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
