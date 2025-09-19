import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationItem } from "@/components/messaging/ConversationsList";
import { ConversationFilter } from "@/pages/MessagingPage";
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

      // Base query for conversations
      let query = supabase
        .from('conversations')
        .select(`
          *,
          business_profiles!conversations_business_id_fkey (
            business_name,
            logo_url,
            business_category,
            phone,
            whatsapp,
            email,
            address
          ),
          messages (
            content,
            created_at,
            message_type,
            status
          )
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      // Apply user-specific filter (customer or business owner)
      query = query.or(`customer_id.eq.${user.id},business_id.in.(select id from business_profiles where user_id = ${user.id})`);

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) {
        throw conversationsError;
      }

      // Transform data to match ConversationItem interface
      const transformedConversations: ConversationItem[] = (conversationsData || []).map(conv => {
        const lastMessage = conv.messages?.[0];
        const unreadCount = conv.messages?.filter(m => m.status === 'sent' && m.message_type !== 'action').length || 0;
        
        // Determine conversation type based on last messages or context
        let conversationType: ConversationItem["conversation_type"] = "direct";
        let badges: ConversationItem["badges"] = [];

        // Analyze messages to determine type and create badges
        if (conv.messages) {
          const hasOrderMessages = conv.messages.some(m => m.content.toLowerCase().includes('commande'));
          const hasReservationMessages = conv.messages.some(m => m.content.toLowerCase().includes('réservation'));
          const hasPaymentMessages = conv.messages.some(m => m.content.toLowerCase().includes('paiement'));
          const hasAppointmentMessages = conv.messages.some(m => m.content.toLowerCase().includes('rendez-vous'));

          if (hasOrderMessages) {
            conversationType = "order";
            badges.push({
              type: "order",
              label: "Commande en cours",
              variant: "default"
            });
          }
          
          if (hasReservationMessages) {
            conversationType = "reservation";
            badges.push({
              type: "reservation",
              label: "Réservation confirmée",
              variant: "secondary"
            });
          }
          
          if (hasPaymentMessages) {
            badges.push({
              type: "payment",
              label: "Paiement en attente",
              variant: "destructive"
            });
          }
          
          if (hasAppointmentMessages) {
            conversationType = "appointment";
            badges.push({
              type: "appointment",
              label: "RDV aujourd'hui",
              variant: "default"
            });
          }
        }

        if (unreadCount > 0) {
          badges.push({
            type: "unread",
            label: `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`,
            variant: "outline"
          });
        }

        return {
          id: conv.id,
          business_name: conv.business_profiles?.business_name || "Entreprise",
          business_logo: conv.business_profiles?.logo_url,
          customer_name: "Client",
          customer_avatar: undefined,
          last_message: lastMessage?.content || "Aucun message",
          last_message_time: lastMessage?.created_at || conv.created_at,
          unread_count: unreadCount,
          conversation_type: conversationType,
          status: "active",
          badges
        };
      });

      // Apply search filter
      let filteredConversations = transformedConversations;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredConversations = transformedConversations.filter(conv =>
          conv.business_name.toLowerCase().includes(searchLower) ||
          conv.customer_name?.toLowerCase().includes(searchLower) ||
          conv.last_message.toLowerCase().includes(searchLower) ||
          conv.catalog_product?.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply type filter
      if (filter !== "all") {
        filteredConversations = filteredConversations.filter(conv => {
          switch (filter) {
            case "orders":
              return conv.conversation_type === "order" || conv.badges.some(b => b.type === "order");
            case "reservations":
              return conv.conversation_type === "reservation" || conv.badges.some(b => b.type === "reservation");
            case "payments":
              return conv.badges.some(b => b.type === "payment");
            case "appointments":
              return conv.conversation_type === "appointment" || conv.badges.some(b => b.type === "appointment");
            case "catalogs":
              return conv.conversation_type === "catalog" || !!conv.catalog_product;
            case "support":
              return conv.conversation_type === "support";
            case "unread":
              return conv.unread_count > 0;
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