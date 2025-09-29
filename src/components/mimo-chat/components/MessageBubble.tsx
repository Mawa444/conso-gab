import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MimoMessage } from '@/contexts/MimoChatContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, MoreVertical, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: MimoMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
  groupedWithNext?: boolean;
  groupedWithPrevious?: boolean;
  onReply?: (message: MimoMessage) => void;
  onLongPress?: (message: MimoMessage) => void;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTime = false,
  groupedWithNext = false,
  groupedWithPrevious = false,
  onReply,
  onLongPress,
  className
}) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const getBubbleRadius = () => {
    if (isOwn) {
      return cn(
        'rounded-tl-bubble rounded-bl-bubble',
        groupedWithPrevious ? 'rounded-tr-bubble-sm' : 'rounded-tr-bubble',
        groupedWithNext ? 'rounded-br-bubble-sm' : 'rounded-br-bubble'
      );
    } else {
      return cn(
        'rounded-tr-bubble rounded-br-bubble',
        groupedWithPrevious ? 'rounded-tl-bubble-sm' : 'rounded-tl-bubble',
        groupedWithNext ? 'rounded-bl-bubble-sm' : 'rounded-bl-bubble'
      );
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.attachment_url} 
              alt="Image partagée"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-r-0 border-t-[3px] border-b-[3px] border-l-current border-t-transparent border-b-transparent" />
            </div>
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div className="h-full w-1/3 bg-white rounded-full" />
            </div>
            <span className="text-xs opacity-70">0:15</span>
          </div>
        );

      case 'document':
        return (
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg min-w-[200px]">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              📄
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{message.content}</p>
              <p className="text-xs opacity-70">Document • PDF</p>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-2">
            <div className="w-full h-32 bg-white/10 rounded-lg flex items-center justify-center">
              📍 Position partagée
            </div>
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className={cn(
      'flex gap-2 mb-1 animate-message-slide',
      isOwn ? 'justify-end' : 'justify-start',
      className
    )}>
      {/* Avatar (for incoming messages) */}
      {!isOwn && showAvatar && (
        <Avatar className="w-8 h-8 mt-auto">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback className="bg-mimo-gray-200 text-mimo-gray-700 text-xs">
            {message.sender_profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for grouped messages */}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message content */}
      <div className={cn(
        'max-w-[75%] group relative',
        isOwn && 'order-first'
      )}>
        {/* Reply indicator */}
        {message.reply_to_message_id && (
          <div className="mb-1 px-3 py-1 bg-mimo-gray-100 rounded-lg text-xs text-mimo-gray-600 border-l-2 border-primary-500">
            Réponse à un message
          </div>
        )}

        {/* Sender name (for group chats) */}
        {!isOwn && !groupedWithPrevious && (
          <p className="text-xs font-medium text-primary-600 mb-1 px-1">
            {message.sender_profile?.display_name || 'Inconnu'}
          </p>
        )}

        {/* Message bubble */}
        <div className={cn(
          'px-4 py-2 relative',
          getBubbleRadius(),
          isOwn
            ? 'bg-mimo-outgoing text-white'
            : 'bg-white border border-mimo-gray-200 text-mimo-gray-900'
        )}>
          {renderMessageContent()}

          {/* Message status and time */}
          <div className={cn(
            'flex items-center gap-1 mt-1 justify-end',
            isOwn ? 'text-white/70' : 'text-mimo-gray-500'
          )}>
            <span className="text-xs">
              {formatTime(message.created_at)}
            </span>
            
            {isOwn && (
              <div className="flex">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Message actions (show on hover) */}
          <div className="absolute -top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(message)}
                className="h-6 w-6 p-0 bg-white shadow-mimo-4 hover:bg-mimo-gray-50"
              >
                <Reply className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLongPress?.(message)}
              className="h-6 w-6 p-0 bg-white shadow-mimo-4 hover:bg-mimo-gray-50"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for outgoing messages */}
      {isOwn && <div className="w-8" />}
    </div>
  );
};