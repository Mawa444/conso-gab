import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: any) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: any) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(data);
      if (result.user && !result.error) {
        // Create user profile and business if needed
        const profileResult = await AuthService.createUserProfile(result.user.id, {
          pseudo: data.pseudo,
          phone: data.phone,
          country: data.country,
          province: data.province,
          department: data.department,
          arrondissement: data.arrondissement,
          quartier: data.quartier,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          role: data.role,
        });

        if (profileResult.error) {
          return { user: null, error: profileResult.error };
        }

        if (data.businessName) {
          const businessResult = await AuthService.createBusinessProfile(result.user.id, {
            business_name: data.businessName,
            business_category: data.businessCategory,
            description: data.businessDescription,
            country: data.country,
            province: data.province,
            department: data.department,
            arrondissement: data.arrondissement,
            quartier: data.quartier,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            is_primary: true,
            is_active: true,
          });

          if (businessResult.error) {
            return { user: null, error: businessResult.error };
          }

          // Initialize business mode
          await AuthService.initializeBusinessMode(result.user.id, businessResult.businessId!);
        }

        // Auto sign in after successful signup
        return await AuthService.autoSignInAfterSignUp(data.email, data.password);
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await AuthService.signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      return await AuthService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};