import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LocationStep } from "@/components/auth/LocationStep";
import { ProfileImageUploader } from "@/components/profile/ProfileImageUploader";
import { CoverImageUploader } from "@/components/profile/CoverImageUploader";
import { CarouselImagesManager } from "@/components/business/CarouselImagesManager";
import { BusinessImageViewModal } from "@/components/business/BusinessImageViewModal";
import { Building2, MapPin, Clock, Share2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllBusinessCategories } from "@/data/businessCategories";
import { useQueryClient } from "@tanstack/react-query";

interface BusinessProfileEditorProps {
  businessId: string;
}

interface BusinessData {
  business_name: string;
  business_category: any;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  carousel_images?: string[];
  logo_updated_at?: string | null;
  cover_updated_at?: string | null;
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
  latitude?: number;
  longitude?: number;
  social_media?: any;
}

export const BusinessProfileEditor = ({ businessId }: BusinessProfileEditorProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<BusinessData | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; type: 'logo' | 'cover'; title: string } | null>(null);
  const businessCategories = getAllBusinessCategories();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      const { data: businessData, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...businessData,
        carousel_images: Array.isArray(businessData.carousel_images) 
          ? businessData.carousel_images as string[] 
          : []
      };
      
      setData(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoadingData(false);
    }
  };

  const updateData = (updates: Partial<BusinessData>) => {
    if (data) {
      setData({ ...data, ...updates });
    }
  };

  const handleImageUpdate = async (field: 'logo_url' | 'cover_image_url', url: string) => {
    // Mise à jour optimiste de l'UI
    const dateField = field === 'logo_url' ? 'logo_updated_at' : 'cover_updated_at';
    const newDate = new Date().toISOString();
    updateData({ [field]: url, [dateField]: newDate });
    
    try {
      // Sauvegarde dans la base de données
      const { error } = await supabase
        .from('business_profiles')
        .update({ [field]: url })
        .eq('id', businessId);

      if (error) throw error;
      
      // Invalider le cache React Query pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      
      // Recharger depuis le serveur pour confirmer
      await fetchBusinessData();
      
      toast.success("Image mise à jour avec succès !");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'image:', error);
      toast.error("Erreur lors de la sauvegarde de l'image");
      // Rollback en cas d'erreur
      await fetchBusinessData();
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update(data)
        .eq('id', businessId);

      if (error) throw error;
      
      // Invalider le cache et recharger
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      await fetchBusinessData();
      
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde");
      // Recharger en cas d'erreur pour restaurer l'état correct
      await fetchBusinessData();
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMedia = (platform: string, field: string, value: any) => {
    const currentSocialMedia = data?.social_media || {};
    updateData({
      social_media: {
        ...currentSocialMedia,
        [platform]: {
          ...currentSocialMedia[platform],
          [field]: value
        }
      }
    });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p>Impossible de charger les données du profil business.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Gestion du profil
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Modifiez les informations de votre entreprise
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="basic" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Informations
          </TabsTrigger>
          <TabsTrigger 
            value="images"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Images
          </TabsTrigger>
          <TabsTrigger 
            value="carousel"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Publicités
          </TabsTrigger>
          <TabsTrigger 
            value="location"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Localisation
          </TabsTrigger>
          <TabsTrigger 
            value="contact"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Contact
          </TabsTrigger>
          <TabsTrigger 
            value="social"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Réseaux sociaux
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-6 mt-6">
          <CoverImageUploader
            currentImageUrl={data.cover_image_url}
            onImageUploaded={(url, path) => handleImageUpdate('cover_image_url', url)}
            onImageClick={() => data.cover_image_url && setViewingImage({ 
              url: data.cover_image_url, 
              type: 'cover', 
              title: 'Image de couverture' 
            })}
            bucket="catalog-covers"
            folder="business-covers"
            label="Image de couverture du profil"
          />

          <ProfileImageUploader
            currentImageUrl={data.logo_url}
            onImageUploaded={(url, path) => handleImageUpdate('logo_url', url)}
            onImageClick={() => data.logo_url && setViewingImage({ 
              url: data.logo_url, 
              type: 'logo', 
              title: 'Logo de l\'entreprise' 
            })}
            bucket="catalog-covers"
            folder="business-logos"
            label="Logo de l'entreprise"
          />
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6 mt-6">
          <CarouselImagesManager
            businessId={businessId}
            currentImages={data.carousel_images || []}
            onImagesUpdate={(images) => updateData({ carousel_images: images })}
          />
        </TabsContent>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="businessName" className="text-sm font-semibold">
                Nom de l'entreprise *
              </Label>
              <Input
                id="businessName"
                value={data.business_name}
                onChange={e => updateData({ business_name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-semibold">
                Catégorie *
              </Label>
              <Select value={data.business_category} onValueChange={value => updateData({ business_category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.nom}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={data.description || ''}
                onChange={e => updateData({ description: e.target.value })}
                className="mt-1 min-h-[80px]"
                maxLength={300}
              />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-6">
            <LocationStep
              initialLocation={{
                country: data.country || 'Gabon',
                province: data.province,
                department: data.department,
                arrondissement: data.arrondissement,
                quartier: data.quartier,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude
              }}
              onLocationChange={location => {
                updateData({
                  country: location.country,
                  province: location.province,
                  department: location.department,
                  arrondissement: location.arrondissement,
                  quartier: location.quartier,
                  address: location.address,
                  latitude: location.latitude,
                  longitude: location.longitude
                });
              }}
            />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Numéro de téléphone
                </Label>
                <Input
                  id="phone"
                  value={data.phone || ''}
                  onChange={e => updateData({ phone: e.target.value })}
                  placeholder="+241 xx xx xx xx"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-sm font-semibold">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={data.whatsapp || ''}
                  onChange={e => updateData({ whatsapp: e.target.value })}
                  placeholder="+241 xx xx xx xx"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email professionnel
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ''}
                  onChange={e => updateData({ email: e.target.value })}
                  placeholder="contact@monentreprise.ga"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-semibold">
                  Site web
                </Label>
                <Input
                  id="website"
                  value={data.website || ''}
                  onChange={e => updateData({ website: e.target.value })}
                  placeholder="https://monentreprise.ga"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-6">
            <div className="space-y-4">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/votre-page' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/votre-entreprise' },
                { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/votre-compte' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@votre-compte' },
                { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/c/votre-chaine' }
              ].map(social => (
                <div key={social.key} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 min-w-[100px]">
                    <Switch
                      checked={data.social_media?.[social.key]?.enabled || false}
                      onCheckedChange={(checked) => updateSocialMedia(social.key, 'enabled', checked)}
                    />
                    <Label className="text-sm font-semibold">
                      {social.label}
                    </Label>
                  </div>
                  <Input
                    placeholder={social.placeholder}
                    value={data.social_media?.[social.key]?.url || ''}
                    disabled={!data.social_media?.[social.key]?.enabled}
                    onChange={(e) => updateSocialMedia(social.key, 'url', e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg" className="px-8">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>

      {/* Image View Modal avec likes */}
      {viewingImage && (
        <BusinessImageViewModal
          open={true}
          onClose={() => setViewingImage(null)}
          imageUrl={viewingImage.url}
          imageType={viewingImage.type}
          businessId={businessId}
          imageTitle={viewingImage.title}
          uploadDate={viewingImage.type === 'logo' ? data.logo_updated_at : data.cover_updated_at}
        />
      )}
    </div>
  );
};