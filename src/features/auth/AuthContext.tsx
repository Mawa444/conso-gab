import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthState, UserSignUpData, SignUpResult, SignInResult, ResetPasswordResult } from './types';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTOTYPE_AUTH_KEY = 'gb_prototype_access';
const PROTOTYPE_USER_ID = 'prototype-user';

const isPrototypeAccessEnabled = () => {
  try {
    return localStorage.getItem(PROTOTYPE_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

const persistPrototypeAccess = (enabled: boolean) => {
  try {
    if (enabled) {
      localStorage.setItem(PROTOTYPE_AUTH_KEY, 'true');
      return;
    }

    localStorage.removeItem(PROTOTYPE_AUTH_KEY);
  } catch (error) {
    console.warn('Failed to persist prototype access:', error);
  }
};

const createPrototypeUser = (): User => ({
  id: PROTOTYPE_USER_ID,
  aud: 'authenticated',
  app_metadata: {
    provider: 'prototype',
    providers: ['prototype']
  },
  user_metadata: {
    pseudo: 'Présentation',
    role: 'consumer',
    isPrototype: true
  },
  email: 'presentation@consogab.local',
  created_at: new Date(0).toISOString()
} as User);

const createPrototypeSession = (user: User): Session => ({
  access_token: 'prototype-access-token',
  refresh_token: 'prototype-refresh-token',
  expires_in: 60 * 60 * 24 * 365,
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  token_type: 'bearer',
  user
} as Session);

const createPrototypeProfile = () => ({
  id: 'prototype-profile',
  user_id: PROTOTYPE_USER_ID,
  role: 'consumer' as const,
  pseudo: 'Présentation',
  visibility: 'public' as const,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString()
});

const getPrototypeState = (): AuthState => {
  const user = createPrototypeUser();

  return {
    user,
    session: createPrototypeSession(user),
    profile: createPrototypeProfile(),
    loading: false,
    initialized: true,
    isPrototypeMode: true
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
    isPrototypeMode: false
  });

  const mountedRef = useRef(true);

  const enablePrototypeAccess = useCallback(() => {
    persistPrototypeAccess(true);
    SessionService.initSession(PROTOTYPE_USER_ID);

    if (mountedRef.current) {
      setState(getPrototypeState());
    }
  }, []);

  const disablePrototypeAccess = useCallback(() => {
    persistPrototypeAccess(false);
    SessionService.clearSession();

    if (mountedRef.current) {
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        initialized: true,
        isPrototypeMode: false
      });
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profile = await AuthService.getProfile(userId);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, profile: profile || prev.profile }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    await fetchProfile(state.user.id);
  }, [state.user, fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;

    // CRITICAL: Set up listener BEFORE getSession (per Supabase docs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, session?.user?.email);
      
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        SessionService.clearSession();

        if (isPrototypeAccessEnabled()) {
          setState(getPrototypeState());
          return;
        }

        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialized: true,
          isPrototypeMode: false
        });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const user = session?.user ?? null;

        persistPrototypeAccess(false);
        
        setState(prev => ({
          ...prev,
          user,
          session,
          profile: prev.isPrototypeMode ? null : prev.profile,
          loading: false,
          initialized: true,
          isPrototypeMode: false
        }));

        if (user && event === 'SIGNED_IN') {
          SessionService.initSession(user.id);
        }

        // Defer profile fetch to avoid Supabase auth deadlock
        if (user) {
          setTimeout(() => fetchProfile(user.id), 0);
        }
      }

      if (event === 'PASSWORD_RECOVERY') {
        // Let the reset password page handle this
        persistPrototypeAccess(false);

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
          isPrototypeMode: false
        }));
      }
    });

    // THEN get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;

      if (!session && isPrototypeAccessEnabled()) {
        setState(getPrototypeState());
        return;
      }

      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
        isPrototypeMode: false
      }));

      if (session?.user) {
        persistPrototypeAccess(false);
        fetchProfile(session.user.id);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          return { data, error: { message: "Email ou mot de passe incorrect." } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { data, error: { message: "Veuillez confirmer votre email avant de vous connecter." } };
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
        if (result.error.message === "EXISTING_USER") {
          return {
            data: result.data,
            error: { message: "Un compte existe déjà avec cet email. Veuillez vous connecter." }
          };
        }
        return { data: result.data, error: { message: result.error.message || "Erreur lors de l'inscription" } };
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || "Erreur lors de l'inscription" } };
    }
  };

  const signOut = async () => {
    persistPrototypeAccess(false);
    SessionService.clearSession();

    if (state.isPrototypeMode) {
      toast.success('Mode présentation fermé');
      window.location.href = '/auth';
      return;
    }

    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even on error
      window.location.href = '/auth';
    }
  };

  const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
      refreshProfile,
      enablePrototypeAccess,
      disablePrototypeAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};
