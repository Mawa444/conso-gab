import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  MessageSquare, 
  Package, 
  TrendingUp,
  Users,
  ShoppingCart,
  Calendar,
  Plus
} from "lucide-react";
import { CatalogInventoryIntegration } from "@/components/business/CatalogInventoryIntegration";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BusinessStats {
  total_orders: number;
  pending_orders: number;
  total_conversations: number;
  unread_messages: number;
  total_catalogs: number;
  active_catalogs: number;
  total_revenue: number;
  monthly_revenue: number;
}

interface OrderItem {
  id: string;
  buyer_id: string;
  total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  items: any;
}

interface ConversationItem {
  id: string;
  title: string;
  origin_type: string;
  last_activity: string;
  unread_count: number;
}

export const BusinessDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BusinessStats>({
    total_orders: 0,
    pending_orders: 0,
    total_conversations: 0,
    unread_messages: 0,
    total_catalogs: 0,
    active_catalogs: 0,
    total_revenue: 0,
    monthly_revenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [activeConversations, setActiveConversations] = useState<ConversationItem[]>([]);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get business profile
      const { data: business } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (!business) {
        navigate('/merchant/register');
        return;
      }

      setBusinessProfile(business);

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', business.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (orders) {
        setRecentOrders(orders);
        
        // Calculate stats
        const totalRevenue = orders
          .filter(o => o.status === 'paid')
          .reduce((sum, o) => sum + (o.total_cents || 0), 0);
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyRevenue = orders
          .filter(o => o.status === 'paid' && new Date(o.created_at) >= thisMonth)
          .reduce((sum, o) => sum + (o.total_cents || 0), 0);

        setStats(prev => ({
          ...prev,
          total_orders: orders.length,
          pending_orders: orders.filter(o => o.status === 'pending').length,
          total_revenue: totalRevenue,
          monthly_revenue: monthlyRevenue
        }));
      }

      // Fetch conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          origin_type,
          last_activity,
          participants!inner(user_id)
        `)
        .eq('participants.user_id', user?.id)
        .order('last_activity', { ascending: false })
        .limit(10);

      if (conversations) {
        setActiveConversations(conversations.map(c => ({
          ...c,
          unread_count: 0 // TODO: Calculate unread count
        })));
        
        setStats(prev => ({
          ...prev,
          total_conversations: conversations.length,
          unread_messages: 0 // TODO: Calculate unread messages
        }));
      }

      // Fetch catalogs
      const { data: catalogs } = await supabase
        .from('catalogs')
        .select('id, is_active, is_public')
        .eq('business_id', business.id);

      if (catalogs) {
        setStats(prev => ({
          ...prev,
          total_catalogs: catalogs.length,
          active_catalogs: catalogs.filter(c => c.is_active && c.is_public).length
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number, currency = 'XAF') => {
    return `${(cents / 100).toLocaleString()} ${currency}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gaboma-gradient">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">{businessProfile?.business_name}</p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/create-catalog')} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau catalogue
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_orders}</p>
                  <p className="text-xs text-muted-foreground">Commandes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</p>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_conversations}</p>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_catalogs}</p>
                  <p className="text-xs text-muted-foreground">Catalogues actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="catalogs">Catalogues</TabsTrigger>
            <TabsTrigger value="conversations">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recent Orders Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Commandes récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                      <p>Aucune commande pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {formatCurrency(order.total_cents, order.currency)}
                              </span>
                              <Badge 
                                variant={order.status === 'paid' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} article(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Conversations Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations actives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeConversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      <p>Aucune conversation active</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {activeConversations.slice(0, 5).map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                          onClick={() => navigate(`/messaging/conversation/${conversation.id}`)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {conversation.title || 'Conversation'}
                              </span>
                              {conversation.origin_type && (
                                <Badge variant="outline" className="text-xs">
                                  {conversation.origin_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatTime(conversation.last_activity)}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs px-1 mt-1">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="catalogs" className="space-y-6">
            <CatalogInventoryIntegration 
              businessId={businessProfile?.id || ''}
              showConversationLinks={true}
            />
          </TabsContent>

          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => navigate(`/messaging/conversation/${conversation.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {conversation.title || 'Conversation'}
                          </span>
                          {conversation.origin_type && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.origin_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_activity)}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs px-1 mt-1">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">{formatCurrency(stats.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ce mois</span>
                      <span className="font-bold text-green-600">{formatCurrency(stats.monthly_revenue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Commandes en attente</span>
                      <span className="font-bold">{stats.pending_orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Messages non lus</span>
                      <span className="font-bold">{stats.unread_messages}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessDashboardPage;