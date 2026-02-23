import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchUsers, useSearchBusinesses } from '../hooks/useChatQueries';
import { Search, User, Store, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
  onSelectBusiness: (businessId: string) => void;
}

export const NewConversationDialog: React.FC<Props> = ({ open, onOpenChange, onSelectUser, onSelectBusiness }) => {
  const [query, setQuery] = useState('');
  const { data: users = [], isLoading: loadingUsers } = useSearchUsers(query);
  const { data: businesses = [], isLoading: loadingBiz } = useSearchBusinesses(query);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-lg">Nouvelle conversation</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un contact ou un commerce..."
              className="pl-9 h-10 rounded-full bg-muted border-0"
              autoFocus
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="users" className="flex-1 gap-1.5">
              <User className="w-4 h-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex-1 gap-1.5">
              <Store className="w-4 h-4" /> Commerces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="flex-1 overflow-y-auto m-0 px-2 pb-4">
            {loadingUsers && query.length >= 2 && (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            )}
            {!query || query.length < 2 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Tapez au moins 2 caractères</p>
            ) : users.length === 0 && !loadingUsers ? (
              <p className="text-center text-muted-foreground text-sm py-8">Aucun résultat</p>
            ) : (
              users.map((u: any) => (
                <button key={u.user_id} onClick={() => handleSelectUser(u.user_id)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted/60 transition-colors">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="bg-primary/15 text-primary font-semibold text-sm">
                      {(u.display_name || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[15px]">{u.display_name || 'Utilisateur'}</span>
                </button>
              ))
            )}
          </TabsContent>

          <TabsContent value="businesses" className="flex-1 overflow-y-auto m-0 px-2 pb-4">
            {loadingBiz && query.length >= 2 && (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            )}
            {!query || query.length < 2 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Tapez au moins 2 caractères</p>
            ) : businesses.length === 0 && !loadingBiz ? (
              <p className="text-center text-muted-foreground text-sm py-8">Aucun résultat</p>
            ) : (
              businesses.map((b: any) => (
                <button key={b.id} onClick={() => handleSelectBusiness(b.id)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted/60 transition-colors">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={b.logo_url} />
                    <AvatarFallback className="bg-accent/20 text-accent-foreground font-semibold text-sm">
                      {b.business_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <span className="font-medium text-[15px] block">{b.business_name}</span>
                    <span className="text-xs text-muted-foreground">{b.business_category}</span>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
