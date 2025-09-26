import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  title: string;
  conversation_type: 'private' | 'group';
  origin_type?: string;
  origin_id?: string;
  last_activity: string;
  created_at: string;
  metadata: any;
  members: ConversationMember[];
  lastMessage?: Message;
  unread_count: number;
}

export interface ConversationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
  notifications_enabled: boolean;
  is_active: boolean;
  user_profile?: {
    pseudo: string;
    profile_picture_url?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'action' | 'system';
  content_json?: any;
  attachment_url?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  edited_at?: string;
  reply_to_message_id?: string;
  reactions?: any;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  message_id: string;
  url: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size?: number;
  file_name?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer les conversations où l'utilisateur est membre
      const { data: memberData, error: memberError } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          last_read_at,
          conversations!inner(
            id,
            title,
            conversation_type,
            origin_type,
            origin_id,
            last_activity,
            created_at,
            metadata
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = memberData.map(m => m.conversation_id);

      // Récupérer tous les membres pour chaque conversation avec leurs profils
      const { data: allMembersData, error: allMembersError } = await supabase
        .from('conversation_members')
        .select('*')
        .in('conversation_id', conversationIds)
        .eq('is_active', true);

      if (allMembersError) throw allMembersError;

      // Récupérer les profils des utilisateurs
      const memberUserIds = [...new Set(allMembersData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', memberUserIds);

      if (profilesError) throw profilesError;

      // Récupérer le dernier message de chaque conversation
      const { data: lastMessagesData, error: lastMessagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (lastMessagesError) throw lastMessagesError;

      // Assembler les données
      const processedConversations: Conversation[] = memberData.map(memberItem => {
        const conv = memberItem.conversations;
        const members = allMembersData?.filter(m => m.conversation_id === conv.id) || [];
        const lastMessage = lastMessagesData?.find(m => m.conversation_id === conv.id);
        
        // Calculer les messages non lus
        const unreadCount = lastMessagesData?.filter(m => 
          m.conversation_id === conv.id && 
          new Date(m.created_at) > new Date(memberItem.last_read_at || '1970-01-01') &&
          m.sender_id !== user.id
        ).length || 0;

        return {
          ...conv,
          conversation_type: conv.conversation_type as 'private' | 'group',
          members: members.map(m => {
            const profile = profilesData?.find(p => p.user_id === m.user_id);
            return {
              ...m,
              role: m.role as 'owner' | 'admin' | 'member',
              user_profile: profile ? {
                pseudo: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
                profile_picture_url: profile.avatar_url
              } : undefined
            };
          }),
          lastMessage: lastMessage ? {
            ...lastMessage,
            message_type: lastMessage.message_type as Message['message_type'],
            status: lastMessage.status as Message['status']
          } : undefined,
          unread_count: unreadCount
        };
      });

      // Trier par dernière activité
      processedConversations.sort((a, b) => 
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      );

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrivateConversation = async (targetUserId: string, title?: string) => {
    if (!user) return null;

    try {
      // Vérifier s'il existe déjà une conversation privée entre ces utilisateurs
      const { data: existingConv, error: existingError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_members!inner(user_id)
        `)
        .eq('conversation_type', 'private');

      if (existingError) throw existingError;

      // Chercher une conversation qui contient exactement ces deux utilisateurs
      const existingPrivateConv = existingConv?.find(conv => {
        const userIds = conv.conversation_members.map(m => m.user_id).sort();
        return userIds.length === 2 && 
               userIds.includes(user.id) && 
               userIds.includes(targetUserId);
      });

      if (existingPrivateConv) {
        return existingPrivateConv.id;
      }

      // Créer une nouvelle conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: title || 'Conversation privée',
          conversation_type: 'private',
          metadata: {}
        })
        .select()
        .single();

      if (convError) throw convError;

      // Ajouter les deux membres
      const { error: membersError } = await supabase
        .from('conversation_members')
        .insert([
          {
            conversation_id: newConv.id,
            user_id: user.id,
            role: 'owner'
          },
          {
            conversation_id: newConv.id,
            user_id: targetUserId,
            role: 'member'
          }
        ]);

      if (membersError) throw membersError;

      // Rafraîchir la liste des conversations
      fetchConversations();
      
      return newConv.id;
    } catch (error) {
      console.error('Error creating private conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('conversation_members')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Mettre à jour localement
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    createPrivateConversation,
    markAsRead
  };
};