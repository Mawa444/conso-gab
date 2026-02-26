import React from 'react';
import { useMessages, useSendMessage, useMarkAsRead } from '../hooks/useChatQueries';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { SignalMessageList } from './SignalMessageList';
import { SignalMessageInput } from './SignalMessageInput';
import { Conversation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, MoreVertical, Store } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

interface Props {
  conversation: Conversation;
  onBack: () => void;
}

export const SignalChatWindow: React.FC<Props> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversation.id);
  const { mutate: sendMessage, isPending } = useSendMessage(conversation.id);
  const { mutate: markAsRead } = useMarkAsRead();

  useChatRealtime(conversation.id);

  const messages = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flat().reverse();
  }, [data]);

  React.useEffect(() => {
    if (conversation.id && user) markAsRead(conversation.id);
  }, [conversation.id, user, messages.length, markAsRead]);

  const other = conversation.participants.find(p => p.user_id !== user?.id);
  const isBusiness = !!conversation.business_context;
  const title = conversation.title || conversation.business_context?.business_name || other?.profile?.display_name || 'Conversation';
  const subtitle = isBusiness ? (conversation.business_context?.category || 'Entreprise') : undefined;
  const avatarUrl = conversation.business_context?.logo_url || other?.profile?.avatar_url;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-primary flex items-center gap-2 px-1 py-2 shadow-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>

        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold">
              {title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isBusiness && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border-[1.5px] border-primary">
              <Store className="w-2 h-2 text-accent-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 ml-1">
          <h3 className="text-primary-foreground font-semibold text-[15px] truncate leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-primary-foreground/60 text-[11px] leading-tight mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center flex-shrink-0">
          <button className="p-2.5 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <Video className="w-[19px] h-[19px] text-primary-foreground" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <Phone className="w-[18px] h-[18px] text-primary-foreground" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-primary-foreground/10 transition-colors">
            <MoreVertical className="w-[19px] h-[19px] text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Chat wallpaper area */}
      <div className="flex-1 flex flex-col min-h-0 relative" style={{
        backgroundColor: 'hsl(var(--muted) / 0.3)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20.5z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}>
        <SignalMessageList
          messages={messages}
          isLoading={isLoading}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          isFetchingMore={isFetchingNextPage}
        />
      </div>

      <SignalMessageInput
        onSendMessage={(content) => sendMessage({ content, message_type: 'text' })}
        isLoading={isPending}
      />
    </div>
  );
};
