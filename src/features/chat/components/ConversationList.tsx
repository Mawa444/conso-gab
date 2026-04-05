import React from 'react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/features/auth';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  activeId, 
  onSelect,
  isLoading 
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Chargement...</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation</div>;
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {conversations.map((conv) => {
        // Determine display info
        const otherParticipant = conv.participants.find(p => p.user_id !== user?.id);
        const title = conv.title || conv.business_context?.business_name || otherParticipant?.profile?.display_name || 'Conversation';
        const avatarUrl = conv.business_context?.logo_url || otherParticipant?.profile?.avatar_url;
        const lastMsg = conv.last_message?.content || 'Nouvelle conversation';
        const time = conv.last_message_at 
          ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: fr })
          : '';

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted/50",
              activeId === conv.id ? "bg-muted shadow-sm" : "transparent"
            )}
          >
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline">
                <span className="font-medium truncate text-sm">{title}</span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{time}</span>
              </div>
              <p className={cn(
                "text-xs truncate mt-0.5",
                conv.unread_count > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
              )}>
                {conv.unread_count > 0 && <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1" />}
                {lastMsg}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
