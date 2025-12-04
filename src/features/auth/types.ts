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

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  pseudo: string;
  phone?: string;
  profile_picture_url?: string;
  visibility: 'public' | 'restricted' | 'private';
  created_at: string;
  updated_at: string;
}

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

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  refreshProfile: () => Promise<void>;
}

