import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  pseudo: string;
  phone: string;
  country: string;
  province: string;
  department: string;
  arrondissement: string;
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  role: 'merchant' | 'client';
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
}

export interface ProfileData {
  pseudo: string;
  phone: string;
  country: string;
  province: string;
  department: string;
  arrondissement: string;
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  role: string;
}

export interface BusinessData {
  business_name: string;
  business_category: string;
  description: string;
  country: string;
  province: string;
  department: string;
  arrondissement: string;
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  is_active: boolean;
}

export class AuthService {
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: any }> {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          pseudo: data.pseudo,
          role: data.role,
        },
      },
    });

    if (signUpError) {
      return { user: null, error: signUpError };
    }

    return { user: signUpData.user, error: null };
  }

  static async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  }

  static async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    return { error };
  }

  static async createUserProfile(userId: string, data: ProfileData): Promise<{ error: any }> {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        pseudo: data.pseudo,
        role: data.role,
        phone: data.phone,
        country: data.country,
        province: data.province,
        department: data.department,
        arrondissement: data.arrondissement,
        quartier: data.quartier,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        visibility: 'public'
      });

    return { error };
  }

  static async createBusinessProfile(userId: string, data: BusinessData): Promise<{ businessId: string | null; error: any }> {
    const { data: businessData, error } = await supabase
      .from('business_profiles')
      .insert({
        user_id: userId,
        business_name: data.business_name,
        business_category: data.business_category,
        description: data.description,
        country: data.country,
        province: data.province,
        department: data.department,
        arrondissement: data.arrondissement,
        quartier: data.quartier,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        is_primary: data.is_primary,
        is_active: data.is_active
      })
      .select('id')
      .single();

    return {
      businessId: businessData?.id || null,
      error
    };
  }

  static async initializeBusinessMode(userId: string, businessId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('user_current_mode')
      .upsert({
        user_id: userId,
        current_mode: 'business',
        current_business_id: businessId
      });

    return { error };
  }

  static async autoSignInAfterSignUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  }
}