/**
 * En-tête de conversation - Design Signal-like
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, MoreVertical, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  conversation: Conversation;
  title: string;
  avatarUrl?: string;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  title,
  avatarUrl,
  onBack
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (conversation.business_id) {
      navigate(`/business/${conversation.business_id}`);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-2 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack || (() => navigate('/messaging'))}
          className="h-9 w-9 rounded-full flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Avatar et infos */}
        <div 
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProfile}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                {conversation.business_context ? (
                  <Building2 className="w-4 h-4 text-primary" />
                ) : (
                  title.substring(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            {/* Indicateur en ligne (simulé) */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            <div className="flex items-center gap-1">
              {conversation.business_context && (
                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">
                  Business
                </span>
              )}
              <span className="text-xs text-green-600">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
        >
          <Video className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {conversation.business_context && (
              <DropdownMenuItem onClick={handleViewProfile}>
                Voir le profil
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Rechercher</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Bloquer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
