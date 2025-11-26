'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GmailAuthButton } from '@/components/forms/GmailAuthButton';

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'SEEKER' | 'LISTER'>('SEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/me');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await signUpWithEmail(email, password);

      // Store signup info for onboarding
      sessionStorage.setItem('signupInfo', JSON.stringify({
        userType,
      }));

      // Redirect to verify email or onboarding
      router.push('/auth/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Don't render signup form if already authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join HomeSprint</h1>
          <p className="text-gray-600">Find your perfect home faster</p>
        </div>

        {/* Gmail Auth Button */}
        <div className="mb-6">
          <GmailAuthButton isLoading={loading} onError={setError} />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or with email</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I'm looking to...
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                style={{ borderColor: userType === 'SEEKER' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="userType"
                  value="SEEKER"
                  checked={userType === 'SEEKER'}
                  onChange={(e) => setUserType(e.target.value as 'SEEKER' | 'LISTER')}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-700 font-medium">Find a room or apartment</span>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                style={{ borderColor: userType === 'LISTER' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="userType"
                  value="LISTER"
                  checked={userType === 'LISTER'}
                  onChange={(e) => setUserType(e.target.value as 'SEEKER' | 'LISTER')}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-700 font-medium">List my property</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

