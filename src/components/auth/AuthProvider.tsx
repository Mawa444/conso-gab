import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const sid = `${session.user.id}-${Date.now()}`;
          localStorage.setItem('gb_session_id', sid);
          localStorage.setItem('gb_session_started_at', String(Date.now()));
          localStorage.setItem('gb_welcome_shown', 'false');
        }
        if (event === 'SIGNED_OUT') {
          localStorage.setItem('gb_last_logout_at', String(Date.now()));
          localStorage.removeItem('gb_session_id');
          localStorage.removeItem('gb_welcome_shown');
        }
      } catch {}
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    // 1) Créer le compte
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData,
      },
    });

    if (signUpError) {
      // Améliorer les messages d'erreur pour les comptes existants
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        // Stocker l'email pour la redirection vers la connexion
        try { localStorage.setItem('prefillEmail', email); } catch {}
        return { 
          data: signUpData, 
          error: { message: "EXISTING_USER", email }
        };
      }
      return { data: signUpData, error: signUpError };
    }

    try {
      // 2) Connexion automatique si aucune session n'est retournée (selon la config Supabase)
      let sessionUser = signUpData.user;
      if (!signUpData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          // Pré-remplir l'email pour un fallback de connexion manuel
          try { localStorage.setItem('prefillEmail', email); } catch {}
          console.warn('Auto-login après inscription impossible:', signInError.message);
        } else {
          sessionUser = signInData.user ?? sessionUser;
        }
      }

        // 3) Créer le profil utilisateur une fois l'utilisateur authentifié
        if (sessionUser) {
          // Vérifier si un profil existe déjà (créé par trigger DB)
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', sessionUser.id)
            .maybeSingle();

          if (!existingProfile) {
            // Créer le profil consommateur (fallback si le trigger n'a pas tourné)
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
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

            if (profileError) {
              console.error('Erreur création profil utilisateur:', profileError);
            }
          }

          // Si c'est un créateur (merchant), créer aussi le profil business
          if (userData.role === 'merchant' && userData.businessName?.trim()) {
            const { data: businessData, error: businessError } = await supabase
              .from('business_profiles')
              .insert({
                user_id: sessionUser.id,
                business_name: userData.businessName,
                business_category: userData.businessCategory || 'Services',
                description: userData.businessDescription,
                country: userData.country || 'Gabon',
                province: userData.province,
                department: userData.department,
                arrondissement: userData.arrondissement,
                quartier: userData.quartier,
                address: userData.address,
                latitude: userData.latitude,
                longitude: userData.longitude,
                is_primary: true, // Premier business = principal
                is_active: true
              })
              .select('id')
              .single();

            if (businessError) {
              console.error('Erreur création profil business:', businessError);
            } else if (businessData) {
              // Initialiser le mode business pour les nouveaux marchands
              await supabase
                .from('user_current_mode')
                .upsert({
                  user_id: sessionUser.id,
                  current_mode: 'business',
                  current_business_id: businessData.id
                });
            }
          }
        }
    } catch (err) {
      console.error('Erreur lors du post-signup:', err);
    }

    return { data: signUpData, error: signUpError };
  };
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Améliorer les messages d'erreur
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
    }
    
    // La redirection post-connexion est gérée par RoleBasedRouter selon le schéma conceptuel
    // consumer → /consumer/home
    // merchant → /merchant/dashboard
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    try {
      localStorage.setItem('gb_last_logout_at', String(Date.now()));
      localStorage.removeItem('gb_session_id');
      localStorage.removeItem('gb_welcome_shown');
    } catch {}
    
    window.location.href = '/auth';
  };

  const value = {
    user,
    session,
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