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
    if (!user) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to messages
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${getParticipantConversationIds().join(',')})`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessageUpdates(prev => [...prev, payload]);
          
          // Show notification for new messages from others
          if (payload.new.sender_id !== user.id) {
            toast({
              title: "Nouveau message",
              description: payload.new.content?.substring(0, 50) + "...",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message updated:', payload);
          setMessageUpdates(prev => [...prev, payload]);
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    // Subscribe to conversations
    const conversationsChannel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          setConversationUpdates(prev => [...prev, payload]);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      messagesChannel.unsubscribe();
      conversationsChannel.unsubscribe();
      setIsConnected(false);
    };
  }, [user]);

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