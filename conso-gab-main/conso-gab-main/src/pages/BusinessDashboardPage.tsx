import { useParams, useNavigate } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useBusinessStats } from "@/hooks/use-business-stats";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Settings,
  ArrowLeft,
  BarChart3,
  Eye,
  Heart
} from "lucide-react";
import { toast } from "sonner";

export const BusinessDashboardPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { currentMode, currentBusinessId, getCurrentBusiness, isOwnerOfBusiness } = useProfileMode();
  const { stats, loading: statsLoading } = useBusinessStats(businessId);

  const currentBusiness = getCurrentBusiness();
  const isOwner = businessId ? isOwnerOfBusiness(businessId) : false;

  // Vérifier les permissions
  useEffect(() => {
    if (currentMode !== 'business' || currentBusinessId !== businessId) {
      toast.error("Accès non autorisé");
      navigate('/consumer/home');
    }
  }, [currentMode, currentBusinessId, businessId, navigate]);

  if (!currentBusiness || currentBusinessId !== businessId) {
    return null;
  }

  const statsDisplay = [
    { label: "Commandes", value: stats.orders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { label: "Produits", value: stats.products.toString(), icon: Package, color: "text-green-600" },
    { label: "Messages", value: stats.messages.toString(), icon: MessageSquare, color: "text-purple-600" },
    { label: "Vues", value: stats.views.toString(), icon: Eye, color: "text-orange-600" },
    { label: "Catalogues", value: stats.catalogs.toString(), icon: BarChart3, color: "text-indigo-600" },
    { label: "Abonnés", value: stats.subscribers.toString(), icon: Heart, color: "text-pink-600" }
  ];

  const quickActions = [
    { 
      label: "Catalogues", 
      icon: Package, 
      onClick: () => navigate(`/business/${businessId}/catalogues`),
      description: "Gérer vos produits et services"
    },
    { 
      label: "Commandes", 
      icon: ShoppingBag, 
      onClick: () => navigate(`/business/${businessId}/orders`),
      description: "Voir les commandes reçues"
    },
    { 
      label: "Messages", 
      icon: MessageSquare, 
      onClick: () => navigate(`/business/${businessId}/messages`),
      description: "Communiquer avec vos clients"
    },
    { 
      label: "Statistiques", 
      icon: BarChart3, 
      onClick: () => toast.info("Statistiques à venir"),
      description: "Analyser vos performances"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/consumer/home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{currentBusiness.business_name}</h1>
                <p className="text-sm text-muted-foreground">Tableau de bord Business</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/business/${businessId}`)}
              >
                Voir le profil public
              </Button>
              {isOwner && (
                <Button
                  onClick={() => navigate(`/business/${businessId}/settings`)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Onglet Pro
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsDisplay.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-10 h-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={action.onClick}
                >
                  <action.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune activité récente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboardPage;
