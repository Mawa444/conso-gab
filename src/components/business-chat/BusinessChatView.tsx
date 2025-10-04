import React from 'react';
import { useBusinessConversation } from '@/hooks/use-business-conversation';
import { BusinessChatHeader } from './BusinessChatHeader';
import { BusinessChatMessages } from './BusinessChatMessages';
import { BusinessChatInput } from './BusinessChatInput';
import { WhatsAppRedirectButton } from './WhatsAppRedirectButton';
import { Loader2, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessChatViewProps {
  businessId: string;
  businessName?: string;
  businessLogoUrl?: string;
  whatsappNumber?: string;
}

/**
 * Composant principal pour afficher le chat avec un business
 * Garantit l'isolation complète : une conversation unique par paire (user, business)
 */
export const BusinessChatView: React.FC<BusinessChatViewProps> = ({
  businessId,
  businessName,
  businessLogoUrl,
  whatsappNumber
}) => {
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage
  } = useBusinessConversation(businessId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de la conversation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Impossible de charger la conversation. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Boutons d'actions rapides */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card flex items-center gap-2">
        {whatsappNumber && (
          <WhatsAppRedirectButton
            phoneNumber={whatsappNumber}
            businessName={businessName || conversation.title}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Redirection vers Mimo Chat avec cette conversation
            window.location.href = `/mimo-chat/conversation/${conversation.id}`;
          }}
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Ouvrir dans Mimo Chat
        </Button>
      </div>

      {/* Zone de messages - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <BusinessChatMessages
          messages={messages}
          businessLogoUrl={businessLogoUrl}
        />
      </div>

      {/* Input de message - Fixé en bas */}
      <div className="flex-shrink-0 border-t border-border bg-card">
        <BusinessChatInput
          onSendMessage={sendMessage}
          disabled={isSending}
          businessId={businessId}
        />
      </div>
    </div>
  );
};
