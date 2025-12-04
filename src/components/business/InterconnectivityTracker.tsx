import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";

interface InterconnectivityTrackerProps {
  actionType: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  metadata?: Record<string, any>;
}

export const InterconnectivityTracker = ({
  actionType,
  sourceEntityType,
  sourceEntityId,
  targetEntityType,
  targetEntityId,
  metadata = {}
}: InterconnectivityTrackerProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !actionType) return;

    trackAction();
  }, [user, actionType, sourceEntityId, targetEntityId]);

  const trackAction = async () => {
    try {
      const { error } = await supabase
        .from('action_tracking')
        .insert({
          user_id: user!.id,
          action_type: actionType,
          source_entity_type: sourceEntityType,
          source_entity_id: sourceEntityId,
          target_entity_type: targetEntityType,
          target_entity_id: targetEntityId,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            path: window.location.pathname
          }
        });

      if (error) {
        console.error('Error tracking action:', error);
      }
    } catch (error) {
      console.error('Error in InterconnectivityTracker:', error);
    }
  };

  return null; // This is a utility component, no UI needed
};

// Hook for easy usage
export const useTrackAction = () => {
  const { user } = useAuth();

  const trackAction = async (params: Omit<InterconnectivityTrackerProps, 'children'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('action_tracking')
        .insert({
          user_id: user.id,
          action_type: params.actionType,
          source_entity_type: params.sourceEntityType,
          source_entity_id: params.sourceEntityId,
          target_entity_type: params.targetEntityType,
          target_entity_id: params.targetEntityId,
          metadata: {
            ...params.metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            path: window.location.pathname
          }
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error tracking action via hook:', error);
    }
  };

  return { trackAction };
};
