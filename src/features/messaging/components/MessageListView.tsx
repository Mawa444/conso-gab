/**
 * Liste des messages avec scroll infini
 */

import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { MessageBubbleView } from './MessageBubbleView';
import { useAuth } from '@/features/auth';
import { Loader2 } from 'lucide-react';

interface MessageListViewProps {
  messages: Message[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

export const MessageListView: React.FC<MessageListViewProps> = ({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingMore
}) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Observer pour le scroll infini
  useEffect(() => {
    if (isLoading || isFetchingMore || !hasMore || !topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          onLoadMore?.();
        }
      },
      { root: containerRef.current, rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [isLoading, isFetchingMore, hasMore, onLoadMore]);

  // Auto-scroll quand nouveaux messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, shouldAutoScroll]);

  // Scroll initial
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isLoading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - clientHeight - scrollTop < 100;
    setShouldAutoScroll(isAtBottom);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <p className="font-medium">Aucun message</p>
        <p className="text-sm mt-1">Envoyez le premier message pour démarrer la conversation</p>
      </div>
    );
  }

  // Grouper les messages par date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden py-4 scroll-smooth"
      style={{ 
        background: 'linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, transparent 100%)'
      }}
      onScroll={handleScroll}
    >
      {/* Sentinel pour le scroll infini */}
      <div ref={topSentinelRef} className="h-1 w-full" />

      {isFetchingMore && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Messages groupés par date */}
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Séparateur de date */}
          <div className="flex items-center justify-center my-4">
            <span className="text-xs text-muted-foreground bg-muted/80 px-3 py-1 rounded-full">
              {date}
            </span>
          </div>

          {/* Messages */}
          {msgs.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            const prevMsg = msgs[index - 1];
            const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
            const showName = !isMe && showAvatar && msgs.length > 1;

            return (
              <MessageBubbleView
                key={msg.id}
                message={msg}
                isMe={isMe}
                showAvatar={showAvatar}
                showName={showName}
              />
            );
          })}
        </div>
      ))}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

// Helper pour grouper les messages par date
function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Hier';
    } else {
      dateKey = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(msg);
  });

  return groups;
}
