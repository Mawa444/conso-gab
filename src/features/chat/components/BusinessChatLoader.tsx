import React, { useEffect } from 'react';
import { useBusinessConversation } from '../hooks/useChatQueries';
import { ChatWindow } from './ChatWindow';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface BusinessChatLoaderProps {
  businessId: string;
}

export const BusinessChatLoader: React.FC<BusinessChatLoaderProps> = ({ businessId }) => {
  const { mutate: getConversation, data: conversation, isPending, isError } = useBusinessConversation();

  useEffect(() => {
    if (businessId) {
      getConversation(businessId);
    }
  }, [businessId, getConversation]);

  if (isPending) {
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
