import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BusinessMessageBubble } from './BusinessMessageBubble';
import { BusinessMessage } from '@/hooks/use-business-conversation';
import { useAuth } from '@/components/auth/AuthProvider';
import { MessageCircle } from 'lucide-react';

interface BusinessChatMessagesProps {
  messages: BusinessMessage[];
  businessLogoUrl?: string;
}

export const BusinessChatMessages: React.FC<BusinessChatMessagesProps> = ({
  messages,
  businessLogoUrl
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Grouper les messages par date
  const groupMessagesByDate = (messages: BusinessMessage[]) => {
    const groups: { [key: string]: BusinessMessage[] } = {};
    
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
          Commencez par dire bonjour ! Cette conversation est privée et sécurisée.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6" ref={scrollRef}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            {/* Séparateur de date */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-muted rounded-full">
                <span className="text-xs text-muted-foreground font-medium">
                  {date}
                </span>
              </div>
            </div>

            {/* Messages de ce jour */}
            {dateMessages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const prevMessage = dateMessages[index - 1];
              const nextMessage = dateMessages[index + 1];
              
              // Déterminer si on doit afficher l'avatar
              const showAvatar = !nextMessage || nextMessage.sender_id !== message.sender_id;
              
              // Déterminer si le message est groupé avec le précédent
              const isGrouped = prevMessage && prevMessage.sender_id === message.sender_id &&
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000;

              return (
                <BusinessMessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isGrouped={isGrouped}
                  businessLogoUrl={businessLogoUrl}
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
