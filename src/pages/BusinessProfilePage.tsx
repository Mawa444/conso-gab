import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Building2 } from "lucide-react";
import { CatalogInventoryIntegration } from "@/components/business/CatalogInventoryIntegration";
import { BusinessProfileEditor } from "@/components/business/BusinessProfileEditor";
import { toast } from "sonner";
import { BusinessChatLoader } from "@/features/chat/components/BusinessChatLoader";

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
  whatsapp?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

export const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessId } = useParams<{ businessId: string }>();
  const { currentBusinessId, currentMode, switchMode, isOwnerOfBusiness } = useProfileMode();
  const [searchParams] = useSearchParams();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const activeTab = searchParams.get('tab') || 'catalog';

  useEffect(() => {
    // NOUVELLE LOGIQUE : Lire l'ID depuis l'URL en priorité
    if (!businessId) {
      console.error('❌ Aucun businessId dans l\'URL');
      toast.error("ID d'entreprise manquant");
      navigate('/entreprises');
      return;
    }

    // Vérifier que l'utilisateur a accès à ce business
    const checkAccessAndLoadProfile = async () => {
      try {
        setLoading(true);
        
        // Vérifier que l'utilisateur est propriétaire
        if (!user) {
          toast.error("Vous devez être connecté");
          navigate('/auth');
          return;
        }

        // Vérifier l'accès au business
        const { data: business, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', businessId)
          .eq('user_id', user.id)
          .single();

        if (error || !business) {
          console.error('❌ Business non trouvé ou accès refusé:', error);
          toast.error("Vous n'avez pas accès à cette entreprise");
          navigate('/entreprises');
          return;
        }

        console.log('✅ Business trouvé:', business.business_name);
        setBusinessProfile(business);

        // Synchroniser le contexte si nécessaire
        if (currentMode !== 'business' || currentBusinessId !== businessId) {
          console.log('🔄 Synchronisation du contexte avec l\'URL');
          switchMode('business', businessId);
        }

      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        toast.error("Erreur lors du chargement");
        navigate('/entreprises');
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoadProfile();
  }, [businessId, user, navigate]);

  if (!businessId) {
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
              onClick={() => navigate('/entreprises')}
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
            onClick={() => navigate(`/business/${businessId}/settings`)} 
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={(tab) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('tab', tab);
          navigate(`/business/${businessId}/profile?${newParams.toString()}`, { replace: true });
        }}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="catalog">Catalogues</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Catalogues</CardTitle>
              </CardHeader>
              <CardContent>
                <CatalogInventoryIntegration 
                  businessId={businessId}
                  showConversationLinks={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardContent className="p-0 h-[600px]">
                <BusinessChatLoader businessId={businessId} />
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
