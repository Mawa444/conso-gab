import React, { useState } from 'react';
import { Paperclip, Smile, Mic, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const SignalMessageInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [content, setContent] = useState('');
  const hasContent = content.trim().length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hasContent || isLoading) return;
    onSendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 px-2 py-2 bg-background border-t border-border/50">
      {/* Attach button */}
      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Text input area */}
      <div className="flex-1 flex items-end bg-muted/50 border border-border/50 rounded-3xl px-4 py-2 min-h-[44px]">
        <button className="text-muted-foreground hover:text-foreground transition-colors mr-2 flex-shrink-0 mb-0.5">
          <Smile className="w-5 h-5" />
        </button>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message Signal"
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-[15px] leading-snug max-h-[120px] py-0.5 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Send / Mic button */}
      <button
        onClick={hasContent ? handleSubmit : undefined}
        disabled={isLoading}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
          hasContent
            ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg active:scale-95"
            : "bg-primary/80 text-primary-foreground"
        )}
      >
        {hasContent ? (
          <Send className="w-5 h-5 ml-0.5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
