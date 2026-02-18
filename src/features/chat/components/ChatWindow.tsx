import React from 'react';
import { useMessages, useSendMessage, useMarkAsRead } from '../hooks/useChatQueries';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Conversation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useMessages(conversation.id);
  
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversation.id);
  
  // Activate realtime
  useChatRealtime(conversation.id);

  const { mutate: markAsRead } = useMarkAsRead();

  // Flatten pages - reverse for chronological display (service returns DESC)
  const messages = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flat().reverse();
  }, [data]);

  React.useEffect(() => {
    if (conversation.id && user) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, user, messages.length, markAsRead]);

  // Header Info
  const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
  const title = conversation.title || conversation.business_context?.business_name || otherParticipant?.profile?.display_name || 'Conversation';
  const avatarUrl = conversation.business_context?.logo_url || otherParticipant?.profile?.avatar_url;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          {conversation.business_context && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
              Business
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isFetchingMore={isFetchingNextPage}
      />

      {/* Input */}
      <MessageInput 
        onSendMessage={(content) => sendMessage({ content, message_type: 'text' })} 
        isLoading={isSending}
      />
    </div>
  );
};
