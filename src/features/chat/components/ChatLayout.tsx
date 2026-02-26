import React, { useState, useMemo } from 'react';
import { useConversations, useBusinessConversation, useDirectConversation } from '../hooks/useChatQueries';
import { SignalConversationList } from './SignalConversationList';
import { SignalChatWindow } from './SignalChatWindow';
import { NewConversationDialog } from './NewConversationDialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, Pencil, X, MoreVertical, MessageCircle } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';

export const ChatLayout: React.FC = () => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { mutateAsync: createBusinessConv } = useBusinessConversation();
  const { mutateAsync: createDirectConv } = useDirectConversation();

  const activeConversation = conversations.find(c => c.id === activeId);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => {
      const title = c.title || c.business_context?.business_name || '';
      const names = c.participants.map(p => p.profile?.display_name || '').join(' ');
      const last = c.last_message?.content || '';
      return title.toLowerCase().includes(q) || names.toLowerCase().includes(q) || last.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const handleSelectUser = async (userId: string) => {
    try { setActiveId(await createDirectConv(userId)); } catch { toast.error('Erreur de création'); }
  };
  const handleSelectBusiness = async (businessId: string) => {
    try { setActiveId(await createBusinessConv(businessId)); } catch { toast.error('Erreur de création'); }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-primary/50" />
          </div>
          <p className="font-semibold text-foreground text-lg">Messagerie</p>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous pour accéder à vos messages</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full overflow-hidden bg-background">
        {/* List panel */}
        <div className={cn(
          "w-full md:w-[360px] lg:w-[400px] md:border-r border-border flex flex-col bg-background",
          activeId ? "hidden md:flex" : "flex"
        )}>
          {/* Signal-style header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <h1 className="text-primary-foreground font-bold text-xl tracking-tight">Signal</h1>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
                className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              >
                {showSearch
                  ? <X className="w-5 h-5 text-primary-foreground" />
                  : <Search className="w-5 h-5 text-primary-foreground" />
                }
              </button>
              <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
                <MoreVertical className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="px-3 py-2 bg-background border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-9 h-10 bg-muted border-0 rounded-full text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            <SignalConversationList
              conversations={filteredConversations}
              activeId={activeId || undefined}
              onSelect={setActiveId}
              isLoading={isLoading}
            />
          </div>

          {/* FAB - Signal style */}
          <button
            onClick={() => setShowNewConv(true)}
            className="absolute bottom-24 right-5 md:bottom-6 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg z-10 active:scale-95 transition-transform"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <Pencil className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Chat panel */}
        <div className={cn("flex-1 flex flex-col", !activeId ? "hidden md:flex" : "flex")}>
          {activeConversation ? (
            <SignalChatWindow conversation={activeConversation} onBack={() => setActiveId(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/10">
              <div className="w-28 h-28 rounded-full bg-muted/40 flex items-center justify-center mb-5">
                <MessageCircle className="w-14 h-14 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground/80 font-medium">Vos messages</p>
              <p className="text-muted-foreground/50 text-sm mt-1">Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>

      <NewConversationDialog
        open={showNewConv}
        onOpenChange={setShowNewConv}
        onSelectUser={handleSelectUser}
        onSelectBusiness={handleSelectBusiness}
      />
    </>
  );
};
