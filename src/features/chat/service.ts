import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, CreateMessageDTO, MessageType } from './types';

// Helper pour les appels RPC non typés
const rpc = (name: string, params?: any) => (supabase as any).rpc(name, params);

// --- Conversations ---

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await rpc('get_conversations_for_user', { p_user_id: userId });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const conversations = (data || []) as any[];

    // Need to enrich with profiles since RPC returns jsonb for participants
    const allParticipantIds = new Set<string>();
    conversations.forEach((c: any) => {
      c.participants?.forEach((p: any) => allParticipantIds.add(p.user_id));
      if (c.last_message?.sender_id) allParticipantIds.add(c.last_message.sender_id);
    });

    const { data: profiles } = await rpc('get_unified_profiles_batch', {
      p_user_ids: Array.from(allParticipantIds)
    });
    
    const profileMap = new Map(Object.entries(profiles || {}));

    return conversations.map((c: any) => ({
      id: c.id,
      title: c.title,
      type: c.type as any,
      created_at: c.created_at,
      updated_at: c.updated_at,
      last_message_at: c.last_message_at,
      unread_count: c.unread_count,
      participants: (c.participants || []).map((p: any) => ({
        ...p,
        profile: profileMap.get(p.user_id)
      })),
      last_message: c.last_message ? {
        ...c.last_message,
        sender_profile: profileMap.get(c.last_message.sender_id)
      } : undefined,
      origin_type: c.origin_type,
      origin_id: c.origin_id,
      business_context: c.business_context
    }));
  } catch (error) {
    console.error('Error in fetchConversations:', error);
    return [];
  }
}

export async function fetchMessages(conversationId: string, page = 0, limit = 50): Promise<Message[]> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Need profiles for senders
  const senderIds = Array.from(new Set((data || []).map(m => m.sender_id)));
  const { data: profiles } = await rpc('get_unified_profiles_batch', {
    p_user_ids: senderIds
  });
  const profileMap = new Map(Object.entries(profiles || {}));

  return (data || []).map((m: any) => ({
    ...m,
    message_type: m.type || 'text',
    status: m.status || 'sent',
    sender_profile: profileMap.get(m.sender_id)
  }));
}

export async function sendMessage(dto: CreateMessageDTO): Promise<Message> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({
      conversation_id: dto.conversation_id,
      content: dto.content,
      type: dto.message_type || 'text',
      sender_id: userData.user?.id
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation updated_at
  await (supabase as any)
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', dto.conversation_id);

  return {
    ...data,
    message_type: data.type || 'text',
    status: 'sent'
  } as unknown as Message;
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await rpc('mark_conversation_read', {
    p_conversation_id: conversationId,
    p_user_id: userId
  });
}

export async function getOrCreateBusinessConversation(businessId: string, userId: string): Promise<Conversation> {
  // Use the RPC if available, or manual logic
  const { data: conversationId, error } = await rpc('get_or_create_business_conversation', {
    p_business_id: businessId,
    p_user_id: userId
  });

  if (error) throw error;

  // Fetch the full conversation details
  return fetchConversationById(conversationId as string);
}

export async function fetchConversationById(conversationId: string): Promise<Conversation> {
  const { data: conv, error } = await (supabase as any)
    .from('conversations')
    .select(`
      *,
      participants!inner(
        user_id,
        last_read_at,
        joined_at
      )
    `)
    .eq('id', conversationId)
    .single();

  if (error) throw error;

  // Fetch profiles
  const userIds = (conv.participants || []).map((p: any) => p.user_id);
  const { data: profiles } = await rpc('get_unified_profiles_batch', {
    p_user_ids: userIds
  });
  const profileMap = new Map(Object.entries(profiles || {}));

  const participants = (conv.participants || []).map((p: any) => ({
    ...p,
    joined_at: p.joined_at,
    profile: profileMap.get(p.user_id)
  }));

  return {
    id: conv.id,
    title: conv.title,
    type: conv.type as any,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.updated_at,
    unread_count: 0,
    participants,
    origin_type: conv.metadata?.origin_type,
    origin_id: conv.metadata?.origin_id
  };
}
