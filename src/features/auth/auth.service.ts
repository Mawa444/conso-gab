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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { data: null, error: { message: "Format d'email invalide" } };
    }

    if (password.length < 6) {
      return { data: null, error: { message: "Le mot de passe doit contenir au moins 6 caractères" } };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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
      
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { data, error: { message: "EXISTING_USER", email } };
      }
      
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        return { data, error: { message: "L'adresse email n'est pas valide." } };
      }
      
      return { data, error: { message: error.message } };
    }

    // If auto-confirm is on and session exists, set up profiles
    if (data.user && data.session) {
      try {
        const profile = await this.waitForProfile(data.user.id);
        
        if (!profile) {
          console.warn('Trigger did not create profile, creating manually');
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
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

        if (userData.role === 'merchant' && userData.businessName?.trim()) {
          await this.createBusinessProfile(data.user.id, userData);
        }
      } catch (err) {
        console.error('Error during post-signup profile creation:', err);
      }
    }

    return { data, error: null };
  }

  private static async createBusinessProfile(userId: string, userData: UserSignUpData) {
    const category = userData.businessCategory?.toLowerCase() || 'services';
    const businessCategory: BusinessCategory = this.VALID_BUSINESS_CATEGORIES.includes(category as BusinessCategory)
      ? category as BusinessCategory
      : 'services';

    const { data: businessData, error: businessError } = await supabase
      .from('business_profiles')
      .insert([{
        user_id: userId,
        owner_id: userId,
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
      await supabase.from('business_collaborators').insert({
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

      await supabase.from('user_current_mode').upsert({
        user_id: userId,
        current_mode: 'business',
        current_business_id: businessData.id
      });
    }
  }
}
