import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, CreateMessageDTO } from './types';

/**
 * Fetch profiles for a batch of user IDs using direct query
 */
async function getProfilesBatch(userIds: string[]): Promise<Map<string, any>> {
  if (userIds.length === 0) return new Map();

  const { data } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', userIds);

  const map = new Map();
  (data || []).forEach(p => {
    map.set(p.user_id, {
      id: p.user_id,
      display_name: p.display_name || 'Utilisateur',
      avatar_url: p.avatar_url
    });
  });
  return map;
}

// --- Conversations ---

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  try {
    // 1. Get all conversation IDs the user participates in
    const { data: participantRows, error: pError } = await supabase
      .from('participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (pError || !participantRows?.length) return [];

    const conversationIds = participantRows.map(p => p.conversation_id);
    const lastReadMap = new Map(participantRows.map(p => [p.conversation_id, p.last_read_at]));

    // 2. Get conversations with business info
    const { data: conversations, error: cError } = await (supabase as any)
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (cError || !conversations?.length) return [];

    // 3. Get all participants for these conversations
    const { data: allParticipants } = await supabase
      .from('participants')
      .select('conversation_id, user_id, last_read_at, joined_at')
      .in('conversation_id', conversationIds);

    // 4. Get last message for each conversation
    // We'll get the most recent message per conversation
    const { data: recentMessages } = await (supabase as any)
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    // Build last message map (first message per conversation_id)
    const lastMessageMap = new Map<string, any>();
    (recentMessages || []).forEach((m: any) => {
      if (!lastMessageMap.has(m.conversation_id)) {
        lastMessageMap.set(m.conversation_id, m);
      }
    });

    // 5. Collect all user IDs for profile fetching
    const allUserIds = new Set<string>();
    (allParticipants || []).forEach(p => allUserIds.add(p.user_id));
    lastMessageMap.forEach(m => allUserIds.add(m.sender_id));

    const profileMap = await getProfilesBatch(Array.from(allUserIds));

    // 6. Get business profiles if needed
    const businessIds = conversations
      .filter((c: any) => c.business_id)
      .map((c: any) => c.business_id);

    const businessMap = new Map<string, any>();
    if (businessIds.length > 0) {
      const { data: businesses } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, business_category')
        .in('id', businessIds);

      (businesses || []).forEach(b => {
        businessMap.set(b.id, b);
      });
    }

    // 7. Build participant map per conversation
    const participantsByConv = new Map<string, any[]>();
    (allParticipants || []).forEach(p => {
      if (!participantsByConv.has(p.conversation_id)) {
        participantsByConv.set(p.conversation_id, []);
      }
      participantsByConv.get(p.conversation_id)!.push({
        user_id: p.user_id,
        last_read_at: p.last_read_at,
        joined_at: p.joined_at,
        profile: profileMap.get(p.user_id)
      });
    });

    // 8. Calculate unread counts
    return conversations.map((c: any) => {
      const lastRead = lastReadMap.get(c.id);
      const lastMsg = lastMessageMap.get(c.id);
      const participants = participantsByConv.get(c.id) || [];

      // Count unread: messages after last_read_at that are not from current user
      let unreadCount = 0;
      if (lastRead && recentMessages) {
        unreadCount = (recentMessages as any[]).filter(
          (m: any) => m.conversation_id === c.id && 
                       m.sender_id !== userId && 
                       new Date(m.created_at) > new Date(lastRead)
        ).length;
      } else if (!lastRead && lastMsg) {
        // Never read - count all messages from others
        unreadCount = (recentMessages as any[]).filter(
          (m: any) => m.conversation_id === c.id && m.sender_id !== userId
        ).length;
      }

      const business = c.business_id ? businessMap.get(c.business_id) : null;

      return {
        id: c.id,
        title: c.title,
        type: c.type || 'direct',
        created_at: c.created_at,
        updated_at: c.updated_at,
        last_message_at: lastMsg?.created_at || c.updated_at,
        unread_count: unreadCount,
        participants,
        last_message: lastMsg ? {
          id: lastMsg.id,
          conversation_id: lastMsg.conversation_id,
          sender_id: lastMsg.sender_id,
          content: lastMsg.content || '',
          message_type: lastMsg.type || 'text',
          status: lastMsg.status || 'sent',
          created_at: lastMsg.created_at,
          sender_profile: profileMap.get(lastMsg.sender_id)
        } : undefined,
        business_context: business ? {
          business_id: business.id,
          business_name: business.business_name,
          logo_url: business.logo_url,
          category: business.business_category
        } : undefined
      } as Conversation;
    });
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

  const senderIds = Array.from(new Set((data || []).map(m => m.sender_id)));
  const profileMap = await getProfilesBatch(senderIds);

  return (data || []).map((m: any) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    content: m.content || '',
    message_type: m.type || 'text',
    status: m.status || 'sent',
    created_at: m.created_at,
    updated_at: m.updated_at,
    sender_profile: profileMap.get(m.sender_id)
  }));
}

