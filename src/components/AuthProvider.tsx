
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserRole, getCurrentUserProfile } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Tables']['user_roles']['Row']['role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: any;
  role: UserRole | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  isKasir: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cleanup function untuk auth state
const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to reset auth state
  const resetAuthState = () => {
    setUser(null);
    setRole(null);
    setProfile(null);
    setLoading(false);
  };

  // Function to load user data with better error handling
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('No valid session found, resetting auth state');
        resetAuthState();
        return;
      }

      const [userRole, userProfile] = await Promise.all([
        getCurrentUserRole(),
        getCurrentUserProfile()
      ]);
      
      setRole(userRole);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's an error loading user data, it might be due to invalid session
      // Reset the auth state to prevent getting stuck
      resetAuthState();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          cleanupAuthState();
          resetAuthState();
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          cleanupAuthState();
          resetAuthState();
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id);
      
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer data fetching to prevent deadlocks
        setTimeout(() => {
          if (mounted) {
            loadUserData();
          }
        }, 0);
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        if (mounted) {
          resetAuthState();
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Session refreshed successfully, reload user data
        setTimeout(() => {
          if (mounted) {
            loadUserData();
          }
        }, 0);
      } else {
        if (mounted) {
          resetAuthState();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout failed, continuing with login');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      
      // Clean up existing state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors during signout
        console.log('Signout error (ignored):', err);
      }
      
      // Reset state
      resetAuthState();
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      // Even if signout fails, reset local state and redirect
      resetAuthState();
      window.location.href = '/';
    }
  };

  const value = {
    user,
    role,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isOwner: role === 'owner',
    isKasir: role === 'kasir'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
