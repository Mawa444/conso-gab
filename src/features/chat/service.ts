import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, CreateMessageDTO } from './types';

async function getProfilesBatch(userIds: string[]): Promise<Map<string, any>> {
  if (!userIds.length) return new Map();
  const { data } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', userIds);
  const map = new Map();
  (data || []).forEach(p => map.set(p.user_id, { id: p.user_id, display_name: p.display_name || 'Utilisateur', avatar_url: p.avatar_url }));
  return map;
}

export async function searchUsers(query: string, currentUserId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .neq('user_id', currentUserId)
    .ilike('display_name', `%${query}%`)
    .limit(20);
  return data || [];
}

export async function searchBusinesses(query: string) {
  const { data } = await supabase
    .from('business_profiles')
    .select('id, business_name, logo_url, business_category')
    .eq('is_active', true)
    .ilike('business_name', `%${query}%`)
    .limit(20);
  return data || [];
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data: participantRows } = await supabase
    .from('participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (!participantRows?.length) return [];

  const conversationIds = participantRows.map(p => p.conversation_id);
  const lastReadMap = new Map(participantRows.map(p => [p.conversation_id, p.last_read_at]));

  const { data: conversations } = await (supabase as any)
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (!conversations?.length) return [];

  const { data: allParticipants } = await supabase
    .from('participants')
    .select('conversation_id, user_id, last_read_at, joined_at')
    .in('conversation_id', conversationIds);

  const { data: recentMessages } = await (supabase as any)
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  const lastMessageMap = new Map<string, any>();
  (recentMessages || []).forEach((m: any) => {
    if (!lastMessageMap.has(m.conversation_id)) lastMessageMap.set(m.conversation_id, m);
  });

  const allUserIds = new Set<string>();
  (allParticipants || []).forEach(p => allUserIds.add(p.user_id));
  lastMessageMap.forEach(m => allUserIds.add(m.sender_id));
  const profileMap = await getProfilesBatch(Array.from(allUserIds));

  const businessIds = conversations.filter((c: any) => c.business_id).map((c: any) => c.business_id);
  const businessMap = new Map<string, any>();
  if (businessIds.length) {
    const { data: businesses } = await supabase
      .from('business_profiles')
      .select('id, business_name, logo_url, business_category')
      .in('id', businessIds);
    (businesses || []).forEach(b => businessMap.set(b.id, b));
  }

  const participantsByConv = new Map<string, any[]>();
  (allParticipants || []).forEach(p => {
    if (!participantsByConv.has(p.conversation_id)) participantsByConv.set(p.conversation_id, []);
    participantsByConv.get(p.conversation_id)!.push({
      user_id: p.user_id, last_read_at: p.last_read_at, joined_at: p.joined_at,
      profile: profileMap.get(p.user_id)
    });
  });

  return conversations.map((c: any) => {
    const lastRead = lastReadMap.get(c.id);
    const lastMsg = lastMessageMap.get(c.id);
    const participants = participantsByConv.get(c.id) || [];
    let unreadCount = 0;
    if (recentMessages) {
      const convMsgs = (recentMessages as any[]).filter((m: any) => m.conversation_id === c.id && m.sender_id !== userId);
      unreadCount = lastRead
        ? convMsgs.filter((m: any) => new Date(m.created_at) > new Date(lastRead)).length
        : convMsgs.length;
    }
    const business = c.business_id ? businessMap.get(c.business_id) : null;

    return {
      id: c.id, title: c.title, type: c.type || 'direct',
      created_at: c.created_at, updated_at: c.updated_at,
      last_message_at: lastMsg?.created_at || c.updated_at,
      unread_count: unreadCount, participants,
      last_message: lastMsg ? {
        id: lastMsg.id, conversation_id: lastMsg.conversation_id,
        sender_id: lastMsg.sender_id, content: lastMsg.content || '',
        message_type: lastMsg.type || 'text', status: lastMsg.status || 'sent',
        created_at: lastMsg.created_at, sender_profile: profileMap.get(lastMsg.sender_id)
      } : undefined,
      business_context: business ? {
        business_id: business.id, business_name: business.business_name,
        logo_url: business.logo_url, category: business.business_category
      } : undefined
    } as Conversation;
  });
}

export async function fetchMessages(conversationId: string, page = 0, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(page * limit, page * limit + limit - 1);
  if (error) throw error;

  const senderIds = Array.from(new Set((data || []).map(m => m.sender_id)));
  const profileMap = await getProfilesBatch(senderIds);

  return (data || []).map((m: any) => ({
    id: m.id, conversation_id: m.conversation_id, sender_id: m.sender_id,
    content: m.content || '', message_type: m.type || 'text',
    status: m.status || 'sent', created_at: m.created_at,
    sender_profile: profileMap.get(m.sender_id)
  }));
}

export async function sendMessage(dto: CreateMessageDTO): Promise<Message> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Non authentifié');

  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({ conversation_id: dto.conversation_id, content: dto.content, type: dto.message_type || 'text', sender_id: userData.user.id })
    .select().single();
  if (error) throw error;

  await (supabase as any).from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', dto.conversation_id);

  return {
    id: data.id, conversation_id: data.conversation_id, sender_id: data.sender_id,
    content: data.content || '', message_type: data.type || 'text', status: 'sent',
    created_at: data.created_at,
    sender_profile: { id: userData.user.id, display_name: userData.user.user_metadata?.display_name || 'Moi', avatar_url: userData.user.user_metadata?.avatar_url }
  };
}

export async function markAsRead(conversationId: string, userId: string) {
  await (supabase as any).from('participants').update({ last_read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', userId);
}

export async function getOrCreateBusinessConversation(businessId: string, userId: string): Promise<string> {
  const { data: existing } = await supabase.from('conversations').select('id').eq('business_id', businessId);
  if (existing?.length) {
    for (const conv of existing) {
      const { data: p } = await supabase.from('participants').select('id').eq('conversation_id', conv.id).eq('user_id', userId).single();
      if (p) return conv.id;
    }
  }
  const { data: newConv, error } = await (supabase as any).from('conversations').insert({ type: 'direct', business_id: businessId }).select('id').single();
  if (error) throw error;

  const { data: business } = await supabase.from('business_profiles').select('user_id, owner_id').eq('id', businessId).single();
  const ownerId = business?.owner_id || business?.user_id;
  const parts = [{ conversation_id: newConv.id, user_id: userId }];
  if (ownerId && ownerId !== userId) parts.push({ conversation_id: newConv.id, user_id: ownerId });
  await (supabase as any).from('participants').insert(parts);
  return newConv.id;
}

export async function getOrCreateDirectConversation(userId: string, otherUserId: string): Promise<string> {
  const { data: userConvs } = await supabase.from('participants').select('conversation_id').eq('user_id', userId);
  const { data: otherConvs } = await supabase.from('participants').select('conversation_id').eq('user_id', otherUserId);
  if (userConvs && otherConvs) {
    const userSet = new Set(userConvs.map(c => c.conversation_id));
    const common = otherConvs.filter(c => userSet.has(c.conversation_id)).map(c => c.conversation_id);
    if (common.length) {
      const { data: conv } = await supabase.from('conversations').select('id').in('id', common).eq('type', 'direct').is('business_id', null).limit(1).single();
      if (conv) return conv.id;
    }
  }
  const { data: newConv, error } = await (supabase as any).from('conversations').insert({ type: 'direct' }).select('id').single();
  if (error) throw error;
  await (supabase as any).from('participants').insert([
    { conversation_id: newConv.id, user_id: userId },
    { conversation_id: newConv.id, user_id: otherUserId }
  ]);
  return newConv.id;
}
