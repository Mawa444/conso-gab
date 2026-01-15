/**
 * Bulle de message - Design Signal-like
 */

import React from 'react';
import { Message } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export const MessageBubbleView: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showAvatar = true,
  showName = false
}) => {
  const StatusIcon = () => {
    if (!isMe) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      default:
        return <Check className="w-3 h-3" />;
    }
  };

  return (
    <div className={cn(
      "flex w-full gap-2 mb-1 px-2",
      isMe ? "justify-end" : "justify-start"
    )}>
      {/* Avatar (uniquement pour les autres) */}
      {!isMe && showAvatar && (
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback className="text-xs bg-muted">
            {message.sender_profile?.display_name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Espace pour aligner quand pas d'avatar */}
      {!isMe && !showAvatar && <div className="w-8 flex-shrink-0" />}

      {/* Bulle de message */}
      <div className={cn(
        "flex flex-col max-w-[80%] sm:max-w-[70%]",
        isMe ? "items-end" : "items-start"
      )}>
        {/* Nom de l'expéditeur */}
        {!isMe && showName && message.sender_profile?.display_name && (
          <span className="text-xs text-muted-foreground ml-2 mb-0.5">
            {message.sender_profile.display_name}
          </span>
        )}

        {/* Contenu du message */}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm shadow-sm relative",
            isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {/* Texte */}
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Image */}
          {message.type === 'image' && message.attachment_url && (
            <div className="rounded-lg overflow-hidden my-1 max-w-[240px]">
              <img
                src={message.attachment_url}
                alt="Image"
                className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment_url, '_blank')}
              />
            </div>
          )}

          {/* Fichier */}
          {message.type === 'file' && message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline"
            >
              📎 {message.attachment_name || 'Fichier'}
            </a>
          )}

          {/* Timestamp et statut */}
          <div className={cn(
            "flex items-center gap-1 text-[10px] mt-1",
            isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
          )}>
            <span>{format(new Date(message.created_at), 'HH:mm', { locale: fr })}</span>
            <StatusIcon />
          </div>
        </div>
      </div>
    </div>
  );
};
