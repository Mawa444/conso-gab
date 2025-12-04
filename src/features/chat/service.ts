import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, CreateMessageDTO, MessageType } from './types';

// --- Conversations ---

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .rpc('get_conversations_for_user' as any, { p_user_id: userId });

  if (error) throw error;

  const conversations = data as any[];

  // Need to enrich with profiles since RPC returns jsonb for participants
  // We can do this efficiently here or update RPC to return profiles.
  // RPC returns participants list with user_id.
  // Let's fetch profiles for all participants in the batch.
  
  const allParticipantIds = new Set<string>();
  conversations.forEach((c: any) => {
    c.participants.forEach((p: any) => allParticipantIds.add(p.user_id));
    if (c.last_message?.sender_id) allParticipantIds.add(c.last_message.sender_id);
  });

  const { data: profiles } = await supabase.rpc('get_unified_profiles_batch', {
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
    participants: c.participants.map((p: any) => ({
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
}

export async function fetchMessages(conversationId: string, page = 0, limit = 50): Promise<Message[]> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true }) // Chat usually loads old -> new, but pagination is tricky. 
    // Usually we load new -> old (desc) and reverse in UI.
    // Let's load DESC for pagination stability.
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Need profiles for senders
  const senderIds = Array.from(new Set(data.map(m => m.sender_id)));
  const { data: profiles } = await supabase.rpc('get_unified_profiles_batch', {
    p_user_ids: senderIds
  });
  const profileMap = new Map(Object.entries(profiles || {}));

  return data.map((m: any) => ({
    ...m,
    status: m.status || 'sent',
    sender_profile: profileMap.get(m.sender_id)
  }));
}

export async function sendMessage(dto: CreateMessageDTO): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: dto.conversation_id,
      content: dto.content,
      message_type: dto.message_type || 'text',
      attachment_url: dto.attachment_url,
      reply_to_message_id: dto.reply_to_message_id,
      sender_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation last_activity
  await supabase
    .from('conversations')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', dto.conversation_id);

  return {
    ...data,
    status: 'sent'
  } as Message;
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase.rpc('mark_conversation_read' as any, {
    p_conversation_id: conversationId,
    p_user_id: userId
  });
}

export async function getOrCreateBusinessConversation(businessId: string, userId: string): Promise<Conversation> {
  // Use the RPC if available, or manual logic
  const { data: conversationId, error } = await supabase
    .rpc('get_or_create_business_conversation', {
      p_business_id: businessId,
      p_user_id: userId
    });

  if (error) throw error;

  // Fetch the full conversation details
  // We can reuse fetchConversations but filter, or fetch single
  // For efficiency, let's fetch single. We need a fetchConversationById
  return fetchConversationById(conversationId as string);
}

export async function fetchConversationById(conversationId: string): Promise<Conversation> {
  const { data: conv, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants!inner(
        user_id,
        role,
        last_read,
        created_at
      )
    `)
    .eq('id', conversationId)
    .single();

  if (error) throw error;

  // Fetch profiles
  const userIds = conv.participants.map((p: any) => p.user_id);
  const { data: profiles } = await supabase.rpc('get_unified_profiles_batch', {
    p_user_ids: userIds
  });
  const profileMap = new Map(Object.entries(profiles || {}));

  const participants = conv.participants.map((p: any) => ({
    ...p,
    joined_at: p.created_at,
    profile: profileMap.get(p.user_id)
  }));

  return {
    id: conv.id,
    title: conv.title,
    type: conv.conversation_type as any,
    created_at: conv.created_at,
    updated_at: conv.last_activity,
    last_message_at: conv.last_activity,
    unread_count: 0,
    participants,
    origin_type: conv.origin_type,
    origin_id: conv.origin_id
  };
}
