import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UnifiedMessage } from '@/types/chat.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, Image as ImageIcon, FileText, Music, Video, MapPin } from 'lucide-react';

interface MessageBubbleProps {
  message: UnifiedMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
  className?: string;
}

const MessageTypeIcon = {
  image: ImageIcon,
  file: FileText,
  audio: Music,
  video: Video,
  location: MapPin
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  isGrouped = false,
  className
}) => {
  const Icon = MessageTypeIcon[message.message_type as keyof typeof MessageTypeIcon];

  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: fr
  });

  const senderName = message.sender_profile?.display_name || 
                     message.sender_profile?.pseudo || 
                     'Inconnu';
  
  const avatarUrl = message.sender_profile?.avatar_url || 
                    message.sender_profile?.profile_picture_url;

  return (
    <div
      className={cn(
        "flex gap-2 items-end transition-all duration-200",
        isOwn ? "flex-row-reverse" : "flex-row",
        isGrouped ? "mt-1" : "mt-4",
        className
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl} alt={senderName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                {senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
          isGrouped && (isOwn ? "rounded-br-2xl" : "rounded-bl-2xl")
        )}
      >
        {/* Message type icon for non-text messages */}
        {message.message_type !== 'text' && Icon && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/10">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">
              {message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}
            </span>
          </div>
        )}

        {/* Image */}
        {message.message_type === 'image' && message.attachment_url && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img
              src={message.attachment_url}
              alt="Image"
              className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.attachment_url, '_blank')}
            />
          </div>
        )}

        {/* File/Audio/Video */}
        {(message.message_type === 'file' || message.message_type === 'audio' || message.message_type === 'video') && message.attachment_url && (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 p-2 rounded bg-black/5 hover:bg-black/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs truncate">Voir le fichier</span>
            </div>
          </a>
        )}

        {/* Location */}
        {message.message_type === 'location' && (
          <div className="flex items-center gap-2 mb-2 p-2 rounded bg-black/5">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Position partagée</span>
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Footer: time + status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span className={cn(
            "text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timeAgo}
          </span>
          
          {/* Checkmarks for sent messages */}
          {isOwn && (
            <div className="flex items-center">
              {message.status === 'sent' && (
                <Check className="w-3 h-3 text-primary-foreground/70" />
              )}
              {message.status === 'delivered' && (
                <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
              )}
              {message.status === 'read' && (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for right side */}
      {isOwn && <div className="w-8 flex-shrink-0" />}
    </div>
  );
};
