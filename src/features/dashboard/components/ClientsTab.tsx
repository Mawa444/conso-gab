import { useState } from 'react';
import { useBusinessCustomers } from '@/features/dashboard/hooks/useBusinessCRM';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, MessageSquare, ShoppingBag, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientsTabProps {
  business: any;
}

export const ClientsTab = ({ business }: ClientsTabProps) => {
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useBusinessCustomers(business.id, search);
  
  // Feature Guard
  if (!business.settings?.features?.crm) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-2">Module Clients désactivé</h3>
        <p className="text-muted-foreground max-w-sm mb-4">
            Activez le module CRM pour suivre vos clients, noter leurs préférences et analyser leur fidélité.
        </p>
        {/* Navigation vers Settings serait idéal ici */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Chargement...</p>
        ) : customers?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun client trouvé. Vos clients s'ajouteront automatiquement lors de leur première commande.
          </div>
        ) : (
          customers?.map((customer) => (
            <Card key={customer.id} className="overflow-hidden hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={customer.avatar_url} />
                    <AvatarFallback>{customer.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {customer.full_name}
                      {customer.status === 'vip' && (
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-[10px] px-1 h-5">
                            VIP
                        </Badge>
                      )}
                      {customer.status === 'new' && (
                        <Badge variant="secondary" className="text-[10px] px-1 h-5">
                            Nouveau
                        </Badge>
                      )}
                    </h4>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {customer.total_orders} commandes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(customer.last_interaction_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
