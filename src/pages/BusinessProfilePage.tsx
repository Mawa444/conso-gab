import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Package,
  MessageSquare,
  Share2,
  Building2,
  Users,
  Clock,
  Plus
} from "lucide-react";
import { BusinessVitrineTab } from "@/components/business/BusinessVitrineTab";
import { ActivityLog } from "@/components/business/ActivityLog";
import { MultiBusinessManager } from "@/components/business/MultiBusinessManager";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { toast } from "sonner";

interface BusinessProfile {
  id: string;
  business_name: string;
  description?: string;
  business_category: string;
  logo_url?: string;
  cover_image_url?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  is_verified: boolean;
  is_active: boolean;
  is_sleeping: boolean;
  user_id: string;
  created_at: string;
}

export const BusinessProfilePage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentMode, switchMode } = useProfileMode();
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("vitrine");

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
    }
  }, [businessId]);

  const fetchBusinessProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      setBusiness(data);
      setIsOwner(user?.id === data.user_id);
    } catch (error) {
      console.error('Erreur lors du chargement du profil business:', error);
      toast.error("Impossible de charger le profil business");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToBusiness = () => {
    if (isOwner && businessId) {
      switchMode('business', businessId, navigate);
    }
  };

  const handleContactBusiness = () => {
    if (!user) {
      toast.error("Connectez-vous pour contacter ce commerce");
      return;
    }
    // TODO: Ouvrir une conversation avec le business
    navigate('/messaging');
  };

  const handleCreateCatalog = () => {
    navigate('/business/create-catalog');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">Profil business introuvable</h3>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            {isOwner && (
              <Button size="sm" onClick={handleSwitchToBusiness}>
                <Building2 className="w-4 h-4 mr-2" />
                Gérer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cover & Profile Info */}
      <div className="relative">
        {business.cover_image_url && (
          <div className="h-48 bg-gradient-to-r from-primary to-accent">
            <img 
              src={business.cover_image_url} 
              alt="Couverture" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="px-4 pb-6">
          <div className="flex items-end gap-4 -mt-16 relative">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center">
              {business.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt="Logo" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Building2 className="w-12 h-12 text-primary" />
              )}
            </div>
            
            <div className="flex-1 mt-16">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{business.business_name}</h1>
                {business.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Star className="w-3 h-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
                {business.is_sleeping && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    En pause
                  </Badge>
                )}
              </div>
              
              {business.description && (
                <p className="text-muted-foreground mb-3">{business.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {business.quartier && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.quartier}, {business.city}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          {!isOwner && (
            <div className="flex gap-2 mt-4">
              <Button onClick={handleContactBusiness} className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacter
              </Button>
              <Button variant="outline" onClick={() => window.open(`tel:${business.phone}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
            </div>
          )}

          {isOwner && (
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateCatalog} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Créer un catalogue
              </Button>
              <Button variant="outline" onClick={() => navigate('/business/dashboard')}>
                <Package className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitrine">Vitrine</TabsTrigger>
            <TabsTrigger value="catalogs">Catalogues</TabsTrigger>
            {isOwner && <TabsTrigger value="manage">Gestion</TabsTrigger>}
          </TabsList>

          <TabsContent value="vitrine" className="mt-6">
            <BusinessVitrineTab 
              businessId={businessId!} 
              businessName={business.business_name}
            />
          </TabsContent>

          <TabsContent value="catalogs" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Catalogues disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Fonctionnalité en cours de développement
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isOwner && (
            <TabsContent value="manage" className="mt-6">
              <div className="space-y-6">
                <MultiBusinessManager />
                <ActivityLog />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="home" 
        onTabChange={(tab) => {
          if (tab === "home") navigate("/");
          else if (tab === "map") navigate("/?tab=map");
          else if (tab === "profile") navigate("/?tab=profile");
        }} 
      />
    </div>
  );
};

export default BusinessProfilePage;