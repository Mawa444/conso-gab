import React from 'react';
import { useMessages, useSendMessage, useMarkAsRead } from '../hooks/useChatQueries';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { SignalMessageList } from './SignalMessageList';
import { SignalMessageInput } from './SignalMessageInput';
import { Conversation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useAuth } from '@/features/auth';

interface Props {
  conversation: Conversation;
  onBack: () => void;
}

export const SignalChatWindow: React.FC<Props> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMessages(conversation.id);

  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversation.id);

  useChatRealtime(conversation.id);

  const { mutate: markAsRead } = useMarkAsRead();

  const messages = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flat().reverse();
  }, [data]);

  React.useEffect(() => {
    if (conversation.id && user) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, user, messages.length, markAsRead]);

  const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
  const title = conversation.title || conversation.business_context?.business_name || otherParticipant?.profile?.display_name || 'Conversation';
  const avatarUrl = conversation.business_context?.logo_url || otherParticipant?.profile?.avatar_url;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Signal-style Header */}
      <div className="bg-primary flex items-center gap-2 px-2 py-2.5 shadow-sm">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* Avatar */}
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">
            {title.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <div className="flex-1 min-w-0 ml-1">
          <h3 className="text-primary-foreground font-semibold text-[15px] truncate leading-tight">
            {title}
          </h3>
          {conversation.business_context && (
            <p className="text-primary-foreground/70 text-[11px] leading-tight">
              {conversation.business_context.category || 'Business'}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <Video className="w-5 h-5 text-primary-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <MoreVertical className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Chat wallpaper background */}
      <div className="flex-1 flex flex-col min-h-0 bg-[hsl(var(--muted))]/30 relative">
        {/* Subtle wallpaper pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <SignalMessageList
          messages={messages}
          isLoading={isLoading}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          isFetchingMore={isFetchingNextPage}
        />
      </div>

      {/* Input */}
      <SignalMessageInput
        onSendMessage={(content) => sendMessage({ content, message_type: 'text' })}
        isLoading={isSending}
      />
    </div>
  );
};
