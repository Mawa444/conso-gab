import React from "react";
import { Conversation } from "@/types/messaging-advanced";
import { ConversationDetailsNew } from "../ConversationDetailsNew";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useMessagingContext } from "../UniversalMessagingOS";

interface ConversationViewerProps {
  conversation: Conversation;
  onClose: () => void;
}

export const ConversationViewer: React.FC<ConversationViewerProps> = ({
  conversation,
  onClose
}) => {
  const { isFullScreen, setIsFullScreen } = useMessagingContext();

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Header de la conversation */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-accent/20"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <h2 className="font-semibold">
            {conversation.business_profile?.business_name || 'Conversation'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {conversation.conversation_type === 'order' && 'Commande'}
            {conversation.conversation_type === 'quote' && 'Devis'}
            {conversation.conversation_type === 'reservation' && 'Réservation'}
            {conversation.conversation_type === 'support' && 'Support'}
            {conversation.conversation_type === 'direct' && 'Discussion'}
            {conversation.conversation_type === 'group' && 'Groupe'}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="hover:bg-accent/20"
        >
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Contenu de la conversation */}
      <div className="flex-1 overflow-hidden">
        <ConversationDetailsNew
          conversationId={conversation.id}
          onBack={onClose}
        />
      </div>
    </div>
  );
};