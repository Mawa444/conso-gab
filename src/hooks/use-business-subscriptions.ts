import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';

// Helper pour table non typée
const subscriptionsTable = () => (supabase as any).from('business_subscriptions');

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
      const { data, error } = await subscriptionsTable()
        .select('*')
        .eq('subscriber_user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const formattedData = ((data || []) as any[]).map((item: any) => ({
        id: item.id,
        business_id: item.business_id,
        is_active: item.is_active,
        created_at: item.created_at,
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
      const { error } = await subscriptionsTable()
        .insert({
          subscriber_user_id: user.id,
          business_id: businessId,
          notification_types: {
            new_catalog: true,
            new_comment: true,
            new_message: true,
            new_order: true,
            business_update: true
          },
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Abonnement réussi",
        description: "Vous recevrez des notifications pour ce commerce"
      });

      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner",
        variant: "destructive"
      });
      return false;
    }
  };

  const unsubscribe = async (businessId: string) => {
    if (!user) return false;

    try {
      const { error } = await subscriptionsTable()
        .update({ is_active: false })
        .eq('subscriber_user_id', user.id)
        .eq('business_id', businessId);

      if (error) throw error;

      toast({
        title: "Désabonnement réussi",
        description: "Vous ne recevrez plus de notifications"
      });

      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se désabonner",
        variant: "destructive"
      });
      return false;
    }
  };

  const isSubscribed = (businessId: string) => {
    return subscriptions.some(sub => sub.business_id === businessId && sub.is_active);
  };

  const updateNotificationSettings = async (
    businessId: string, 
    settings: Partial<BusinessSubscription['notification_types']>
  ) => {
    if (!user) return false;

    try {
      const subscription = subscriptions.find(sub => sub.business_id === businessId);
      if (!subscription) return false;

      const newSettings = { ...subscription.notification_types, ...settings };
      
      const { error } = await subscriptionsTable()
        .update({ notification_types: newSettings })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  return {
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    isSubscribed,
    updateNotificationSettings,
    refetch: fetchSubscriptions,
    getSubscription: (businessId: string) => subscriptions.find(sub => sub.business_id === businessId)
  };
};
