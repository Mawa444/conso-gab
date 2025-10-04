import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { UnifiedMessage } from '@/types/chat.types';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: UnifiedMessage[];
  currentUserId?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  emptyMessage = "Commencez par dire bonjour ! Cette conversation est privée et sécurisée.",
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupMessagesByDate = (messages: UnifiedMessage[]) => {
    const groups: { [key: string]: UnifiedMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Début de la conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6" ref={scrollRef}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-muted rounded-full">
                <span className="text-xs text-muted-foreground font-medium">
                  {date}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const prevMessage = dateMessages[index - 1];
              const nextMessage = dateMessages[index + 1];
              
              const showAvatar = !nextMessage || nextMessage.sender_id !== message.sender_id;
              
              const isGrouped = prevMessage && prevMessage.sender_id === message.sender_id &&
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isGrouped={isGrouped}
                />
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
