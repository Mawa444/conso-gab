import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessagingProvider, useMessaging } from '@/contexts/MessagingContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Edit, MoreVertical, Archive, MessageSquarePlus, Video } from 'lucide-react';
// VideoCallButton removed - integrated in ChatWindow
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useProfileMode } from '@/hooks/use-profile-mode';

const MessagingPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useMessaging();
  const { currentMode, currentBusinessId } = useProfileMode();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messaging/${conversationId}`);
  };

  const getConversationTitle = (conversation: any) => {
    if (conversation.title) return conversation.title;
    if (conversation.business_context?.business_name) return conversation.business_context.business_name;
    return 'Conversation';
  };

  const getConversationAvatar = (conversation: any) => {
    if (conversation.business_context?.logo_url) return conversation.business_context.logo_url;
    return conversation.participants?.[0]?.profile?.avatar_url;
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header - Signal Style */}
      <div className="flex-shrink-0 border-b border-border bg-card z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentMode === 'business' && currentBusinessId) {
                navigate(`/business/${currentBusinessId}/dashboard`);
              } else {
                navigate('/');
              }
            }}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Conversations</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
            <MessageSquarePlus className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
            <p className="text-sm text-muted-foreground">
              Commencez une nouvelle conversation en visitant un profil business
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => {
              const title = getConversationTitle(conversation);
              const avatar = getConversationAvatar(conversation);
              const lastMessage = conversation.last_message;
              const timeAgo = lastMessage?.created_at 
                ? formatDistanceToNow(new Date(lastMessage.created_at), { 
                    addSuffix: false, 
                    locale: fr 
                  })
                : '';

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                    conversation.unread_count > 0 && "bg-muted/30"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={avatar} alt={title} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={cn(
                        "font-semibold truncate",
                        conversation.unread_count > 0 && "text-foreground"
                      )}>
                        {title}
                      </span>
                      {conversation.business_context && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          Business
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate flex-1",
                        conversation.unread_count > 0 
                          ? "text-foreground font-medium" 
                          : "text-muted-foreground"
                      )}>
                        {lastMessage?.content || 'Aucun message'}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* FAB - New Conversation */}
      <Button
        size="icon"
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg"
        onClick={() => {
          // TODO: Implement new conversation creation
        }}
      >
        <Edit className="w-6 h-6" />
      </Button>
    </div>
  );
};

export const MessagingPage: React.FC = () => {
  return (
    <MessagingProvider>
      <MessagingPageContent />
    </MessagingProvider>
  );
};

export default MessagingPage;
