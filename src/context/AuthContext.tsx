import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, User } from '../types';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Get session from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        setError(error.message);
      } else if (data?.session) {
        setSession(data.session);
        setUser(data.session.user as User);
      }
      
      setIsLoading(false);

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user as User || null);
          setIsLoading(false);
        }
      );

      // Clean up the subscription
      return () => {
        authListener?.subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    options?: { full_name?: string }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options?.full_name || '',
          },
        },
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data,
      });
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      // Update local user state with new data
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...data,
          },
        });
      }
      
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
