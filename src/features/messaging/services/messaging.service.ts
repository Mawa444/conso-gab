/**
 * Service de messagerie centralisé
 * Gère toutes les opérations liées aux conversations et messages
 */

import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, SendMessageDTO } from '../types';

// Helper pour RPC non typées
const rpc = (name: string, params?: Record<string, unknown>) => 
  (supabase as any).rpc(name, params);

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await rpc('get_conversations_for_user', { 
      p_user_id: userId 
    });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Transformer les données
    return (data || []).map((c: any) => ({
      id: c.id,
      title: c.title || c.business_name || c.other_participant_name || 'Conversation',
      type: c.type || 'direct',
      business_id: c.business_id,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
      participants: [],
      last_message: c.last_message_content ? {
        id: '',
        conversation_id: c.id,
        sender_id: '',
        content: c.last_message_content,
        type: 'text' as const,
        status: 'sent' as const,
        created_at: c.last_message_at || new Date().toISOString()
      } : undefined,
      unread_count: c.unread_count || 0,
      business_context: c.business_id ? {
        business_id: c.business_id,
        business_name: c.business_name || 'Business',
        logo_url: c.other_participant_avatar
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
}

/**
 * Récupère les messages d'une conversation
 */
export async function getMessages(
  conversationId: string, 
  page = 0, 
  limit = 50
): Promise<Message[]> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  // Récupérer les profils des expéditeurs
  const senderIds = [...new Set((data || []).map(m => m.sender_id))];
  const profiles = await getProfilesBatch(senderIds);

  return (data || []).map((m: any) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    content: m.content || '',
    type: m.type || 'text',
    status: m.status || 'sent',
    created_at: m.created_at,
    updated_at: m.updated_at,
    attachment_url: m.metadata?.attachment_url,
    sender_profile: profiles.get(m.sender_id)
  }));
}

/**
 * Envoie un message
 */
export async function sendMessage(dto: SendMessageDTO): Promise<Message | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Non authentifié');

  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({
      conversation_id: dto.conversation_id,
      content: dto.content,
      type: dto.type || 'text',
      sender_id: userData.user.id,
      status: 'sent',
      metadata: dto.attachment_url ? { attachment_url: dto.attachment_url } : null
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  // Mettre à jour la conversation
  await (supabase as any)
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', dto.conversation_id);

  return {
    ...data,
    type: data.type || 'text',
    status: 'sent',
    sender_profile: {
      id: userData.user.id,
      display_name: userData.user.user_metadata?.display_name || 'Moi',
      avatar_url: userData.user.user_metadata?.avatar_url
    }
  };
}

/**
 * Crée ou récupère une conversation avec un business
 */
export async function getOrCreateBusinessConversation(
  businessId: string, 
  userId: string
): Promise<string> {
  // Vérifier si une conversation existe déjà (type 'direct' avec business_id)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)
    .eq('type', 'direct')
    .single();

  if (existing) {
    // Vérifier si l'utilisateur est participant
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('conversation_id', existing.id)
      .eq('user_id', userId)
      .single();

    if (participant) {
      return existing.id;
    }
  }

  // Créer une nouvelle conversation (type 'direct' car 'business' n'existe pas dans l'enum)
  const { data: newConv, error: convError } = await (supabase as any)
    .from('conversations')
    .insert({
      type: 'direct',
      business_id: businessId,
      title: null,
      metadata: { origin_type: 'business' }
    })
    .select('id')
    .single();

  if (convError) throw convError;

  // Récupérer le propriétaire du business
  const { data: business } = await supabase
    .from('business_profiles')
    .select('user_id, owner_id')
    .eq('id', businessId)
    .single();

  const businessOwnerId = business?.owner_id || business?.user_id;

  // Ajouter les participants
  await (supabase as any)
    .from('participants')
    .insert([
      { conversation_id: newConv.id, user_id: userId },
      ...(businessOwnerId && businessOwnerId !== userId 
        ? [{ conversation_id: newConv.id, user_id: businessOwnerId }] 
        : [])
    ]);

  return newConv.id;
}

/**
 * Crée ou récupère une conversation directe entre deux utilisateurs
 */
export async function getOrCreateDirectConversation(
  userId: string,
  otherUserId: string
): Promise<string> {
  // Chercher une conversation existante entre les deux utilisateurs
  const { data: userConvs } = await supabase
    .from('participants')
    .select('conversation_id')
    .eq('user_id', userId);

  const { data: otherConvs } = await supabase
    .from('participants')
    .select('conversation_id')
    .eq('user_id', otherUserId);

  if (userConvs && otherConvs) {
    const userConvIds = new Set(userConvs.map(c => c.conversation_id));
    const commonConv = otherConvs.find(c => userConvIds.has(c.conversation_id));
    
    if (commonConv) {
      // Vérifier que c'est une conversation directe (pas business/group)
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, type')
        .eq('id', commonConv.conversation_id)
        .eq('type', 'direct')
        .single();
      
      if (conv) return conv.id;
    }
  }

  // Créer une nouvelle conversation
  const { data: newConv, error } = await (supabase as any)
    .from('conversations')
    .insert({ type: 'direct' })
    .select('id')
    .single();

  if (error) throw error;

  // Ajouter les participants
  await (supabase as any)
    .from('participants')
    .insert([
      { conversation_id: newConv.id, user_id: userId },
      { conversation_id: newConv.id, user_id: otherUserId }
    ]);

  return newConv.id;
}

/**
 * Marque une conversation comme lue
 */
export async function markConversationRead(
  conversationId: string, 
  userId: string
): Promise<void> {
  await (supabase as any)
    .from('participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

/**
 * Récupère un lot de profils utilisateurs
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

/**
 * Récupère les détails d'une conversation
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const { data: conv, error } = await (supabase as any)
    .from('conversations')
    .select(`
      *,
      participants(user_id, last_read_at, joined_at)
    `)
    .eq('id', conversationId)
    .single();

  if (error || !conv) return null;

  // Récupérer les profils des participants
  const userIds = (conv.participants || []).map((p: any) => p.user_id);
  const profiles = await getProfilesBatch(userIds);

  // Récupérer les infos business si applicable
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
    business_id: conv.business_id,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    participants: (conv.participants || []).map((p: any) => ({
      user_id: p.user_id,
      joined_at: p.joined_at,
      last_read_at: p.last_read_at,
      profile: profiles.get(p.user_id)
    })),
    unread_count: 0,
    business_context: businessContext
  };
}
