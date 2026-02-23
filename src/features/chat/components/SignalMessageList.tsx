import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { SignalMessageBubble } from './SignalMessageBubble';
import { useAuth } from '@/features/auth';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface Props {
  messages: Message[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

function formatDateSep(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return 'Hier';
  return format(d, 'EEEE d MMMM yyyy', { locale: fr });
}

export const SignalMessageList: React.FC<Props> = ({ messages, isLoading, hasMore, onLoadMore, isFetchingMore }) => {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLengthRef.current && messages.length - prevLengthRef.current < 5) {
      bottomRef.current?.scrollIntoView({ behavior: messages.length <= 50 ? 'auto' : 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isFetchingMore) return;
    if (containerRef.current.scrollTop < 80) onLoadMore?.();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">Envoyez votre premier message</p>
        </div>
      </div>
    );
  }

  const renderDateSep = (dateStr: string) => (
    <div className="flex items-center justify-center py-2 px-3">
      <span className="text-[11px] bg-muted/80 text-muted-foreground px-3 py-1 rounded-full font-medium shadow-sm">
        {formatDateSep(dateStr)}
      </span>
    </div>
  );

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-2">
      {isFetchingMore && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
        </div>
      )}
      {messages.map((msg, i) => {
        const isMine = msg.sender_id === user?.id;
        const prev = messages[i - 1];
        const showDate = !prev || !isSameDay(new Date(msg.created_at), new Date(prev.created_at));
        const showTail = !prev || prev.sender_id !== msg.sender_id || showDate;

        return (
          <React.Fragment key={msg.id}>
            {showDate && renderDateSep(msg.created_at)}
            <SignalMessageBubble message={msg} isMine={isMine} showTail={showTail} />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
