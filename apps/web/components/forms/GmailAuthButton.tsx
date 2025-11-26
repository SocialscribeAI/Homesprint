'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface GmailAuthButtonProps {
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export function GmailAuthButton({
  isLoading = false,
  onError,
}: GmailAuthButtonProps) {
  const { loginWithGmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGmailLogin = async () => {
    try {
      setLoading(true);
      await loginWithGmail();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gmail login failed';
      console.error('Gmail login error:', error);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGmailLogin}
      disabled={isLoading || loading}
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
    >
      {/* Google Icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_3_2)">
          <path
            d="M23.745 12.27c0-.79-.07-1.54-.187-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.85c2.27-2.09 3.575-5.17 3.575-8.81z"
            fill="#4285F4"
          />
          <path
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-3c-1.08.72-2.45 1.13-4.08 1.13-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.05 21.3 7.12 24 12 24z"
            fill="#34A853"
          />
          <path
            d="M5.27 14.26C5.02 13.56 4.88 12.81 4.88 12s0-1.56.27-2.26V6.65h-3.98c-.6 1.19-.94 2.51-.94 3.85s.34 2.66.94 3.85l3.98-3.09z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.92 1.08 15.24 0 12 0 7.12 0 3.05 2.7 1.29 6.65l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
            fill="#EA4335"
          />
        </g>
        <defs>
          <clipPath id="clip0_3_2">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <span className="text-gray-700 font-medium">
        {loading ? 'Signing in...' : 'Sign in with Gmail'}
      </span>
    </button>
  );
}

