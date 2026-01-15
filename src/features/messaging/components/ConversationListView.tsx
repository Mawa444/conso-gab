/**
 * Liste des conversations - Design Signal-like mobile-first
 */

import React from 'react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/features/auth';
import { Building2, Check, CheckCheck } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export const ConversationListView: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  isLoading
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground p-8 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">💬</span>
        </div>
        <p className="font-medium text-lg">Aucune conversation</p>
        <p className="text-sm mt-1">Commencez à discuter avec des entreprises ou des utilisateurs</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const title = conv.title || conv.business_context?.business_name || 'Conversation';
        const avatarUrl = conv.business_context?.logo_url;
        const lastMsg = conv.last_message?.content || 'Nouvelle conversation';
        const time = conv.last_message?.created_at
          ? formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false, locale: fr })
          : '';
        const isActive = activeId === conv.id;
        const hasUnread = conv.unread_count > 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-border/50",
              "hover:bg-muted/50 active:bg-muted",
              isActive && "bg-primary/5 border-l-4 border-l-primary"
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                  {conv.business_context ? (
                    <Building2 className="w-5 h-5 text-primary" />
                  ) : (
                    title.substring(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              {/* Badge business */}
              {conv.business_context && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className={cn(
                  "font-medium truncate text-sm",
                  hasUnread && "font-bold"
                )}>
                  {title}
                </span>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  {time}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-0.5">
                {/* Message status icon */}
                {conv.last_message?.sender_id === user?.id && (
                  <CheckCheck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                )}
                
                <p className={cn(
                  "text-sm truncate",
                  hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
                )}>
                  {lastMsg}
                </p>
                
                {/* Unread badge */}
                {hasUnread && (
                  <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
