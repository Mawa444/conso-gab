import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { SignalMessageBubble } from './SignalMessageBubble';
import { useAuth } from '@/features/auth';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  messages: Message[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

export const SignalMessageList: React.FC<Props> = ({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingMore,
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isFetchingMore || !hasMore || !topRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore?.();
      },
      { root: scrollRef.current, rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [isLoading, isFetchingMore, hasMore, onLoadMore]);

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current && autoScroll) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAutoScroll(Math.abs(scrollHeight - clientHeight - scrollTop) < 80);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm font-medium">Aucun message</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Envoyez le premier message !</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3 py-2"
      onScroll={handleScroll}
    >
      <div ref={topRef} className="h-2" />
      {isFetchingMore && (
        <div className="flex justify-center py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        </div>
      )}

      {messages.map((msg, index) => {
        const isMe = msg.sender_id === user?.id;
        const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender_id !== msg.sender_id;

        // Date separator
        let showDateSep = false;
        if (index === 0) {
          showDateSep = true;
        } else {
          const prev = new Date(messages[index - 1].created_at);
          const curr = new Date(msg.created_at);
          showDateSep = !isSameDay(prev, curr);
        }

        return (
          <React.Fragment key={msg.id}>
            {showDateSep && (
              <div className="flex justify-center my-3">
                <span className="text-[11px] text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-border/50 font-medium">
                  {formatDateSeparator(msg.created_at)}
                </span>
              </div>
            )}
            <SignalMessageBubble
              message={msg}
              isMe={isMe}
              showAvatar={showAvatar}
              isLastInGroup={isLastInGroup}
            />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
