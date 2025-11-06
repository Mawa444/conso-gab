/**
 * ============================================
 * DIRECT CONVERSATION SERVICE (USER-TO-USER)
 * ============================================
 * Service pour gérer les conversations directes entre utilisateurs
 * Architecture Meta: 1 user + 1 user = 1 conversation unique
 */

import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('DirectConversationService');

/**
 * Créer ou récupérer une conversation directe entre 2 utilisateurs
 * Meta-style: atomique et idempotent
 */
export async function getOrCreateDirectConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  try {
    logger.info('Creating/getting direct conversation', { userId1, userId2 });

    // Appel RPC atomique: trouve OU crée (Meta-style)
    const { data: conversationId, error: rpcError } = await supabase
      .rpc('get_or_create_direct_conversation', {
        p_user_id_1: userId1,
        p_user_id_2: userId2
      });

    if (rpcError) {
      logger.error('RPC error', { error: rpcError });
      throw rpcError;
    }
    
    logger.info('Conversation ready', { conversationId });
    return conversationId as string;
  } catch (err) {
    logger.error('Error getting/creating direct conversation', { error: err });
    throw err;
  }
}
