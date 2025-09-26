import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface RealTimeContextType {
  isConnected: boolean;
  messageUpdates: any[];
  conversationUpdates: any[];
}

const RealTimeContext = createContext<RealTimeContextType>({
  isConnected: false,
  messageUpdates: [],
  conversationUpdates: []
});

export const useRealTime = () => useContext(RealTimeContext);

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider = ({ children }: RealTimeProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [messageUpdates, setMessageUpdates] = useState<any[]>([]);
  const [conversationUpdates, setConversationUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    // Debounce subscription setup to prevent rapid reconnections
    const timeoutId = setTimeout(() => {
      console.log('Setting up real-time subscriptions for user:', user.id);

      // Subscribe to messages - simplified without complex filtering
      const messagesChannel = supabase
        .channel(`messages-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            setMessageUpdates(prev => [...prev.slice(-9), payload]); // Keep only last 10
            
            // Show notification for new messages from others only
            if (payload.new.sender_id !== user.id) {
              toast({
                title: "Nouveau message",
                description: payload.new.content?.substring(0, 50) + "...",
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          }
        });

      // Subscribe to conversations - only for updates
      const conversationsChannel = supabase
        .channel(`conversations-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            setConversationUpdates(prev => [...prev.slice(-9), payload]); // Keep only last 10
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up real-time subscriptions');
        messagesChannel.unsubscribe();
        conversationsChannel.unsubscribe();
        setIsConnected(false);
      };
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      setIsConnected(false);
    };
  }, [user?.id]); // Only depend on user.id, not the whole user object

  // Helper function to get conversation IDs where user is participant
  const getParticipantConversationIds = () => {
    // This would be populated from the participants table
    // For now, returning empty array - should be enhanced with actual conversation IDs
    return [];
  };

  return (
    <RealTimeContext.Provider 
      value={{ 
        isConnected, 
        messageUpdates, 
        conversationUpdates 
      }}
    >
      {children}
    </RealTimeContext.Provider>
  );
};