export async function sendMessage(dto: CreateMessageDTO): Promise<Message> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Non authentifié');

  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({
      conversation_id: dto.conversation_id,
      content: dto.content,
      type: dto.message_type || 'text',
      sender_id: userData.user.id
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
    id: data.id,
    conversation_id: data.conversation_id,
    sender_id: data.sender_id,
    content: data.content || '',
    message_type: data.type || 'text',
    status: 'sent',
    created_at: data.created_at,
    sender_profile: {
      id: userData.user.id,
      display_name: userData.user.user_metadata?.display_name || 'Moi',
      avatar_url: userData.user.user_metadata?.avatar_url
    }
  } as Message;
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await (supabase as any)
    .from('participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

export async function getOrCreateBusinessConversation(businessId: string, userId: string): Promise<Conversation> {
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)
    .eq('type', 'direct');

  if (existing && existing.length > 0) {
    // Check if user is participant in any of them
    for (const conv of existing) {
      const { data: participant } = await supabase
        .from('participants')
        .select('id')
        .eq('conversation_id', conv.id)
        .eq('user_id', userId)
        .single();

      if (participant) {
        return fetchConversationById(conv.id);
      }
    }
  }

  // Create new conversation
  const { data: newConv, error: convError } = await (supabase as any)
    .from('conversations')
    .insert({
      type: 'direct',
      business_id: businessId,
      metadata: { origin_type: 'business' }
    })
    .select('id')
    .single();

  if (convError) throw convError;

  // Get business owner
  const { data: business } = await supabase
    .from('business_profiles')
    .select('user_id, owner_id')
    .eq('id', businessId)
    .single();

  const businessOwnerId = business?.owner_id || business?.user_id;

  // Add participants
  const participants = [{ conversation_id: newConv.id, user_id: userId }];
  if (businessOwnerId && businessOwnerId !== userId) {
    participants.push({ conversation_id: newConv.id, user_id: businessOwnerId });
  }

  await (supabase as any).from('participants').insert(participants);

  return fetchConversationById(newConv.id);
}

export async function fetchConversationById(conversationId: string): Promise<Conversation> {
  const { data: conv, error } = await (supabase as any)
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) throw error;

  // Get participants
  const { data: parts } = await supabase
    .from('participants')
    .select('user_id, last_read_at, joined_at')
    .eq('conversation_id', conversationId);

  const userIds = (parts || []).map(p => p.user_id);
  const profileMap = await getProfilesBatch(userIds);

  // Get business context
  let businessContext;
  if (conv.business_id) {
    const { data: business } = await supabase
      .from('business_profiles')
      .select('id, business_name, logo_url, business_category')
      .eq('id', conv.business_id)
      .single();

    if (business) {
      businessContext = {
        business_id: business.id,
        business_name: business.business_name,
        logo_url: business.logo_url,
        category: business.business_category
      };
    }
  }

  return {
    id: conv.id,
    title: conv.title,
    type: conv.type || 'direct',
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.updated_at,
    unread_count: 0,
    participants: (parts || []).map(p => ({
      user_id: p.user_id,
      last_read_at: p.last_read_at,
      joined_at: p.joined_at,
      profile: profileMap.get(p.user_id)
    })),
    business_context: businessContext
  } as Conversation;
}
