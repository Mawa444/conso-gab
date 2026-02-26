import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  message: Message;
  isMine: boolean;
  showTail: boolean;
}

export const SignalMessageBubble: React.FC<Props> = ({ message, isMine, showTail }) => {
  const time = format(new Date(message.created_at), 'HH:mm');

  const statusIcon = () => {
    if (!isMine) return null;
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-primary-foreground/40" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-primary-foreground/50" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/50" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/80" />;
      default:
        return <Check className="w-3.5 h-3.5 text-primary-foreground/50" />;
    }
  };

  // Calculate if the message is short enough to inline the timestamp
  const isShort = message.content.length < 28;

  return (
    <div className={cn(
      "flex px-3",
      isMine ? "justify-end" : "justify-start",
      showTail ? "mt-2" : "mt-0.5"
    )}>
      <div className={cn(
        "relative max-w-[82%] px-3 py-[7px] shadow-sm",
        isMine
          ? "bg-primary text-primary-foreground"
          : "bg-card text-card-foreground border border-border/40",
        // Tail styling
        showTail
          ? isMine
            ? "rounded-2xl rounded-tr-sm"
            : "rounded-2xl rounded-tl-sm"
          : "rounded-2xl"
      )}>
        <div className={cn(isShort ? "flex items-end gap-2" : "")}>
          <p className="text-[15px] leading-[1.35] whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <span className={cn(
            "flex items-center gap-0.5 flex-shrink-0",
            isShort ? "ml-1" : "float-right ml-2 mt-1",
            isMine ? "text-primary-foreground/50" : "text-muted-foreground/70"
          )}>
            <span className="text-[10px] leading-none tabular-nums">{time}</span>
            {statusIcon()}
          </span>
        </div>
      </div>
    </div>
  );
};
