
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

  // Function to load user data
  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId);
      
      const [userRole, userProfile] = await Promise.all([
        getCurrentUserRole(),
        getCurrentUserProfile()
      ]);
      
      console.log('Loaded role:', userRole, 'profile:', userProfile);
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
          resetAuthState();
          setLoading(false);
          return;
        }

        console.log('Initial session:', !!session?.user);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
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
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Load user data after successful sign in
        await loadUserData(session.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        resetAuthState();
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        // If we don't have role/profile data, reload it
        if (!role || !profile) {
          await loadUserData(session.user.id);
        }
        setLoading(false);
      } else if (!session) {
        resetAuthState();
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [role, profile]);

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
        setLoading(false);
        throw error;
      }
      
      console.log('Sign in successful:', !!data.user);
      // Auth state change will handle the rest
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
      
      if (error) {
        setLoading(false);
        throw error;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      resetAuthState();
      await supabase.auth.signOut();
      setLoading(false);
    } catch (error) {
      console.error('Sign out error:', error);
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
