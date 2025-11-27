'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from './supabase/client';

export interface User {
  id: string;
  phone?: string;
  email?: string | null;
  name?: string | null;
  role: 'SEEKER' | 'LISTER' | 'ADMIN';
  lang: string;
  verifiedFlags: any;
  profile_completeness?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestOTP: (phone: string) => Promise<{ debug_otp?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGmail: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Check if user is already logged in via Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Found Supabase session for:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            phone: session.user.user_metadata?.phone,
            role: session.user.user_metadata?.role || 'SEEKER',
            lang: 'en',
            verifiedFlags: { 
              email_verified: session.user.email_confirmed_at ? true : false,
              google_verified: session.user.app_metadata?.provider === 'google',
            },
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            phone: session.user.user_metadata?.phone,
            role: session.user.user_metadata?.role || 'SEEKER',
            lang: 'en',
            verifiedFlags: { 
              email_verified: session.user.email_confirmed_at ? true : false,
              google_verified: session.user.app_metadata?.provider === 'google',
            },
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const requestOTP = async (phone: string) => {
    const response = await fetch('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to request OTP');
    }

    return await response.json();
  };

  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        phone: data.user.user_metadata?.phone,
        role: data.user.user_metadata?.role || 'SEEKER',
        lang: 'en',
        verifiedFlags: { email_verified: data.user.email_confirmed_at ? true : false },
      });
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Signup failed');
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: 'SEEKER',
        lang: 'en',
        verifiedFlags: {},
      });
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Also try the API logout for JWT tokens
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const loginWithGmail = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Gmail login failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        requestOTP,
        signUpWithEmail,
        loginWithGmail,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
