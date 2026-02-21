import React from 'react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/features/auth';

interface Props {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

function formatConvTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  return format(date, 'dd/MM/yy', { locale: fr });
}

export const SignalConversationList: React.FC<Props> = ({
  conversations,
  activeId,
  onSelect,
  isLoading,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded w-28" />
              <div className="h-3 bg-muted rounded w-44" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-muted-foreground text-sm">Aucune conversation</p>
        <p className="text-muted-foreground/70 text-xs mt-1">Appuyez sur ✏️ pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p.user_id !== user?.id);
        const title = conv.title || conv.business_context?.business_name || otherParticipant?.profile?.display_name || 'Conversation';
        const avatarUrl = conv.business_context?.logo_url || otherParticipant?.profile?.avatar_url;
        const lastMsg = conv.last_message;
        const time = conv.last_message_at ? formatConvTime(conv.last_message_at) : '';
        const isActive = activeId === conv.id;
        const hasUnread = conv.unread_count > 0;

        // Last message preview
        let preview = 'Nouvelle conversation';
        if (lastMsg) {
          const isMine = lastMsg.sender_id === user?.id;
          const prefix = isMine ? 'Vous: ' : '';
          preview = `${prefix}${lastMsg.content || '📎 Pièce jointe'}`;
        }

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-left w-full transition-colors border-b border-border/40",
              isActive
                ? "bg-primary/10"
                : "hover:bg-muted/50 active:bg-muted"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                  {title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conv.business_context && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-[8px]">🏪</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className={cn(
                  "truncate text-[15px]",
                  hasUnread ? "font-bold text-foreground" : "font-medium text-foreground"
                )}>
                  {title}
                </span>
                <span className={cn(
                  "text-xs flex-shrink-0",
                  hasUnread ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {time}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={cn(
                  "text-[13px] truncate flex-1",
                  hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {preview}
                </p>
                {hasUnread && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary rounded-full text-[11px] font-bold text-primary-foreground flex items-center justify-center">
                    {conv.unread_count}
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
