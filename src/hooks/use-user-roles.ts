import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';

export type AppRole = 'admin' | 'moderator' | 'user' | 'business_owner';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

/**
 * Hook sécurisé pour gérer les rôles utilisateur
 * Utilise la table user_roles et les fonctions RPC sécurisées
 */
export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        const userRoles = (data || []).map((r: any) => r.role as AppRole);
        setRoles(userRoles);
      } catch (err: any) {
        console.error('Error fetching user roles:', err);
        setError(err.message);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // S'abonner aux changements de rôles en temps réel
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const hasAllRoles = (checkRoles: AppRole[]): boolean => {
    return checkRoles.every(role => roles.includes(role));
  };

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator');
  const isBusinessOwner = () => hasRole('business_owner');

  return {
    roles,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isModerator,
    isBusinessOwner
  };
};
