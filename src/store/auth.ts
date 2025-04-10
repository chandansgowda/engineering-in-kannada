import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, options?: { full_name?: string }) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: any | null }>;
  
  // State setters
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      error: null,
      
      // Initialize auth state
      initialize: async () => {
        set({ isLoading: true });
        
        try {
          // Get session from Supabase
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error.message);
            set({ error: error.message });
          } else if (data?.session) {
            set({ 
              session: data.session,
              user: data.session.user as User
            });
          }
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
        
        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            set({ 
              session,
              user: session?.user as User || null,
              isLoading: false
            });
          }
        );
      },
      
      // Sign up with email and password
      signUp: async (email, password, options) => {
        set({ isLoading: true, error: null });
        
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
            set({ error: error.message });
            return { error };
          }
          
          return { error: null };
        } catch (err: any) {
          set({ error: err.message });
          return { error: err };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Sign in with email and password
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ error: error.message });
            return { error };
          }
          
          return { error: null };
        } catch (err: any) {
          set({ error: err.message });
          return { error: err };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Sign in with OAuth provider
      signInWithProvider: async (provider) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: window.location.origin,
            },
          });
          
          if (error) {
            set({ error: error.message });
          }
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            set({ error: error.message });
          } else {
            set({ user: null, session: null });
          }
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          
          if (error) {
            set({ error: error.message });
            return { error };
          }
          
          return { error: null };
        } catch (err: any) {
          set({ error: err.message });
          return { error: err };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Update user profile
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.updateUser({
            data,
          });
          
          if (error) {
            set({ error: error.message });
            return { error };
          }
          
          // Update local user state with new data
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                user_metadata: {
                  ...user.user_metadata,
                  ...data,
                },
              },
            });
          }
          
          return { error: null };
        } catch (err: any) {
          set({ error: err.message });
          return { error: err };
        } finally {
          set({ isLoading: false });
        }
      },
      
      // State setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}
