
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BusinessVisitTrackerProps {
  businessId: string;
}

export const BusinessVisitTracker = ({ businessId }: BusinessVisitTrackerProps) => {
  useEffect(() => {
    if (!businessId) return;

    const trackVisit = async () => {
      // 1. Check local storage for recent visit (simple debounce)
      const lastVisitKey = `visit_${businessId}`;
      const lastVisit = localStorage.getItem(lastVisitKey);
      const now = Date.now();
      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (lastVisit && (now - parseInt(lastVisit)) < THIRTY_MINUTES) {
        // Already visited recently, skip
        return;
      }


      // 2. Insert visit
      try {
        const { error } = await supabase
          .from('business_visits')
          .insert({
            business_id: businessId,
            source: 'direct', // Could be parsed from URL params
            user_agent: navigator.userAgent
            // visitor_id is handled by RLS/Auth automatically if user is logged in
            // or stays NULL if anonymous
          });

        if (!error) {
          localStorage.setItem(lastVisitKey, now.toString());
        }
      } catch (err) {
        console.error("Failed to track visit", err);
      }
    };

    trackVisit();
  }, [businessId]);

  return null; // Invisible component
};
