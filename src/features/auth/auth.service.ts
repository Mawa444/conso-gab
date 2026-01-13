import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile, UserSignUpData, BusinessCategory } from './types';

export class AuthService {
  private static readonly VALID_BUSINESS_CATEGORIES: readonly BusinessCategory[] = [
    'agriculture', 'automotive', 'beauty', 'education', 'entertainment',
    'finance', 'fitness', 'healthcare', 'manufacturing', 'other',
    'real_estate', 'restaurant', 'retail', 'services', 'technology'
  ];

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as UserProfile;
  }

  static async waitForProfile(userId: string, attempts = 5, delay = 1000): Promise<UserProfile | null> {
    for (let i = 0; i < attempts; i++) {
      const profile = await this.getProfile(userId);
      if (profile) return profile;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  }

  static async signUp(email: string, password: string, userData: UserSignUpData) {
    // Validate email format before sending to Supabase
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { 
        data: null, 
        error: { message: "Format d'email invalide" } 
      };
    }

    // Validate password length
    if (password.length < 6) {
      return { 
        data: null, 
        error: { message: "Le mot de passe doit contenir au moins 6 caractères" } 
      };
    }

    // Get redirect URL for email confirmation
    const redirectUrl = `${window.location.origin}/auth`;

    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          pseudo: userData.pseudo,
          role: userData.role,
          phone: userData.phone,
          full_name: userData.pseudo
        }
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      
      // Handle specific error codes
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        try { localStorage.setItem('prefillEmail', email); } catch { /* Ignore */ }
        return { 
          data, 
          error: { message: "EXISTING_USER", email } 
        };
      }
      
      // Handle invalid email error from Supabase
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        return { 
          data, 
          error: { message: "L'adresse email n'est pas valide. Utilisez une adresse email réelle." } 
        };
      }
      
      return { data, error: { message: error.message } };
    }

    // 2. If auto-confirm is on (dev mode) or session exists, create profiles
    if (data.user && data.session) {
      try {
        const sessionUser = data.user;

        // Wait for profile created by trigger, or create manually
        const profile = await this.waitForProfile(sessionUser.id);
        
        if (!profile) {
          // Fallback: Create profile manually if trigger failed
          console.warn('Trigger failed, creating profile manually');
          await supabase.from('user_profiles').insert({
            user_id: sessionUser.id,
            pseudo: userData.pseudo,
            role: userData.role,
            phone: userData.phone,
            country: userData.country || 'Gabon',
            province: userData.province,
            department: userData.department,
            arrondissement: userData.arrondissement,
            quartier: userData.quartier,
            address: userData.address,
            latitude: userData.latitude,
            longitude: userData.longitude,
            visibility: 'public'
          });
        }

        // 3. If merchant, create business profile
        if (userData.role === 'merchant' && userData.businessName && userData.businessName.trim()) {
          await this.createBusinessProfile(sessionUser.id, userData);
        }

      } catch (err) {
        console.error('Error during post-signup:', err);
      }
    }

    return { data, error: null };
  }

  private static async createBusinessProfile(userId: string, userData: UserSignUpData) {
    // Validate business category
    const category = userData.businessCategory?.toLowerCase() || 'services';
    const businessCategory: BusinessCategory = this.VALID_BUSINESS_CATEGORIES.includes(category as BusinessCategory)
      ? category as BusinessCategory
      : 'services';

    const { data: businessData, error: businessError } = await supabase
      .from('business_profiles')
      .insert([{
        user_id: userId,
        owner_id: userId, // Important: set owner_id for RLS policies
        business_name: userData.businessName,
        business_category: businessCategory,
        description: userData.businessDescription || '',
        country: userData.country || 'Gabon',
        province: userData.province,
        department: userData.department,
        arrondissement: userData.arrondissement,
        quartier: userData.quartier,
        address: userData.address,
        latitude: userData.latitude,
        longitude: userData.longitude,
        is_primary: true,
        is_active: true
      }])
      .select('id')
      .single();

    if (businessError) {
      console.error('Error creating business profile:', businessError);
      return;
    }

    if (businessData) {
      // CRITICAL: Create business collaborator entry for RoleBasedRouter to detect businesses
      const { error: collabError } = await supabase
        .from('business_collaborators')
        .insert({
          user_id: userId,
          business_id: businessData.id,
          role: 'owner',
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          permissions: {
            manage_products: true,
            manage_orders: true,
            manage_staff: true,
            view_analytics: true,
            edit_settings: true
          }
        });

      if (collabError) {
        console.error('Error creating business collaborator:', collabError);
      }

      // Initialize business mode for new merchants
      await supabase
        .from('user_current_mode')
        .upsert({
          user_id: userId,
          current_mode: 'business',
          current_business_id: businessData.id
        });
    }
  }
}

