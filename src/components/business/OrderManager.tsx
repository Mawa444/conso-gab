import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Loader2, Eye, Package } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  notes: string;
  created_at: string;
  customer_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      images: string[];
    };
  }[];
}

interface OrderManagerProps {
  businessId?: string;
}

const statusOptions = [
  { value: 'pending', label: 'En attente', variant: 'secondary' as const },
  { value: 'confirmed', label: 'Confirmée', variant: 'default' as const },
  { value: 'processing', label: 'En traitement', variant: 'default' as const },
  { value: 'shipped', label: 'Expédiée', variant: 'default' as const },
  { value: 'delivered', label: 'Livrée', variant: 'success' as const },
  { value: 'cancelled', label: 'Annulée', variant: 'destructive' as const },
];

export const OrderManager = ({ businessId }: OrderManagerProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (businessId) {
      fetchOrders();
    }
  }, [businessId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!inner(first_name, last_name),
          order_items(
            *,
            products(name, images)
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Succès",
        description: "Statut de la commande mis à jour",
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les commandes</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedStatus === 'all' ? 'Aucune commande' : 'Aucune commande avec ce statut'}
            </h3>
            <p className="text-muted-foreground">
              {selectedStatus === 'all' 
                ? 'Les commandes de vos clients apparaîtront ici'
                : 'Modifiez le filtre pour voir d\'autres commandes'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Commande #{order.order_number}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Client: {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {order.total_amount.toFixed(2)} FCFA
                      </div>
                      <Badge variant={statusInfo.variant === 'success' ? 'default' : statusInfo.variant as any}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Articles commandés:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div className="flex items-center space-x-3">
                              {item.products.images?.[0] && (
                                <img 
                                  src={item.products.images[0]} 
                                  alt={item.products.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.products.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantité: {item.quantity} × {item.unit_price.toFixed(2)} FCFA
                                </p>
                              </div>
                            </div>
                            <div className="font-semibold">
                              {item.total_price.toFixed(2)} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.delivery_address && (
                      <div>
                        <h4 className="font-semibold mb-1">Adresse de livraison:</h4>
                        <p className="text-muted-foreground">{order.delivery_address}</p>
                      </div>
                    )}

                    {order.notes && (
                      <div>
                        <h4 className="font-semibold mb-1">Notes:</h4>
                        <p className="text-muted-foreground">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};