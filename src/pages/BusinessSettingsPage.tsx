import { useParams, useNavigate } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useEffect, useState } from "react";
import { BusinessProfileEditor } from "@/components/business/BusinessProfileEditor";
import { CarouselImagesManager } from "@/components/business/CarouselImagesManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Building2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

/**
 * Onglet Pro - Visible uniquement pour le propriétaire du business
 * Contient tous les paramètres sensibles de l'entreprise
 */
export const BusinessSettingsPage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { currentMode, currentBusinessId, isOwnerOfBusiness, getCurrentBusiness } = useProfileMode();
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("profile");

  const currentBusiness = getCurrentBusiness();
  const isOwner = businessId ? isOwnerOfBusiness(businessId) : false;

  useEffect(() => {
    if (businessId) {
      fetchCarouselImages();
    }
  }, [businessId]);

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('carousel_images')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      setCarouselImages(Array.isArray(data.carousel_images) ? data.carousel_images as string[] : []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Vérification de sécurité stricte
  useEffect(() => {
    // Vérifier que l'utilisateur est en mode business
    if (currentMode !== 'business') {
      toast.error("Accès refusé : Mode Business requis");
      navigate('/consumer/home');
      return;
    }

    // Vérifier que c'est le bon business
    if (currentBusinessId !== businessId) {
      toast.error("Accès refusé : Business non autorisé");
      navigate('/consumer/home');
      return;
    }

    // Vérifier que l'utilisateur est propriétaire
    if (!isOwner) {
      toast.error("Accès refusé : Propriétaire uniquement");
      navigate(`/business/${businessId}`);
      return;
    }
  }, [currentMode, currentBusinessId, businessId, isOwner, navigate]);

  // Ne rien afficher si pas autorisé
  if (!currentBusiness || currentBusinessId !== businessId || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header avec badge Pro */}
      <div className="bg-gradient-to-r from-primary to-accent text-white shadow-lg">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/business/${businessId}/dashboard`)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <h1 className="text-2xl font-bold">Onglet Pro</h1>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  Paramètres réservés au propriétaire
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert de sécurité */}
      <div className="container mx-auto px-6 pt-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">Zone sécurisée</p>
                <p className="text-sm text-orange-700">
                  Ces paramètres sont uniquement visibles par vous en tant que propriétaire de {currentBusiness.business_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="advertising" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Publicité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <BusinessProfileEditor businessId={businessId!} />
          </TabsContent>

          <TabsContent value="advertising" className="mt-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Megaphone className="w-6 h-6" />
                Gestion publicitaire
              </h3>
              <p className="text-muted-foreground">
                Gérez les images publicitaires qui apparaîtront dans le carrousel de votre carte entreprise
              </p>
            </div>
            
            <CarouselImagesManager
              businessId={businessId!}
              currentImages={carouselImages}
              onImagesUpdate={(images) => {
                setCarouselImages(images);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessSettingsPage;
