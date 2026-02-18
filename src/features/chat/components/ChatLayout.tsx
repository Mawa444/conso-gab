import React, { useState, useMemo } from 'react';
import { useConversations, useBusinessConversation, useDirectConversation } from '../hooks/useChatQueries';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NewConversationDialog } from './NewConversationDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquarePlus, Search } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';

export const ChatLayout: React.FC = () => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { mutateAsync: createBusinessConv, isPending: creatingBusiness } = useBusinessConversation();
  const { mutateAsync: createDirectConv, isPending: creatingDirect } = useDirectConversation();

  const activeConversation = conversations.find(c => c.id === activeId);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => {
      const title = c.title || c.business_context?.business_name || '';
      const participantNames = c.participants
        .map(p => p.profile?.display_name || '')
        .join(' ');
      const lastMsg = c.last_message?.content || '';
      return title.toLowerCase().includes(q) || 
             participantNames.toLowerCase().includes(q) ||
             lastMsg.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const handleSelectUser = async (userId: string) => {
    try {
      const convId = await createDirectConv(userId);
      setActiveId(convId);
    } catch {
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  const handleSelectBusiness = async (businessId: string) => {
    try {
      const convId = await createBusinessConv(businessId);
      setActiveId(convId);
    } catch {
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="font-medium text-foreground">Connectez-vous pour accéder à la messagerie</p>
          <p className="text-sm text-muted-foreground mt-1">Vous devez être connecté pour envoyer et recevoir des messages</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background border rounded-2xl shadow-sm m-2 sm:m-4">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r bg-card flex flex-col transition-all duration-300",
          activeId ? "hidden md:flex" : "flex"
        )}>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg sm:text-xl">Messages</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowNewConv(true)}
                disabled={creatingBusiness || creatingDirect}
                className="h-9 w-9 rounded-full hover:bg-primary/10"
              >
                <MessageSquarePlus className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="pl-8 h-9 bg-muted/40 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
          
          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList 
              conversations={filteredConversations} 
              activeId={activeId || undefined} 
              onSelect={setActiveId}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-background",
          !activeId ? "hidden md:flex" : "flex"
        )}>
          {activeConversation ? (
            <ChatWindow 
              conversation={activeConversation} 
              onBack={() => setActiveId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-5">
                <span className="text-3xl">💬</span>
              </div>
              <p className="font-semibold text-foreground text-lg">Vos messages</p>
              <p className="text-sm opacity-70 mt-1 mb-4">Envoyez des messages privés à vos contacts</p>
              <Button 
                onClick={() => setShowNewConv(true)}
                className="gap-2 rounded-full px-6"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Nouvelle conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConv}
        onOpenChange={setShowNewConv}
        onSelectUser={handleSelectUser}
        onSelectBusiness={handleSelectBusiness}
      />
    </>
  );
};