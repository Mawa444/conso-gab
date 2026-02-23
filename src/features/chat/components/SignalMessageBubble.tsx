import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
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
      case 'sending': return <div className="w-3 h-3 rounded-full border-2 border-primary-foreground/40 border-t-transparent animate-spin" />;
      case 'sent': return <Check className="w-3.5 h-3.5 text-primary-foreground/50" />;
      case 'delivered': return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/50" />;
      case 'read': return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/80" />;
      default: return <Check className="w-3.5 h-3.5 text-primary-foreground/50" />;
    }
  };

  return (
    <div className={cn("flex mb-0.5 px-3", isMine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "relative max-w-[80%] px-3 py-1.5 rounded-xl shadow-sm",
        isMine
          ? "bg-primary text-primary-foreground rounded-br-sm"
          : "bg-card text-card-foreground border border-border/50 rounded-bl-sm",
        showTail && (isMine ? "rounded-br-xl mt-1.5" : "rounded-bl-xl mt-1.5")
      )}>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={cn(
          "flex items-center gap-1 justify-end mt-0.5 -mb-0.5",
          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <span className="text-[10px]">{time}</span>
          {statusIcon()}
        </div>
      </div>
    </div>
  );
};
