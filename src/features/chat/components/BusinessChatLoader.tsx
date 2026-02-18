import React, { useEffect, useState } from 'react';
import { useBusinessConversation } from '../hooks/useChatQueries';
import { ChatWindow } from './ChatWindow';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import * as chatService from '../service';
import { Conversation } from '../types';

interface BusinessChatLoaderProps {
  businessId: string;
}

export const BusinessChatLoader: React.FC<BusinessChatLoaderProps> = ({ businessId }) => {
  const { mutate: getConversation, data: conversationId, isPending, isError } = useBusinessConversation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);

  useEffect(() => {
    if (businessId) {
      getConversation(businessId);
    }
  }, [businessId, getConversation]);

  // Once we have the conversationId, fetch the full conversation
  useEffect(() => {
    if (!conversationId) return;
    setLoadingConv(true);
    // Build a minimal conversation object from what we know
    const loadConv = async () => {
      try {
        // Fetch conversations list and find ours
        const { data: userData } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
        if (!userData.user) return;
        const convs = await chatService.fetchConversations(userData.user.id);
        const found = convs.find(c => c.id === conversationId);
        if (found) setConversation(found);
      } finally {
        setLoadingConv(false);
      }
    };
    loadConv();
  }, [conversationId]);

  if (isPending || loadingConv) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Erreur lors du chargement de la conversation</p>
        <Button onClick={() => getConversation(businessId)}>Réessayer</Button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <MessageCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Démarrer une conversation</p>
        <Button onClick={() => getConversation(businessId)}>Commencer</Button>
      </div>
    );
  }

  return <ChatWindow conversation={conversation} />;
};