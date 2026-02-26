import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Mic, Send, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const SignalMessageInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = content.trim().length > 0;

  const handleSubmit = () => {
    if (!hasContent || isLoading) return;
    onSendMessage(content.trim());
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-1.5 px-2 py-2 bg-background border-t border-border/40">
      {/* Attachments */}
      <div className="flex items-center gap-0.5 flex-shrink-0 mb-1">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <Paperclip className="w-[22px] h-[22px]" />
        </button>
      </div>

      {/* Input container */}
      <div className="flex-1 flex items-end bg-card border border-border/50 rounded-[22px] px-1 py-0.5 min-h-[44px]">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          <Smile className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-[15px] leading-snug max-h-[120px] py-2 px-1 placeholder:text-muted-foreground/50"
        />
        {!hasContent && (
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Send / Mic button */}
      <button
        onClick={hasContent ? handleSubmit : undefined}
        disabled={isLoading}
        className={cn(
          "w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0 transition-all mb-0.5",
          hasContent
            ? "bg-primary text-primary-foreground active:scale-90"
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
