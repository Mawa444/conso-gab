import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Store, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
  onSelectBusiness: (businessId: string) => void;
}

export const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  onOpenChange,
  onSelectUser,
  onSelectBusiness,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');

  // Fetch users (profiles)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['contacts', 'users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, first_name, last_name')
        .neq('user_id', user?.id || '')
        .order('display_name', { ascending: true })
        .limit(100);
      return data || [];
    },
    enabled: open && !!user,
  });

  // Fetch businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['contacts', 'businesses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, business_category, city')
        .eq('is_active', true)
        .order('business_name', { ascending: true })
        .limit(100);
      return data || [];
    },
    enabled: open,
  });

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.display_name || '').toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const filteredBusinesses = useMemo(() => {
    if (!search.trim()) return businesses;
    const q = search.toLowerCase();
    return businesses.filter(b =>
      b.business_name.toLowerCase().includes(q) ||
      (b.city || '').toLowerCase().includes(q) ||
      (b.business_category || '').toLowerCase().includes(q)
    );
  }, [businesses, search]);

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
    setSearch('');
  };

  const handleSelectBusiness = (businessId: string) => {
    onSelectBusiness(businessId);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un contact ou business..."
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="users" className="gap-1.5">
              <User className="w-3.5 h-3.5" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Business
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="flex-1 overflow-y-auto mt-2 -mx-1">
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {search ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredUsers.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => handleSelectUser(u.user_id)}
                    className="flex items-center gap-3 p-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors text-left w-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback>
                        {(u.display_name || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Utilisateur'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="businesses" className="flex-1 overflow-y-auto mt-2 -mx-1">
            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {search ? 'Aucun business trouvé' : 'Aucun business disponible'}
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredBusinesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBusiness(b.id)}
                    className="flex items-center gap-3 p-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors text-left w-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={b.logo_url || undefined} />
                      <AvatarFallback>
                        {b.business_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.business_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.business_category}{b.city ? ` · ${b.city}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};