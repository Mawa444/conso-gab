import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchUsers, useSearchBusinesses } from '../hooks/useChatQueries';
import { Search, ArrowLeft, User, Store, Loader2, Building2, MessageCirclePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
  onSelectBusiness: (businessId: string) => void;
}

type Tab = 'all' | 'users' | 'businesses';

export const NewConversationDialog: React.FC<Props> = ({ open, onOpenChange, onSelectUser, onSelectBusiness }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { data: users = [], isLoading: loadingUsers } = useSearchUsers(query);
  const { data: businesses = [], isLoading: loadingBiz } = useSearchBusinesses(query);

  const isSearching = query.length >= 2;
  const isLoading = loadingUsers || loadingBiz;
  const hasResults = users.length > 0 || businesses.length > 0;

  const filteredUsers = activeTab === 'businesses' ? [] : users;
  const filteredBusinesses = activeTab === 'users' ? [] : businesses;

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
    setQuery('');
  };

  const handleSelectBusiness = (businessId: string) => {
    onSelectBusiness(businessId);
    onOpenChange(false);
    setQuery('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
    setActiveTab('all');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Signal-style header */}
        <div className="bg-primary px-3 py-3 flex items-center gap-3">
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <DialogHeader className="flex-1 p-0 space-y-0">
            <DialogTitle className="text-primary-foreground text-lg font-semibold">Nouveau message</DialogTitle>
          </DialogHeader>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2.5 bg-background border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un contact ou une entreprise..."
              className="pl-9 h-10 rounded-full bg-muted border-0 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-3 py-2 bg-background border-b border-border/50">
          {([
            { key: 'all' as Tab, label: 'Tous', icon: null },
            { key: 'users' as Tab, label: 'Contacts', icon: User },
            { key: 'businesses' as Tab, label: 'Entreprises', icon: Store },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCirclePlus className="w-10 h-10 text-primary/60" />
              </div>
              <p className="font-medium text-foreground text-[15px]">Démarrer une conversation</p>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-[260px]">
                Recherchez un contact ou une entreprise pour envoyer un message
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-sm">Aucun résultat pour « {query} »</p>
            </div>
          ) : (
            <div className="py-1">
              {/* Business results */}
              {filteredBusinesses.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Entreprises
                    </p>
                  </div>
                  {filteredBusinesses.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBusiness(b.id)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={b.logo_url} />
                          <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                            {b.business_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                          <Store className="w-2.5 h-2.5 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-semibold text-[15px] text-foreground block truncate">{b.business_name}</span>
                        <span className="text-xs text-muted-foreground truncate block">{b.business_category || 'Entreprise'}</span>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageCirclePlus className="w-4 h-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* User results */}
              {filteredUsers.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Contacts
                    </p>
                  </div>
                  {filteredUsers.map((u: any) => (
                    <button
                      key={u.user_id}
                      onClick={() => handleSelectUser(u.user_id)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
                          {(u.display_name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-medium text-[15px] text-foreground block truncate">
                          {u.display_name || 'Utilisateur'}
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <MessageCirclePlus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
