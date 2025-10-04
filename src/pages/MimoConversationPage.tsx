import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MimoChatProvider, useMimoChat } from '@/contexts/MimoChatContext';
import { MimoChatLayout } from '@/components/mimo-chat/layout/MimoChatLayout';
import { MessageBubble } from '@/components/mimo-chat/components/MessageBubble';
import { MessageComposer } from '@/components/mimo-chat/components/MessageComposer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Phone, Video, Info } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const MimoConversationPageContent: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loading,
    sendMessage,
    setActiveConversation,
    subscribeToConversation,
    unsubscribeFromConversation,
    conversations
  } = useMimoChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
        subscribeToConversation(conversationId);
      }
    }

    return () => {
      unsubscribeFromConversation();
    };
  }, [conversationId, conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string, type = 'text') => {
    sendMessage(content, type);
  };

  const handleBack = () => {
    setActiveConversation(null);
    navigate('/mimo-chat');
  };

  const getConversationTitle = () => {
    if (!activeConversation) return 'Conversation';
    
    if (activeConversation.title) return activeConversation.title;
    
    if (activeConversation.type === 'group') {
      return `Groupe (${activeConversation.participants.length} membres)`;
    }
    
    // For private chats, show the other person's name
    const otherParticipant = activeConversation.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.profile?.display_name || 'Utilisateur';
  };

  const getConversationSubtitle = () => {
    if (!activeConversation) return '';
    
    if (activeConversation.type === 'group') {
      const names = activeConversation.participants
        .filter(p => p.user_id !== user?.id)
        .map(p => p.profile?.display_name || 'Utilisateur')
        .slice(0, 3)
        .join(', ');
      
      const remaining = activeConversation.participants.length - 3;
      return remaining > 0 ? `${names} et ${remaining} autres` : names;
    }
    
    return 'En ligne'; // Could be dynamic based on presence
  };

  const groupMessages = (messages: any[]) => {
    const grouped: any[] = [];
    
    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];
      
      const isSameSender = prevMessage?.sender_id === message.sender_id;
      const isNextSameSender = nextMessage?.sender_id === message.sender_id;
      
      const timeDiff = prevMessage ? 
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() : 
        Infinity;
      
      const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000; // 5 minutes
      
      grouped.push({
        ...message,
        showAvatar: !isGrouped || !isNextSameSender,
        groupedWithPrevious: isGrouped,
        groupedWithNext: isNextSameSender && timeDiff < 5 * 60 * 1000
      });
    });
    
    return grouped;
  };

  if (loading && !activeConversation) {
    return (
      <MimoChatLayout
        title="Chargement..."
        showBackButton
        onBack={handleBack}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Chargement de la conversation...</div>
        </div>
      </MimoChatLayout>
    );
  }

  if (!activeConversation) {
    return (
      <MimoChatLayout
        title="Conversation introuvable"
        showBackButton
        onBack={handleBack}
      >
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Conversation introuvable
            </h3>
            <p className="text-muted-foreground">
              Cette conversation n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </MimoChatLayout>
    );
  }

  const groupedMessages = groupMessages(messages);

  return (
    <MimoChatLayout
      title={getConversationTitle()}
      subtitle={getConversationSubtitle()}
      showBackButton
      onBack={handleBack}
      rightElement={
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted rounded-full"
          >
            <Video className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted rounded-full"
          >
            <Phone className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted rounded-full"
          >
            <Info className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="py-4 space-y-1">
            {groupedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                showAvatar={message.showAvatar}
                groupedWithNext={message.groupedWithNext}
                groupedWithPrevious={message.groupedWithPrevious}
              />
            ))}
            
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  💬
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Début de la conversation
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Commencez par dire bonjour ! 👋
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Composer */}
        <MessageComposer
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </div>
    </MimoChatLayout>
  );
};

export const MimoConversationPage: React.FC = () => {
  return (
    <MimoChatProvider>
      <MimoConversationPageContent />
    </MimoChatProvider>
  );
};

export default MimoConversationPage;