import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';

export interface BusinessSubscription {
  id: string;
  business_id: string;
  notification_types: {
    new_catalog: boolean;
    new_comment: boolean;
    new_message: boolean;
    new_order: boolean;
    business_update: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export const useBusinessSubscriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .select('*')
        .eq('subscriber_user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        ...item,
        notification_types: typeof item.notification_types === 'object' && item.notification_types !== null
          ? item.notification_types as BusinessSubscription['notification_types']
          : {
              new_catalog: true,
              new_comment: true,
              new_message: true,
              new_order: true,
              business_update: true
            }
      }));
      
      setSubscriptions(formattedData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (businessId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .insert({
          subscriber_user_id: user.id,
          business_id: businessId,
          notification_types: {
            new_catalog: true,
            new_comment: true,
            new_message: true,
            new_order: true,
            business_update: true
          }
        });

      if (error) throw error;

      await fetchSubscriptions();
      toast({
        title: "Ajouté aux favoris",
        description: "Vous recevrez les actualités de ce profil en priorité.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de s'abonner",
        variant: "destructive",
      });
      return false;
    }
  };

  const unsubscribe = async (businessId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .update({ is_active: false })
        .eq('subscriber_user_id', user.id)
        .eq('business_id', businessId);

      if (error) throw error;

      await fetchSubscriptions();
      toast({
        title: "Retiré des favoris",
        description: "Vous ne recevrez plus les actualités de ce profil.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de se désabonner",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateNotificationSettings = async (businessId: string, notificationTypes: BusinessSubscription['notification_types']) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .update({ notification_types: notificationTypes })
        .eq('subscriber_user_id', user.id)
        .eq('business_id', businessId);

      if (error) throw error;

      await fetchSubscriptions();
      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de notification ont été sauvegardées.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
      return false;
    }
  };

  const isSubscribed = (businessId: string) => {
    return subscriptions.some(sub => sub.business_id === businessId && sub.is_active);
  };

  const getSubscription = (businessId: string) => {
    return subscriptions.find(sub => sub.business_id === businessId && sub.is_active);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  return {
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    updateNotificationSettings,
    isSubscribed,
    getSubscription,
    refetch: fetchSubscriptions
  };
};
