import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";

interface ActivityData {
  actionType: string;
  actionDescription: string;
  metadata?: Record<string, any>;
  businessId?: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();

  const trackActivity = useCallback(async (activity: ActivityData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action_type: activity.actionType,
          action_description: activity.actionDescription,
          metadata: activity.metadata || {},
          business_id: activity.businessId || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Erreur lors du tracking d'activité:", error);
      }
    } catch (error) {
      console.error("Erreur lors du tracking d'activité:", error);
    }
  }, [user]);

  // Fonctions d'aide pour tracker des actions spécifiques
  const trackNavigation = useCallback((fromPage: string, toPage: string) => {
    trackActivity({
      actionType: "NAVIGATION",
      actionDescription: `Navigation de ${fromPage} vers ${toPage}`,
      metadata: { fromPage, toPage, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    trackActivity({
      actionType: "BUTTON_CLICK",
      actionDescription: `Clic sur le bouton "${buttonName}" dans ${location}`,
      metadata: { buttonName, location, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackSearch = useCallback((query: string, results?: number) => {
    trackActivity({
      actionType: "SEARCH",
      actionDescription: `Recherche effectuée: "${query}"`,
      metadata: { query, results, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackCommerceView = useCallback((commerceId: string, commerceName: string) => {
    trackActivity({
      actionType: "COMMERCE_VIEWED",
      actionDescription: `Consultation du commerce "${commerceName}"`,
      metadata: { commerceId, commerceName, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackProductView = useCallback((productId: string, productName: string, businessId?: string) => {
    trackActivity({
      actionType: "PRODUCT_VIEWED",
      actionDescription: `Consultation du produit "${productName}"`,
      metadata: { productId, productName, timestamp: Date.now() },
      businessId
    });
  }, [trackActivity]);

  const trackLogin = useCallback((method: string = "email") => {
    trackActivity({
      actionType: "LOGIN",
      actionDescription: `Connexion via ${method}`,
      metadata: { method, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackLogout = useCallback(() => {
    trackActivity({
      actionType: "LOGOUT",
      actionDescription: "Déconnexion de l'utilisateur",
      metadata: { timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackBusinessCreated = useCallback((businessName: string, businessId: string) => {
    trackActivity({
      actionType: "BUSINESS_CREATED",
      actionDescription: `Création de l'entreprise "${businessName}"`,
      metadata: { businessName, timestamp: Date.now() },
      businessId
    });
  }, [trackActivity]);

  const trackModalOpen = useCallback((modalName: string) => {
    trackActivity({
      actionType: "MODAL_OPENED",
      actionDescription: `Ouverture du modal "${modalName}"`,
      metadata: { modalName, timestamp: Date.now() }
    });
  }, [trackActivity]);

  const trackTabChange = useCallback((fromTab: string, toTab: string) => {
    trackActivity({
      actionType: "TAB_CHANGE",
      actionDescription: `Changement d'onglet de "${fromTab}" vers "${toTab}"`,
      metadata: { fromTab, toTab, timestamp: Date.now() }
    });
  }, [trackActivity]);

  return {
    trackActivity,
    trackNavigation,
    trackButtonClick,
    trackSearch,
    trackCommerceView,
    trackProductView,
    trackLogin,
    trackLogout,
    trackBusinessCreated,
    trackModalOpen,
    trackTabChange
  };
};
