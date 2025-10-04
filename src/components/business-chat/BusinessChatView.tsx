import React from 'react';
import { useBusinessConversation } from '@/hooks/use-business-conversation';
import { BusinessChatHeader } from './BusinessChatHeader';
import { BusinessChatMessages } from './BusinessChatMessages';
import { BusinessChatInput } from './BusinessChatInput';
import { WhatsAppRedirectButton } from './WhatsAppRedirectButton';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
      {/* Header */}
      <BusinessChatHeader
        businessName={businessName || conversation.title}
        businessLogoUrl={businessLogoUrl}
        isOnline={true} // TODO: Implémenter la détection de présence
      />

      {/* Bouton WhatsApp si disponible */}
      {whatsappNumber && (
        <div className="px-4 py-2 border-b border-border">
          <WhatsAppRedirectButton
            phoneNumber={whatsappNumber}
            businessName={businessName || conversation.title}
          />
        </div>
      )}

      {/* Zone de messages */}
      <div className="flex-1 overflow-hidden">
        <BusinessChatMessages
          messages={messages}
          businessLogoUrl={businessLogoUrl}
        />
      </div>

      {/* Input de message */}
      <BusinessChatInput
        onSendMessage={sendMessage}
        disabled={isSending}
        businessId={businessId}
      />
    </div>
  );
};
