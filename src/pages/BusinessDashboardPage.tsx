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
import { ProfessionalDashboard } from "@/components/professional/ProfessionalDashboard";

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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/consumer/home')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au mode consommateur
        </Button>
        
        <ProfessionalDashboard 
          businessId={businessId || ''} 
          businessName={currentBusiness.business_name}
          businessCategory={currentBusiness.business_category}
          userType={isOwner ? "owner" : "employee"}
          business={currentBusiness}
        />
      </div>
    </div>
  );
};

export default BusinessDashboardPage;
