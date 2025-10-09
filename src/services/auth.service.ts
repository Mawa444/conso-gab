import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { z } from 'zod';

// Schémas de validation Zod
export const signUpSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(100),
  pseudo: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères').max(50),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  department: z.string().optional(),
  arrondissement: z.string().optional(),
  quartier: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  role: z.enum(['merchant', 'client', 'consumer']).default('consumer'),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  businessDescription: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export interface ProfileData {
  pseudo: string;
  phone?: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  role: string;
}

export interface BusinessData {
  business_name: string;
  business_category: string;
  description?: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  is_active: boolean;
}

/**
 * Service d'authentification sécurisé avec validation Zod
 */
export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur avec validation
   */
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: any }> {
    try {
      // Validation des données
      const validatedData = signUpSchema.parse(data);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/consumer/home`,
          data: {
            pseudo: validatedData.pseudo,
            role: validatedData.role,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
          },
        },
      });

      if (signUpError) {
        return { user: null, error: signUpError };
      }

      return { user: signUpData.user, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          user: null, 
          error: { message: error.errors[0].message } 
        };
      }
      return { user: null, error };
    }
  }

  /**
   * Connexion avec validation
   */
  static async signIn(credentials: SignInData): Promise<{ user: User | null; error: any }> {
    try {
      // Validation des données
      const validatedData = signInSchema.parse(credentials);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      return { user: data.user, error };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          user: null, 
          error: { message: error.errors[0].message } 
        };
      }
      return { user: null, error };
    }
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Réinitialisation du mot de passe
   */
  static async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const validEmail = z.string().email().parse(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(validEmail, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      return { error };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { error: { message: 'Email invalide' } };
      }
      return { error };
    }
  }

  /**
   * Créer un profil utilisateur
   */
  static async createUserProfile(userId: string, data: ProfileData): Promise<{ error: any }> {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        pseudo: data.pseudo,
        role: data.role,
        phone: data.phone,
        country: data.country || 'Gabon',
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

  /**
   * Créer un profil business
   */
  static async createBusinessProfile(userId: string, data: BusinessData): Promise<{ businessId: string | null; error: any }> {
    const { data: businessData, error } = await supabase
      .from('business_profiles')
      .insert([{
        user_id: userId,
        business_name: data.business_name,
        business_category: data.business_category as any,
        description: data.description,
        country: data.country || 'Gabon',
        province: data.province,
        department: data.department,
        arrondissement: data.arrondissement,
        quartier: data.quartier,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        is_primary: data.is_primary,
        is_active: data.is_active
      }])
      .select('id')
      .single();

    return {
      businessId: businessData?.id || null,
      error
    };
  }

  /**
   * Initialiser le mode business
   */
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

  /**
   * Connexion automatique après inscription
   */
  static async autoSignInAfterSignUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  }
}
