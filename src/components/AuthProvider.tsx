
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
  };

  // Function to load user data with better error handling
  const loadUserData = async () => {
    try {
      console.log('Loading user data...');
      
      const [userRole, userProfile] = await Promise.all([
        getCurrentUserRole(),
        getCurrentUserProfile()
      ]);
      
      console.log('User role:', userRole, 'User profile:', userProfile);
      setRole(userRole);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't reset auth state here, just log the error
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          cleanupAuthState();
          resetAuthState();
          setLoading(false);
          return;
        }

        console.log('Initial session:', !!session?.user);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          cleanupAuthState();
          resetAuthState();
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, !!session?.user);
      
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Load user data after successful login
        setTimeout(async () => {
          if (mounted) {
            await loadUserData();
            setLoading(false);
          }
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          resetAuthState();
          setLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user && mounted) {
          // Session refreshed successfully, reload user data if needed
          if (!role || !profile) {
            setTimeout(async () => {
              if (mounted) {
                await loadUserData();
              }
            }, 100);
          }
        } else if (!session && mounted) {
          resetAuthState();
          setLoading(false);
        }
      } else {
        if (mounted) {
          setLoading(false);
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
      console.log('Attempting sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', !!data.user);
      // Don't redirect here, let the auth state change handle it
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      
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
      console.log('Signing out...');
      
      // Reset state first
      resetAuthState();
      
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setLoading(false);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if signout fails, reset local state
      resetAuthState();
      setLoading(false);
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
