import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthState, UserSignUpData, SignUpResult, SignInResult, ResetPasswordResult } from './types';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false
  });

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await AuthService.getProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user]);

  // Initialize Auth
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let profile = null;
        if (session?.user) {
          profile = await AuthService.getProfile(session.user.id);
        }

        if (mounted) {
          setState({
            user: session?.user ?? null,
            session,
            profile,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email);
      
      // Synchronous state update first
      const user = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
        SessionService.clearSession();
        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialized: true
        });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Update state immediately with user info
        setState(prev => ({
          ...prev,
          user,
          session,
          loading: false,
          initialized: true
        }));
        
        // Initialize session tracking
        if (user && event === 'SIGNED_IN') {
          SessionService.initSession(user.id);
        }

        // Defer profile fetch to avoid deadlock
        if (user) {
          setTimeout(async () => {
            try {
              const profile = await AuthService.getProfile(user.id);
              setState(prev => ({
                ...prev,
                profile: profile || prev.profile
              }));
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Improved French error messages
        if (error.message.includes('Invalid login credentials')) {
          return {
            data,
            error: { message: "Email ou mot de passe incorrect. Vérifiez vos identifiants." }
          };
        }
        if (error.message.includes('Email not confirmed')) {
          return {
            data,
            error: { message: "Veuillez confirmer votre email avant de vous connecter." }
          };
        }
        if (error.message.includes('Invalid email')) {
          return {
            data,
            error: { message: "Format d'email invalide." }
          };
        }
        return { data, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { data: null, error: { message: error.message || "Erreur de connexion" } };
    }
  };

  const signUp = async (email: string, password: string, userData: UserSignUpData): Promise<SignUpResult> => {
    try {
      const result = await AuthService.signUp(email, password, userData);
      
      if (result.error) {
        // Handle existing user
        if (result.error.message === "EXISTING_USER") {
          return {
            data: result.data,
            error: { 
              message: "Un compte existe déjà avec cet email. Veuillez vous connecter.",
              email: result.error.email
            }
          };
        }
        return { 
          data: result.data, 
          error: { message: result.error.message || "Erreur lors de l'inscription" } 
        };
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message || "Erreur lors de l'inscription" } 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      SessionService.clearSession();
      toast.success('Déconnexion réussie');
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        return { error: { message: error.message } };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "Erreur lors de la réinitialisation" } };
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
