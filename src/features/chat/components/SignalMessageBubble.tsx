import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Props {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const SignalMessageBubble: React.FC<Props> = ({ message, isMe, showAvatar, isLastInGroup }) => {
  const statusIcon = () => {
    if (!isMe) return null;
    if (message.status === 'sending') return <span className="text-[10px] opacity-50">•••</span>;
    if (message.status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground/50" />;
    return <Check className="w-3.5 h-3.5 text-muted-foreground/50" />;
  };

  return (
    <div className={cn(
      "flex w-full",
      isMe ? "justify-end" : "justify-start",
      isLastInGroup ? "mb-2" : "mb-0.5"
    )}>
      <div className={cn(
        "max-w-[80%] sm:max-w-[70%]",
        !isMe && showAvatar ? "ml-0" : !isMe ? "ml-0" : ""
      )}>
        {/* Sender name for received messages (first in group) */}
        {!isMe && showAvatar && message.sender_profile?.display_name && (
          <p className="text-xs font-semibold text-primary ml-2 mb-0.5">
            {message.sender_profile.display_name}
          </p>
        )}

        <div className={cn(
          "relative px-3 py-1.5 text-[15px] leading-relaxed shadow-sm",
          isMe
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-card border border-border/60 text-card-foreground rounded-2xl rounded-bl-sm",
        )}>
          {/* Text content */}
          {message.message_type === 'text' && (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
              {/* Invisible spacer for timestamp */}
              <span className="inline-block w-16 h-0" />
            </p>
          )}

          {message.message_type === 'image' && message.attachment_url && (
            <div className="rounded-lg overflow-hidden -mx-1 -mt-0.5 mb-1">
              <img src={message.attachment_url} alt="" className="max-w-full" />
            </div>
          )}

          {/* Timestamp + status (floating bottom-right like Signal) */}
          <div className={cn(
            "float-right relative -mb-1 ml-2 mt-1 flex items-center gap-0.5",
            isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"
          )}>
            <span className="text-[10px] leading-none">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {statusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
