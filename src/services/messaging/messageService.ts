/**
 * ============================================
 * MESSAGE SERVICE
 * ============================================
 * Service pour gérer les messages (découpage de MessagingContext)
 */

import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';
import type { MimoMessage } from '@/types/chat.types';

const logger = createDomainLogger('MessageService');

const MESSAGES_PER_PAGE = 50;

interface ProfileData {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Fetch messages with pagination and unified profiles
 */
export async function fetchMessagesForConversation(
  conversationId: string,
  page: number = 0
): Promise<MimoMessage[]> {
  try {
    const start = page * MESSAGES_PER_PAGE;
    const end = start + MESSAGES_PER_PAGE - 1;

    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        created_at,
        edited_at,
        reply_to_message_id,
        attachment_url,
        status,
        reactions
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(start, end);

    if (error) throw error;

    // Fetch sender profiles using unified identity (Meta-style)
    const senderIds = [...new Set(data?.map((m: any) => m.sender_id) || [])];
    const { data: unifiedProfilesData } = await supabase
      .rpc('get_unified_profiles_batch', {
        p_user_ids: senderIds
      });
    
    const profilesMap = new Map<string, ProfileData>();
    if (unifiedProfilesData) {
      Object.entries(unifiedProfilesData).forEach(([userId, profileData]: [string, any]) => {
        profilesMap.set(userId, {
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url
        });
      });
    }

    // Enrich messages with sender profiles
    const transformedMessages: MimoMessage[] = (data || []).map((msg: any) => {
      const profile = profilesMap.get(msg.sender_id);
      return {
        ...msg,
        message_type: msg.message_type as MimoMessage['message_type'],
        status: (msg.status || 'sent') as 'sent' | 'delivered' | 'read',
        sender_profile: profile
      };
    });

    return transformedMessages;
  } catch (err) {
    logger.error('Error fetching messages', { error: err });
    throw err;
  }
}

/**
 * Send a message
 */
export async function sendMessageToConversation(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: MimoMessage['message_type'] = 'text',
  attachmentUrl?: string
): Promise<MimoMessage> {
  try {
    // Send to server
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_activity
    await supabase
      .from('conversations')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      ...data,
      message_type: data.message_type as MimoMessage['message_type'],
      status: (data.status || 'sent') as 'sent' | 'delivered' | 'read'
    };
  } catch (err) {
    logger.error('Error sending message', { error: err });
    throw err;
  }
}

/**
 * Create temp message for optimistic UI update
 */
export function createTempMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: MimoMessage['message_type'] = 'text',
  attachmentUrl?: string,
  senderProfile?: ProfileData
): MimoMessage {
  return {
    id: `temp-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    message_type: messageType,
    attachment_url: attachmentUrl,
    created_at: new Date().toISOString(),
    status: 'sent',
    sender_profile: senderProfile
  };
}
