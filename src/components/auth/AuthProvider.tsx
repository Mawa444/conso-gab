import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAnonymousSession } from '@/hooks/use-anonymous-session';
import { AnonymousLockPopup } from './AnonymousLockPopup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
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
  const anonymousSession = useAnonymousSession();

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData,
      },
    });

    // Créer le profil utilisateur après inscription
    if (data.user && !error) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
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

        if (profileError) {
          console.error('Erreur création profil utilisateur:', profileError);
        }
      } catch (err) {
        console.error('Erreur lors de la création du profil:', err);
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AnonymousLockPopup
        open={anonymousSession.showLockPopup}
        onClose={anonymousSession.dismissLockPopup}
        onCreateAccount={() => {
          anonymousSession.endAnonymousSession();
          window.location.href = '/auth';
        }}
        onContinueAnonymous={() => {
          anonymousSession.dismissLockPopup();
          anonymousSession.startAnonymousSession();
        }}
      />
    </AuthContext.Provider>
  );
};