import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationItem, ConversationFilter } from "@/types/messaging";
import { useAuth } from "@/components/auth/AuthProvider";

interface UseConversationsProps {
  search?: string;
  filter?: ConversationFilter;
}

export const useConversations = ({ search = "", filter = "all" }: UseConversationsProps = {}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with real Supabase query later
      const mockConversations: ConversationItem[] = [
        {
          id: "1",
          customer_name: "Marie Dubois",
          customer_avatar: "",
          business_name: "Restaurant Le Gourmet",
          business_logo: "",
          last_message: "Merci pour la réservation, à demain !",
          last_message_time: new Date().toISOString(),
          status: "unread",
          type: "reservation",
          priority: "normal",
          customer_type: "regular",
          has_unread: true,
          unread_count: 2,
          message_count: 5,
        },
        {
          id: "2", 
          customer_name: "Jean Martin",
          customer_avatar: "",
          business_name: "Boulangerie Artisan",
          business_logo: "",
          last_message: "Commande prête pour récupération",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          status: "read",
          type: "order",
          priority: "high",
          customer_type: "vip",
          has_unread: false,
          unread_count: 0,
          message_count: 8,
          order_amount: 45.90,
        },
        {
          id: "3",
          customer_name: "Sophie Chen", 
          customer_avatar: "",
          business_name: "Garage AutoTech",
          business_logo: "",
          last_message: "Devis pour révision accepté",
          last_message_time: new Date(Date.now() - 7200000).toISOString(),
          status: "read",
          type: "quote", 
          priority: "urgent",
          customer_type: "new",
          has_unread: false,
          unread_count: 0,
          message_count: 12,
          order_amount: 350.00,
        }
      ];

      // Apply search filter
      let filteredConversations = mockConversations;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredConversations = mockConversations.filter(conv =>
          conv.business_name?.toLowerCase().includes(searchLower) ||
          conv.customer_name?.toLowerCase().includes(searchLower) ||
          conv.last_message.toLowerCase().includes(searchLower)
        );
      }

      // Apply type filter
      if (filter !== "all") {
        filteredConversations = filteredConversations.filter(conv => {
          switch (filter) {
            case "unread":
              return conv.status === "unread";
            case "orders":
              return conv.type === "order";
            case "quotes":
              return conv.type === "quote";
            case "reservations":
              return conv.type === "reservation";
            case "support":
              return conv.type === "support";
            case "archived":
              return conv.status === "archived";
            default:
              return true;
          }
        });
      }

      setConversations(filteredConversations);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchConversations();
  };

  useEffect(() => {
    fetchConversations();
  }, [user, search, filter]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    error,
    refetch
  };
};