import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationStep } from "@/components/auth/LocationStep";
import { Building2, ArrowLeft, ArrowRight, Loader2, Upload, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAllBusinessCategories } from "@/data/businessCategories";
import { useEnhancedImageUpload } from "@/hooks/use-enhanced-image-upload";

interface BusinessCreationWizardProps {
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}

interface BusinessData {
  businessName: string;
  businessCategory: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  businessPhone?: string;
  whatsapp?: string;
  businessEmail?: string;
  website?: string;
}

export const BusinessCreationWizard = ({ onCancel, onCreated }: BusinessCreationWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusinessData>({
    businessName: '',
    businessCategory: '',
    description: '',
    country: 'Gabon'
  });

  const { refreshBusinessProfiles } = useProfileMode();
  const { user } = useAuth();
  const { uploadProcessedImage, isUploading } = useEnhancedImageUpload();
  const businessCategories = getAllBusinessCategories();

  const updateData = (updates: Partial<BusinessData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canNext = () => {
    switch (step) {
      case 1:
        return !!(data.businessName?.trim() && data.businessCategory && data.description?.trim());
      case 2:
        return !!(data.province || (data.latitude && data.longitude));
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3 && canNext()) {
      setStep((step + 1) as typeof step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as typeof step);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    const dimensions = type === 'logo' 
      ? { width: 400, height: 400 } 
      : { width: 1920, height: 1080 };

    const result = await uploadProcessedImage(file, {
      bucket: 'business-assets',
      folder: `business-${type}s`,
      exactDimensions: dimensions,
      requireSquare: type === 'logo'
    });

    if (result) {
      updateData({
        [type === 'logo' ? 'logoUrl' : 'coverImageUrl']: result.url
      });
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour créer une entreprise");
      return;
    }

    if (!canNext()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const businessData = {
        user_id: user.id,
        business_name: data.businessName,
        business_category: data.businessCategory as any,
        description: data.description,
        logo_url: data.logoUrl,
        cover_image_url: data.coverImageUrl,
        phone: data.businessPhone,
        whatsapp: data.whatsapp,
        email: data.businessEmail,
        website: data.website,
        address: data.address,
        city: data.quartier,
        country: data.country || 'Gabon',
        province: data.province,
        department: data.department,
        arrondissement: data.arrondissement,
        quartier: data.quartier,
        latitude: data.latitude,
        longitude: data.longitude,
        social_media: {},
        is_active: true,
        is_verified: false,
        status: 'unverified'
      };

      const { data: businessProfile, error } = await supabase
        .from('business_profiles')
        .insert(businessData)
        .select()
        .single();

      if (error) throw error;

      await refreshBusinessProfiles();
      toast.success("🎉 Entreprise créée avec succès !");
      
      if (onCreated) {
        onCreated(businessProfile.id);
      }
    } catch (error: any) {
      console.error('Erreur création entreprise:', error);
      toast.error(error.message || "Erreur lors de la création de l'entreprise");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Informations de base</h3>
              <p className="text-muted-foreground">
                Présentez votre entreprise de manière claire et attractive
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-semibold">
                  Nom de l'entreprise *
                </Label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={e => updateData({ businessName: e.target.value })}
                  placeholder="Ex: Le Snack Gabonais - Sandwichs et Livraisons"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-semibold">
                  Catégorie *
                </Label>
                <Select value={data.businessCategory} onValueChange={value => updateData({ businessCategory: value })}>
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
                  Description (150-300 caractères) *
                </Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => updateData({ description: e.target.value })}
                  placeholder="Ex: Livraison rapide de sandwichs, burgers et plats africains à Libreville"
                  maxLength={300}
                  className="mt-1 min-h-[80px]"
                />
                <p className="text-xs mt-1 text-muted-foreground">
                  {data.description.length}/300 caractères
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Logo de l'entreprise (400x400)</Label>
                  <div className="mt-1 relative">
                    {data.logoUrl ? (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Cliquer pour ajouter</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                        />
                      </label>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Image de couverture (1920x1080)</Label>
                  <div className="mt-1 relative">
                    {data.coverImageUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img src={data.coverImageUrl} alt="Couverture" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/50">
                        <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Cliquer pour ajouter</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                        />
                      </label>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Localisation</h3>
              <p className="text-muted-foreground">
                Aidez vos clients à vous trouver facilement
              </p>
            </div>

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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Informations de contact</h3>
              <p className="text-muted-foreground">
                Comment vos clients peuvent-ils vous contacter ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Numéro de téléphone
                </Label>
                <Input
                  id="phone"
                  value={data.businessPhone || ''}
                  onChange={e => updateData({ businessPhone: e.target.value })}
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
                  value={data.businessEmail || ''}
                  onChange={e => updateData({ businessEmail: e.target.value })}
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Créer mon entreprise - Étape {step}/3
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStepContent()}

        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annuler
              </Button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canNext()}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={loading || !canNext()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon entreprise'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};