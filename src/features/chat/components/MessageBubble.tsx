import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showAvatar = true }) => {
  const statusIcon = () => {
    if (!isMe) return null;
    if (message.status === 'sending') return <span className="text-xs opacity-70">...</span>;
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3" />;
    return <Check className="w-3 h-3" />;
  };

  return (
    <div className={cn("flex w-full gap-2 mb-4", isMe ? "justify-end" : "justify-start")}>
      {!isMe && showAvatar && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback>{message.sender_profile?.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
        {/* Sender Name (Group chats only usually, but good to have) */}
        {!isMe && (
          <span className="text-xs text-muted-foreground ml-1 mb-1">
            {message.sender_profile?.display_name}
          </span>
        )}

        <div
          className={cn(
            "px-4 py-2 rounded-2xl text-sm shadow-sm relative group",
            isMe 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-muted/50 border border-border rounded-tl-none"
          )}
        >
          {/* Content based on type */}
          {message.message_type === 'text' && <p className="whitespace-pre-wrap">{message.content}</p>}
          
          {message.message_type === 'image' && (
            <div className="rounded-lg overflow-hidden my-1">
              <img src={message.attachment_url || ''} alt="Attachment" className="max-w-full object-cover" />
            </div>
          )}

          {/* Timestamp & Status */}
          <div className={cn(
            "flex items-center gap-1 text-[10px] mt-1 opacity-70",
            isMe ? "justify-end text-primary-foreground/80" : "justify-start text-muted-foreground"
          )}>
            <span>{format(new Date(message.created_at), 'HH:mm', { locale: fr })}</span>
            {statusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
