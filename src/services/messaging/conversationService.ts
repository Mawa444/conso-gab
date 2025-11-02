/**
 * ============================================
 * CONVERSATION SERVICE
 * ============================================
 * Service pour gérer les conversations (découpage de MessagingContext)
 */

import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';
import type { MimoConversation, ConversationParticipant } from '@/types/chat.types';

const logger = createDomainLogger('ConversationService');

interface ProfileData {
  display_name?: string;
  avatar_url?: string;
}

interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  business_category: string;
}

/**
 * Fetch conversations with unified identity system (Meta-style)
 */
export async function fetchConversationsForUser(userId: string): Promise<MimoConversation[]> {
  try {
    // 1. Fetch conversations with participants
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        conversation_type,
        created_at,
        last_activity,
        origin_type,
        origin_id,
        participants!inner(
          user_id,
          role,
          last_read,
          created_at
        )
      `)
      .eq('participants.user_id', userId)
      .order('last_activity', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const conversationIds = data.map(conv => conv.id);

    // 2. Extract all unique participant user_ids
    const allParticipantIds = new Set<string>();
    data.forEach((conv: any) => {
      conv.participants?.forEach((p: any) => {
        allParticipantIds.add(p.user_id);
      });
    });

    // 3. Fetch user profiles
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('user_id, pseudo, profile_picture_url')
      .in('user_id', Array.from(allParticipantIds));

    const profilesMap = new Map<string, ProfileData>(
      userProfiles?.map(p => [p.user_id, {
        display_name: p.pseudo,
        avatar_url: p.profile_picture_url
      }]) || []
    );

    // 4. Fetch business profiles for business conversations
    const businessOriginIds = data
      .filter((c: any) => c.origin_type === 'business' && c.origin_id)
      .map(c => c.origin_id);

    let businessProfilesMap = new Map<string, BusinessProfile>();
    if (businessOriginIds.length > 0) {
      const { data: businessProfiles } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, whatsapp, phone, email, business_category')
        .in('id', businessOriginIds);

      businessProfilesMap = new Map(
        businessProfiles?.map(bp => [bp.id, bp]) || []
      );
    }

    // 5. Fetch last messages
    const { data: lastMessagesData } = await supabase
      .from('messages')
      .select('id, conversation_id, content, message_type, created_at, sender_id')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    // Group messages by conversation (keep only the latest)
    const lastMessagesMap = new Map();
    lastMessagesData?.forEach((msg: any) => {
      if (!lastMessagesMap.has(msg.conversation_id)) {
        lastMessagesMap.set(msg.conversation_id, msg);
      }
    });

    // 6. Transform conversations with unified data
    const transformedConversations = await Promise.all(
      data.map(async (conv: any) => {
        const lastMessage = lastMessagesMap.get(conv.id);
        const userParticipant = conv.participants.find((p: any) => p.user_id === userId);
        
        // Enrich participants with unified profile data
        const enrichedParticipants: ConversationParticipant[] = conv.participants.map((p: any) => {
          const profile = profilesMap.get(p.user_id);
          return {
            user_id: p.user_id,
            role: p.role as 'consumer' | 'business' | 'member' | 'admin',
            joined_at: p.created_at,
            last_read: p.last_read,
            profile: profile || undefined
          };
        });
        
        // Calculate unread count
        let unreadCount = 0;
        if (userParticipant?.last_read) {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .gt('created_at', userParticipant.last_read)
            .neq('sender_id', userId);
          unreadCount = count || 0;
        }
        
        // Enrich business conversations with context
        let enrichedConv: any = { ...conv };
        if (conv.origin_type === 'business' && conv.origin_id) {
          const businessProfile = businessProfilesMap.get(conv.origin_id);
          if (businessProfile) {
            enrichedConv = {
              ...conv,
              title: businessProfile.business_name || conv.title || 'Business',
              avatar_url: businessProfile.logo_url,
              business_context: {
                business_id: businessProfile.id,
                business_name: businessProfile.business_name,
                category: businessProfile.business_category,
                logo_url: businessProfile.logo_url,
                whatsapp: businessProfile.whatsapp,
                phone: businessProfile.phone,
                email: businessProfile.email
              }
            };
          }
        }
        
        return {
          ...enrichedConv,
          type: conv.conversation_type as 'private' | 'group' | 'business',
          unread_count: unreadCount,
          participants: enrichedParticipants,
          last_message: lastMessage ? {
            ...lastMessage,
            sender_profile: profilesMap.get(lastMessage.sender_id)
          } : null
        } as MimoConversation;
      })
    );

    return transformedConversations;
  } catch (err) {
    logger.error('Error fetching conversations', { error: err });
    throw err;
  }
}

/**
 * Create or get business conversation (Meta-style: atomic, idempotent)
 */
export async function getOrCreateBusinessConversation(
  businessId: string,
  userId: string
): Promise<string> {
  try {
    // Appel RPC atomique : trouve OU crée (Meta-style)
    const { data: conversationId, error: rpcError } = await supabase
      .rpc('get_or_create_business_conversation', {
        p_business_id: businessId,
        p_user_id: userId
      });

    if (rpcError) throw rpcError;
    
    return conversationId as string;
  } catch (err) {
    logger.error('Error getting/creating business conversation', { error: err });
    throw err;
  }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('participants')
      .update({ last_read: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  } catch (err) {
    logger.error('Error marking conversation as read', { error: err });
    throw err;
  }
}

/**
 * Fetch complete conversation data
 */
export async function fetchConversationById(conversationId: string): Promise<MimoConversation> {
  try {
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        conversation_type,
        created_at,
        last_activity,
        origin_type,
        origin_id,
        participants(user_id, role, created_at)
      `)
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Fetch business context if applicable
    let businessContext;
    if (convData.origin_type === 'business' && convData.origin_id) {
      const { data: contextData } = await supabase
        .rpc('get_conversation_context', { p_conversation_id: conversationId });
      businessContext = contextData as any;
    }

    // Fetch participant profiles
    const participantIds = convData.participants?.map((p: any) => p.user_id) || [];
    const { data: profilesData } = await supabase
      .rpc('get_unified_profiles_batch', { p_user_ids: participantIds });

    const profilesMap = new Map<string, ProfileData>();
    if (profilesData) {
      Object.entries(profilesData).forEach(([userId, profileData]: [string, any]) => {
        profilesMap.set(userId, {
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url
        });
      });
    }

    const enrichedParticipants: ConversationParticipant[] = (convData.participants || []).map((p: any) => ({
      user_id: p.user_id,
      role: p.role,
      joined_at: p.created_at,
      profile: profilesMap.get(p.user_id)
    }));

    return {
      id: convData.id,
      title: convData.title,
      type: convData.conversation_type as 'private' | 'group' | 'business',
      origin_type: convData.origin_type as 'business' | 'direct' | 'group',
      origin_id: convData.origin_id,
      created_at: convData.created_at,
      last_activity: convData.last_activity,
      unread_count: 0,
      participants: enrichedParticipants,
      business_context: businessContext ? {
        business_id: businessContext.business_id,
        business_name: businessContext.business_name,
        category: businessContext.category,
        logo_url: businessContext.logo_url,
        whatsapp: businessContext.whatsapp,
        phone: businessContext.phone,
        email: businessContext.email
      } : undefined
    };
  } catch (err) {
    logger.error('Error fetching conversation by ID', { error: err });
    throw err;
  }
}
