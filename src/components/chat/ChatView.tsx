import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { WhatsAppRedirectButton } from '@/components/business-chat/WhatsAppRedirectButton';
import { useMimoChat } from '@/contexts/MimoChatContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatViewProps {
  conversationId: string;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversationId,
  showActions = false,
  compact = false,
  className
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loading,
    sendMessage,
    setActiveConversation,
    conversations,
    createBusinessConversation
  } = useMimoChat();

  // Load or create conversation
  React.useEffect(() => {
    const initConversation = async () => {
      if (!conversationId || !user) return;

      // Check if conversation already exists
      let conversation = conversations.find(c => c.id === conversationId);
      
      // If not found, it might be a businessId - try to create/find business conversation
      if (!conversation) {
        const businessConversation = conversations.find(
          c => c.origin_type === 'business' && c.origin_id === conversationId
        );
        
        if (businessConversation) {
          conversation = businessConversation;
        } else {
          // Try to create new business conversation
          const newConv = await createBusinessConversation(conversationId);
          if (newConv) {
            conversation = newConv as any;
          }
        }
      }

      if (conversation && (!activeConversation || activeConversation.id !== conversation.id)) {
        setActiveConversation(conversation);
      }
    };

    initConversation();
  }, [conversationId, user, activeConversation, conversations, setActiveConversation, createBusinessConversation]);

  const handleSendMessage = async (content: string, type?: any, attachmentUrl?: string) => {
    await sendMessage(content, type || 'text');
  };

  const handleOpenInMimoChat = () => {
    navigate(`/mimo-chat/conversation/${conversationId}`);
  };

  if (loading && !activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de la conversation...</p>
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger la conversation. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const whatsappNumber = activeConversation.business_context?.whatsapp;
  const businessName = activeConversation.business_context?.business_name || activeConversation.title;

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Quick actions bar */}
      {showActions && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card flex items-center gap-2">
          {whatsappNumber && (
            <WhatsAppRedirectButton
              phoneNumber={whatsappNumber}
              businessName={businessName}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInMimoChat}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ouvrir dans Mimo Chat
          </Button>
        </div>
      )}

      {/* Messages area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          isLoading={loading}
        />
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </div>
    </div>
  );
};
