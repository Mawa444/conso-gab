import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MimoConversation } from '@/contexts/MimoChatContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, Mic, Image, FileText, MapPin } from 'lucide-react';

interface ConversationListProps {
  conversations: MimoConversation[];
  activeConversation?: MimoConversation | null;
  onConversationSelect: (conversation: MimoConversation) => void;
  loading?: boolean;
  className?: string;
}

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'audio':
      return <Mic className="w-4 h-4" />;
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'location':
      return <MapPin className="w-4 h-4" />;
    default:
      return null;
  }
};

const getLastMessagePreview = (conversation: MimoConversation): string => {
  if (!conversation.last_message) return 'Aucun message';
  
  const msg = conversation.last_message;
  
  switch (msg.message_type) {
    case 'image':
      return '📷 Photo';
    case 'audio':
      return '🎵 Message vocal';
    case 'document':
      return '📄 Document';
    case 'location':
      return '📍 Position';
    case 'system':
      return msg.content;
    default:
      return msg.content.length > 30 ? `${msg.content.substring(0, 30)}...` : msg.content;
  }
};

const getConversationTitle = (conversation: MimoConversation, currentUserId?: string): string => {
  // Business conversations
  if (conversation.business_context) {
    return conversation.business_context.business_name;
  }
  
  if (conversation.title) return conversation.title;
  
  if (conversation.type === 'group') {
    return `Groupe (${conversation.participants.length} membres)`;
  }
  
  // For private chats, show the other person's name
  const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId);
  return otherParticipant?.profile?.display_name || 'Utilisateur';
};

const getConversationAvatar = (conversation: MimoConversation, currentUserId?: string): string => {
  // Business conversations - use avatar_url enriched by context
  if (conversation.business_context && (conversation as any).avatar_url) {
    return (conversation as any).avatar_url;
  }
  
  if (conversation.type === 'group') {
    return ''; // Group default avatar
  }
  
  const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId);
  return otherParticipant?.profile?.avatar_url || '';
};

const getConversationInitials = (conversation: MimoConversation, currentUserId?: string): string => {
  const title = getConversationTitle(conversation, currentUserId);
  return title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const isBusinessConversation = (conversation: MimoConversation): boolean => {
  return !!conversation.business_context;
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onConversationSelect,
  loading = false,
  className
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-1', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4 animate-shimmer bg-gradient-to-r from-mimo-gray-200 via-mimo-gray-100 to-mimo-gray-200 bg-[length:200px_100%]">
            <div className="w-12 h-12 bg-mimo-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-mimo-gray-300 rounded" />
              <div className="w-1/2 h-3 bg-mimo-gray-300 rounded" />
            </div>
            <div className="w-12 h-3 bg-mimo-gray-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-24 h-24 bg-mimo-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-12 h-12 text-mimo-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-mimo-gray-900 mb-2">
          Aucune conversation
        </h3>
        <p className="text-mimo-gray-500 mb-6 max-w-sm">
          Commencez une nouvelle discussion en touchant le bouton + ci-dessous
        </p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-mimo-gray-100', className)}>
      {conversations.map((conversation) => {
        const isActive = activeConversation?.id === conversation.id;
        const title = getConversationTitle(conversation);
        const avatarUrl = getConversationAvatar(conversation);
        const initials = getConversationInitials(conversation);
        const preview = getLastMessagePreview(conversation);
        const timeAgo = conversation.last_activity 
          ? formatDistanceToNow(new Date(conversation.last_activity), { locale: fr, addSuffix: true })
          : '';

        return (
          <button
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={cn(
              'w-full flex items-center gap-3 p-4',
              'hover:bg-mimo-gray-50 active:bg-mimo-gray-100',
              'transition-colors duration-150',
              'text-left',
              isActive && 'bg-primary-50 border-r-2 border-primary-500'
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className={cn(
                "w-12 h-12",
                isBusinessConversation(conversation) && "ring-2 ring-primary/20"
              )}>
                <AvatarImage src={avatarUrl} alt={title} />
                <AvatarFallback className={cn(
                  "bg-mimo-gray-200 text-mimo-gray-700 font-semibold",
                  isBusinessConversation(conversation) && "bg-gradient-to-br from-primary to-accent text-white"
                )}>
                  {isBusinessConversation(conversation) ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    initials
                  )}
                </AvatarFallback>
              </Avatar>
              
              {/* Online status indicator */}
              {!isBusinessConversation(conversation) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-mimo-success rounded-full border-2 border-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-semibold text-mimo-gray-900 truncate">
                    {title}
                  </h3>
                  {isBusinessConversation(conversation) && (
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5 flex-shrink-0">
                      Business
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-mimo-gray-500 flex-shrink-0 ml-2">
                  {conversation.last_message?.sender_id && (
                    <CheckCheck className="w-4 h-4 text-mimo-blue" />
                  )}
                  <span className="text-xs whitespace-nowrap">
                    {timeAgo}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-mimo-gray-500 truncate">
                  {conversation.last_message && getMessageIcon(conversation.last_message.message_type)}
                  <span className="text-sm truncate">
                    {preview}
                  </span>
                </div>
                
                {conversation.unread_count > 0 && (
                  <Badge 
                    variant="default" 
                    className="bg-mimo-green hover:bg-mimo-green text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center"
                  >
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};