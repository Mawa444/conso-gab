import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessagingProvider, useMessaging } from '@/contexts/MessagingContext';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfileMode } from '@/hooks/use-profile-mode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ConversationPageContent: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMode, currentBusinessId } = useProfileMode();
  const {
    activeConversation,
    messages,
    loading,
    sendMessage,
    setActiveConversation,
    fetchMessages,
    markAsRead,
    subscribeToConversation,
    unsubscribeFromConversation,
    conversations
  } = useMessaging();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const loadConversation = async () => {
      // Chercher la conversation dans celles déjà chargées
      let conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        setActiveConversation(conversation);
      }

      // Charger les messages
      await fetchMessages(conversationId);
      
      // Marquer comme lu
      await markAsRead(conversationId);

      // S'abonner aux mises à jour temps réel
      subscribeToConversation(conversationId);
    };

    loadConversation();

    return () => {
      unsubscribeFromConversation();
    };
  }, [conversationId, user, conversations, setActiveConversation, fetchMessages, markAsRead, subscribeToConversation, unsubscribeFromConversation]);

  // Auto-scroll to bottom on new messages - debounced to prevent input blocking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages.length]); // Only trigger on message count change, not content

  const handleSendMessage = async (content: string, type?: any, attachmentUrl?: string) => {
    await sendMessage(content, type || 'text');
  };

  const handleBack = () => {
    setActiveConversation(null);
    navigate('/messaging');
  };

  const handleBackToHome = () => {
    if (currentMode === 'business' && currentBusinessId) {
      navigate(`/business/${currentBusinessId}/dashboard`);
    } else {
      navigate('/');
    }
  };

  if (!activeConversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const conversationTitle = activeConversation.title || 
    activeConversation.business_context?.business_name || 
    'Conversation';
  
  const conversationAvatar = activeConversation.business_context?.logo_url || 
    activeConversation.participants?.[0]?.profile?.avatar_url;

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header - Signal Style */}
      <div className="flex-shrink-0 border-b border-border bg-card z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Avatar & Title */}
          <button 
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            onClick={() => {
              if (activeConversation.business_context?.business_id) {
                navigate(`/business/${activeConversation.business_context.business_id}`);
              }
            }}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={conversationAvatar} alt={conversationTitle} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {conversationTitle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate">{conversationTitle}</h2>
                {activeConversation.business_context && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Business
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeConversation.participants?.length || 2} participants
              </p>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {activeConversation.business_context?.phone && (
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuItem>Rechercher</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Supprimer la conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-background">
        <div className="p-4 space-y-6">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Chargement des messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Début de la conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Envoyez votre premier message pour démarrer la conversation
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-2">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-muted rounded-full">
                    <span className="text-xs text-muted-foreground font-medium">
                      {date}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                {dateMessages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const prevMessage = dateMessages[index - 1];
                  const nextMessage = dateMessages[index + 1];
                  
                  const showAvatar = !nextMessage || nextMessage.sender_id !== message.sender_id;
                  const isGrouped = prevMessage && prevMessage.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      isGrouped={isGrouped}
                    />
                  );
                })}
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-border bg-card z-20">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading}
          placeholder="Message"
        />
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
