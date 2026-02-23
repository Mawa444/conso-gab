import React, { useState, useMemo } from 'react';
import { useConversations, useBusinessConversation, useDirectConversation } from '../hooks/useChatQueries';
import { SignalConversationList } from './SignalConversationList';
import { SignalChatWindow } from './SignalChatWindow';
import { NewConversationDialog } from './NewConversationDialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, Pencil, X } from 'lucide-react';
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
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="font-semibold text-foreground">Connectez-vous</p>
          <p className="text-sm text-muted-foreground mt-1">pour accéder à la messagerie</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full overflow-hidden bg-background">
        {/* List panel */}
        <div className={cn(
          "w-full md:w-[340px] lg:w-[380px] md:border-r border-border flex flex-col bg-background",
          activeId ? "hidden md:flex" : "flex"
        )}>
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <h1 className="text-primary-foreground font-bold text-xl">Messages</h1>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
                {showSearch ? <X className="w-5 h-5 text-primary-foreground" /> : <Search className="w-5 h-5 text-primary-foreground" />}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="px-3 py-2 bg-background border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..." className="pl-9 h-9 bg-muted border-0 rounded-full text-sm" autoFocus />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <SignalConversationList conversations={filteredConversations} activeId={activeId || undefined} onSelect={setActiveId} isLoading={isLoading} />
          </div>

          {/* FAB */}
          <button onClick={() => setShowNewConv(true)}
            className="absolute bottom-20 right-4 md:relative md:bottom-auto md:right-auto md:mx-4 md:mb-4 w-14 h-14 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 z-10 md:self-end">
            <Pencil className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Chat panel */}
        <div className={cn("flex-1 flex flex-col", !activeId ? "hidden md:flex" : "flex")}>
          {activeConversation ? (
            <SignalChatWindow conversation={activeConversation} onBack={() => setActiveId(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/20">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>

      <NewConversationDialog open={showNewConv} onOpenChange={setShowNewConv} onSelectUser={handleSelectUser} onSelectBusiness={handleSelectBusiness} />
    </>
  );
};
