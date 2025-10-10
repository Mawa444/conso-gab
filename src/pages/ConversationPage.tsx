import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessagingProvider, useMessaging } from '@/contexts/MessagingContext';
import { ChatWindow } from '@/components/mimo-chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ConversationPageContent: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { setActiveConversation, conversations } = useMessaging();

  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  if (!conversationId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Conversation introuvable</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Back Button */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messaging')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow conversationId={conversationId} />
      </div>
    </div>
  );
};

export const ConversationPage: React.FC = () => {
  return (
    <MessagingProvider>
      <ConversationPageContent />
    </MessagingProvider>
  );
};

export default ConversationPage;
