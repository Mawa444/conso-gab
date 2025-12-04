import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  hasMore, 
  onLoadMore, 
  isFetchingMore 
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  // Setup observer for infinite scroll
  useEffect(() => {
    if (isLoading || isFetchingMore || !hasMore) return;

    const options = {
      root: scrollRef.current,
      rootMargin: '20px',
      threshold: 0.1
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        // Save current scroll height to restore position after load
        if (scrollRef.current) {
           // Logic handled in parent or by layout shift, but simple approach:
           onLoadMore?.();
        }
      }
    }, options);

    if (topRef.current) {
      observer.current.observe(topRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, isFetchingMore, hasMore, onLoadMore]);

  // Auto-scroll to bottom on new messages if we were at bottom
  useEffect(() => {
    if (bottomRef.current && shouldAutoScroll) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // If user scrolls up, disable auto-scroll
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShouldAutoScroll(isAtBottom);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
        <p>Aucun message pour le moment.</p>
        <p className="text-sm">Envoyez le premier message !</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" onScrollCapture={handleScroll} ref={scrollRef}>
      <div className="flex flex-col justify-end min-h-full">
        <div ref={topRef} className="h-4 w-full" />
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user?.id;
          const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);
          
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMe={isMe} 
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
