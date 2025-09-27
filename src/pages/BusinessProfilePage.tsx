import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Building2 } from "lucide-react";
import { CatalogInventoryIntegration } from "@/components/business/CatalogInventoryIntegration";
import { BusinessProfileEditor } from "@/components/business/BusinessProfileEditor";
import { toast } from "sonner";

interface BusinessProfile {
  id: string;
  business_name: string;
  description?: string;
  business_category?: string;
  logo_url?: string;
  cover_image_url?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

export const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBusinessId, currentMode } = useProfileMode();
  const [searchParams] = useSearchParams();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const activeTab = searchParams.get('tab') || 'catalog';

  useEffect(() => {
    // Rediriger si pas en mode business ou pas de business ID
    if (currentMode !== 'business' || !currentBusinessId) {
      console.log('🚫 Redirection: mode invalide ou pas de business ID');
      navigate('/consumer/profile?tab=businesses');
      return;
    }

    fetchBusinessProfile();
  }, [currentMode, currentBusinessId, navigate]);

  const fetchBusinessProfile = async () => {
    if (!currentBusinessId) return;

    try {
      setLoading(true);
      console.log('📡 Récupération du profil business:', currentBusinessId);

      // Récupérer EXACTEMENT le business sélectionné
      const { data: business, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', currentBusinessId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération business profile:', error);
        toast.error("Impossible de charger le profil business");
        navigate('/consumer/profile?tab=businesses');
        return;
      }

      if (!business) {
        console.error('❌ Aucun profil business trouvé avec l\'ID:', currentBusinessId);
        toast.error("Profil business introuvable");
        navigate('/consumer/profile?tab=businesses');
        return;
      }

      // Vérifier que l'utilisateur est propriétaire
      if (business.user_id !== user?.id) {
        console.error('❌ Utilisateur non autorisé pour ce profil business');
        toast.error("Vous n'avez pas accès à ce profil business");
        navigate('/consumer/profile?tab=businesses');
        return;
      }

      console.log('✅ Profil business chargé:', business.business_name);
      setBusinessProfile(business);
      
    } catch (error) {
      console.error('❌ Erreur fetchBusinessProfile:', error);
      toast.error("Erreur lors du chargement du profil");
      navigate('/consumer/profile?tab=businesses');
    } finally {
      setLoading(false);
    }
  };

  if (!currentBusinessId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil business...</p>
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
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/consumer/profile?tab=businesses')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gaboma-gradient">
                {businessProfile?.business_name || 'Profil Business'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {businessProfile?.business_category || 'Gestion de votre entreprise'}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/business/profile/edit')} 
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Modifier profil
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={(tab) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', tab);
          navigate(`/business/profile?${newParams.toString()}`, { replace: true });
        }}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="catalog">Catalogues</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Catalogues</CardTitle>
              </CardHeader>
              <CardContent>
                <CatalogInventoryIntegration 
                  businessId={currentBusinessId}
                  showConversationLinks={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pro" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tableau de Bord Professionnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fonctionnalités du tableau de bord à implémenter...
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfilePage;