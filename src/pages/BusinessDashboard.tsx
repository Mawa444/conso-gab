import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Users,
  Settings,
  Plus,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { CatalogManager } from '@/components/business/CatalogManager';
import { OrderManager } from '@/components/business/OrderManager';
import { MessagingCenter } from '@/components/business/MessagingCenter';
import { BusinessSettings } from '@/components/business/BusinessSettings';

interface BusinessProfile {
  id: string;
  business_name: string;
  business_category: string;
  description: string;
  is_verified: boolean;
  is_active: boolean;
  phone?: string;
  whatsapp?: string;
  email?: string;
  telegram?: string;
  website?: string;
  address?: string;
  city?: string;
  logo_url?: string;
  cover_image_url?: string;
}

interface BusinessStats {
  totalCatalogs: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
}

export const BusinessDashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [stats, setStats] = useState<BusinessStats>({
    totalCatalogs: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    unreadMessages: 0
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBusinessProfile();
      fetchBusinessStats();
    }
  }, [user]);

  const fetchBusinessProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBusinessProfile(data);
      } else {
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil business",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchBusinessStats = async () => {
    if (!user) return;

    try {
      const { data: businessData } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!businessData) return;

      const [catalogsResult, productsResult, ordersResult, messagesResult] = await Promise.all([
        supabase.from('catalogs').select('id', { count: 'exact' }).eq('business_id', businessData.id),
        supabase.from('products').select('id', { count: 'exact' }).eq('business_id', businessData.id),
        supabase.from('orders').select('id, status', { count: 'exact' }).eq('business_id', businessData.id),
        supabase
          .from('conversations')
          .select(`
            id,
            messages!inner(id, status)
          `)
          .eq('business_id', businessData.id)
      ]);

      const pendingOrders = ordersResult.data?.filter(order => order.status === 'pending').length || 0;
      const unreadMessages = messagesResult.data?.reduce((count, conv) => {
        return count + conv.messages.filter((msg: any) => msg.status !== 'read').length;
      }, 0) || 0;

      setStats({
        totalCatalogs: catalogsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        pendingOrders,
        unreadMessages
      });
    } catch (error) {
      console.error('Error fetching business stats:', error);
    }
  };

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (showProfileForm && !businessProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">
              Créer votre profil business
            </h1>
            <BusinessProfileForm
              onSuccess={(profile) => {
                setBusinessProfile(profile as any);
                setShowProfileForm(false);
                fetchBusinessStats();
                toast({
                  title: "Profil créé",
                  description: "Votre profil business a été créé avec succès",
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{businessProfile?.business_name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={businessProfile?.is_verified ? "default" : "secondary"}>
                    {businessProfile?.is_verified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                  <Badge variant={businessProfile?.is_active ? "default" : "destructive"}>
                    {businessProfile?.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowProfileForm(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="catalogs">Catalogues</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Catalogues</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCatalogs}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produits</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingOrders} en attente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                  <p className="text-xs text-muted-foreground">non lus</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Aucune commande récente</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Messages récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Aucun message récent</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="catalogs">
            <CatalogManager businessId={businessProfile?.id} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManager businessId={businessProfile?.id} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagingCenter businessId={businessProfile?.id} />
          </TabsContent>

          <TabsContent value="settings">
            <BusinessSettings businessProfile={businessProfile} onUpdate={fetchBusinessProfile} />
          </TabsContent>
        </Tabs>
      </div>

      {showProfileForm && businessProfile && (
        <BusinessProfileForm
          businessProfile={businessProfile}
          onSuccess={(profile) => {
            setBusinessProfile(profile as any);
            setShowProfileForm(false);
            toast({
              title: "Profil mis à jour",
              description: "Votre profil business a été mis à jour avec succès",
            });
          }}
          onCancel={() => setShowProfileForm(false)}
        />
      )}
    </div>
  );
};