import React from 'react';
import { Conversation } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/features/auth';
import { Store, Check, CheckCheck, Image, Mic, FileText } from 'lucide-react';

interface Props {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Hier';
  return format(d, 'dd/MM/yy', { locale: fr });
}

function getMessageIcon(type: string) {
  switch (type) {
    case 'image': return <Image className="w-3.5 h-3.5 inline mr-0.5" />;
    case 'audio': return <Mic className="w-3.5 h-3.5 inline mr-0.5" />;
    case 'file': return <FileText className="w-3.5 h-3.5 inline mr-0.5" />;
    default: return null;
  }
}

export const SignalConversationList: React.FC<Props> = ({ conversations, activeId, onSelect, isLoading }) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
            <div className="w-13 h-13 rounded-full bg-muted flex-shrink-0" style={{ width: 52, height: 52 }} />
            <div className="flex-1 space-y-2.5">
              <div className="flex justify-between">
                <div className="h-3.5 bg-muted rounded-full w-28" />
                <div className="h-3 bg-muted rounded-full w-10" />
              </div>
              <div className="h-3 bg-muted rounded-full w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-5">
          <svg className="w-12 h-12 text-primary/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <p className="text-foreground font-semibold text-base">Aucune conversation</p>
        <p className="text-muted-foreground text-sm mt-1.5">Appuyez sur ✏️ pour envoyer un message</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const other = conv.participants.find(p => p.user_id !== user?.id);
        const isBusiness = !!conv.business_context;
        const title = conv.title || conv.business_context?.business_name || other?.profile?.display_name || 'Conversation';
        const avatar = conv.business_context?.logo_url || other?.profile?.avatar_url;
        const lastMsg = conv.last_message;
        const time = conv.last_message_at ? formatTime(conv.last_message_at) : '';
        const isActive = activeId === conv.id;
        const hasUnread = conv.unread_count > 0;

        let preview = '';
        let previewIcon = null;
        if (lastMsg) {
          const isMine = lastMsg.sender_id === user?.id;
          previewIcon = getMessageIcon(lastMsg.message_type);
          const content = lastMsg.content || (lastMsg.message_type === 'image' ? 'Photo' : lastMsg.message_type === 'audio' ? 'Audio' : 'Fichier');
          preview = isMine ? `Vous: ${content}` : content;
        }

        const statusIcon = lastMsg?.sender_id === user?.id ? (
          lastMsg.status === 'read'
            ? <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
            : lastMsg.status === 'delivered'
              ? <CheckCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              : <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : null;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-left w-full transition-colors",
              isActive ? "bg-primary/8" : "hover:bg-muted/50 active:bg-muted"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-[52px] w-[52px]">
                <AvatarImage src={avatar || undefined} className="object-cover" />
                <AvatarFallback className={cn(
                  "font-semibold text-sm",
                  isBusiness ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isBusiness && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                  <Store className="w-2.5 h-2.5 text-accent-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 border-b border-border/30 pb-3">
              <div className="flex justify-between items-baseline gap-2">
                <span className={cn(
                  "truncate text-[15px] leading-tight",
                  hasUnread ? "font-bold text-foreground" : "font-medium text-foreground"
                )}>
                  {title}
                </span>
                <span className={cn(
                  "text-[11px] flex-shrink-0 tabular-nums",
                  hasUnread ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {time}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {statusIcon}
                <p className={cn(
                  "text-[13px] truncate flex-1 leading-tight",
                  hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                )}>
                  {previewIcon}{preview || 'Nouvelle conversation'}
                </p>
                {hasUnread && (
                  <span className="flex-shrink-0 min-w-[22px] h-[22px] px-1.5 bg-primary rounded-full text-[11px] font-bold text-primary-foreground flex items-center justify-center">
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
