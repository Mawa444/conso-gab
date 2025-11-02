/**
 * ============================================
 * AUTH TYPES - TYPE-SAFE
 * ============================================
 * Types stricts pour l'authentification
 */

import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'consumer' | 'merchant' | 'admin';

export type BusinessCategory = 
  | 'agriculture'
  | 'automotive'
  | 'beauty'
  | 'education'
  | 'entertainment'
  | 'finance'
  | 'fitness'
  | 'healthcare'
  | 'manufacturing'
  | 'other'
  | 'real_estate'
  | 'restaurant'
  | 'retail'
  | 'services'
  | 'technology';

export interface UserSignUpData {
  pseudo: string;
  role: UserRole;
  phone: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  // Business fields (only for merchants)
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  // Extra fields for backward compatibility
  first_name?: string;
  last_name?: string;
  patrioteEcoPledge?: boolean;
  [key: string]: unknown; // Allow additional fields
}

export interface AuthError {
  message: string;
  email?: string;
}

export interface SignUpResult {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

export interface SignInResult {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

export interface ResetPasswordResult {
  error: AuthError | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
}
