import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LocationStep } from "@/components/auth/LocationStep";
import { Loader2, Building2, ArrowLeft, ArrowRight, CheckCircle2, Upload, MapPin, Clock, Phone, CreditCard, Users, Rocket, Info, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/components/auth/AuthProvider";
interface BusinessCreationWizardProps {
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}
interface BusinessCreationData {
  // Étape 1: Informations de base
  businessName: string;
  businessCategory: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;

  // Étape 2: Localisation
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  deliveryZones?: string[];

  // Étape 3: Détails pratiques
  businessPhone?: string;
  whatsapp?: string;
  businessEmail?: string;
  website?: string;
  openingHours?: string;

  // Étape 4: Paiements & gestion
  bankAccount?: string;
  mobileMoney?: string;
  associatedUsers?: string[];

  // Étape 5: Validation
  isVerified?: boolean;
}
const businessCategories = [{
  value: "restaurant",
  label: "Restauration"
}, {
  value: "retail",
  label: "Commerce"
}, {
  value: "services",
  label: "Services"
}, {
  value: "automotive",
  label: "Automobile"
}, {
  value: "beauty",
  label: "Beauté & Bien-être"
}, {
  value: "healthcare",
  label: "Santé"
}, {
  value: "education",
  label: "Éducation"
}, {
  value: "real_estate",
  label: "Immobilier"
}, {
  value: "entertainment",
  label: "Hôtellerie"
}, {
  value: "technology",
  label: "Technologie"
}, {
  value: "other",
  label: "Autres"
}];
export const BusinessCreationWizard = ({
  onCancel,
  onCreated
}: BusinessCreationWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<BusinessCreationData>>({
    country: 'Gabon'
  });
  const {
    refreshBusinessProfiles
  } = useProfileMode();
  const {
    user
  } = useAuth();
  const steps = [{
    number: 1,
    title: "Informations de base",
    icon: Building2
  }, {
    number: 2,
    title: "Localisation",
    icon: MapPin
  }, {
    number: 3,
    title: "Détails pratiques",
    icon: Clock
  }, {
    number: 4,
    title: "Paiements & gestion",
    icon: CreditCard
  }, {
    number: 5,
    title: "Validation & mise en ligne",
    icon: Rocket
  }];
  const canNext = () => {
    switch (step) {
      case 1:
        return !!(data.businessName?.trim() && data.businessCategory && data.description?.trim());
      case 2:
        return !!(data.province || data.latitude && data.longitude);
      case 3:
        return true;
      // Optionnel
      case 4:
        return true;
      // Optionnel
      case 5:
        return true;
      default:
        return false;
    }
  };
  const handleNext = () => {
    if (step < 5 && canNext()) {
      setStep(step + 1 as typeof step);
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1 as typeof step);
    }
  };
  const handleCreate = async () => {
    if (!user || !canNext()) return;
    setLoading(true);
    try {
      const businessData = {
        user_id: user.id,
        business_name: data.businessName!,
        business_category: data.businessCategory! as any,
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
        is_active: true,
        is_verified: false
      };
      const {
        data: businessProfile,
        error
      } = await supabase.from('business_profiles').insert(businessData).select().single();
      if (error) throw error;
      await refreshBusinessProfiles();
      toast.success("🎉 Entreprise créée avec succès !");
      if (onCreated) {
        onCreated(businessProfile.id);
      }
    } catch (error) {
      console.error('Erreur création entreprise:', error);
      toast.error("Erreur lors de la création de l'entreprise");
    } finally {
      setLoading(false);
    }
  };
  const updateData = (updates: Partial<BusinessCreationData>) => {
    setData(prev => ({
      ...prev,
      ...updates
    }));
  };
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <div className="space-y-6">
            <div className="text-center mb-6 bg-white">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2 text-[3a75c4] text-[#3a75c4]/[0.97]">Informations de base</h3>
              <p className="text-muted-foreground">
                Présentez votre entreprise de manière claire et attractive
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-semibold">
                  Nom de l'entreprise *
                </Label>
                <Input id="businessName" value={data.businessName || ''} onChange={e => updateData({
                businessName: e.target.value
              })} placeholder="Ex: Le Snack Gabonais - Sandwichs et Livraisons" className="mt-1 bg-white rounded-3xl" />
                <p className="text-xs text-muted-foreground mt-1">
                  Choisissez un nom optimisé pour être trouvé facilement
                </p>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-semibold">
                  Catégorie *
                </Label>
                <Select value={data.businessCategory} onValueChange={value => updateData({
                businessCategory: value
              })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description (150-300 caractères) *
                </Label>
                <Textarea id="description" value={data.description || ''} onChange={e => updateData({
                description: e.target.value
              })} placeholder="Ex: Livraison rapide de sandwichs, burgers et plats africains à Libreville" maxLength={300} className="mt-1 min-h-[80px] bg-white rounded-3xl" />
                <p className="text-xs text-muted-foreground mt-1">
                  {data.description?.length || 0}/300 - Optimisée pour le référencement interne
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Logo de l'entreprise</Label>
                  <div className="mt-1 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">À venir</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Image de couverture</Label>
                  <div className="mt-1 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">À venir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>;
      case 2:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Localisation</h3>
              <p className="text-muted-foreground">
                Aidez vos clients à vous trouver facilement
              </p>
            </div>

            <LocationStep initialLocation={{
            country: data.country || 'Gabon',
            province: data.province,
            department: data.department,
            arrondissement: data.arrondissement,
            quartier: data.quartier,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude
          }} onLocationChange={location => {
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
          }} />

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" />
                Zones de livraison (optionnel)
              </h4>
              <Input placeholder="Ex: Libreville, Akanda, Owendo..." className="mt-2" onChange={e => updateData({
              deliveryZones: e.target.value.split(',').map(z => z.trim())
            })} />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les zones par des virgules
              </p>
            </div>
          </div>;
      case 3:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <Clock className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Détails pratiques</h3>
              <p className="text-muted-foreground">
                Informations de contact et horaires
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Numéro de téléphone
                </Label>
                <Input id="phone" value={data.businessPhone || ''} onChange={e => updateData({
                businessPhone: e.target.value
              })} placeholder="+241 xx xx xx xx" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-sm font-semibold">
                  WhatsApp
                </Label>
                <Input id="whatsapp" value={data.whatsapp || ''} onChange={e => updateData({
                whatsapp: e.target.value
              })} placeholder="+241 xx xx xx xx" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email professionnel
                </Label>
                <Input id="email" type="email" value={data.businessEmail || ''} onChange={e => updateData({
                businessEmail: e.target.value
              })} placeholder="contact@monentreprise.ga" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-semibold">
                  Site web
                </Label>
                <Input id="website" value={data.website || ''} onChange={e => updateData({
                website: e.target.value
              })} placeholder="https://monentreprise.ga" className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="hours" className="text-sm font-semibold">
                Horaires d'ouverture
              </Label>
              <Textarea id="hours" value={data.openingHours || ''} onChange={e => updateData({
              openingHours: e.target.value
            })} placeholder="Lun-Ven: 8h-18h, Sam: 8h-14h, Dim: Fermé" className="mt-1" rows={3} />
            </div>
          </div>;
      case 4:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Paiements & gestion</h3>
              <p className="text-muted-foreground">
                Configuration des moyens de paiement et équipe
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3">💳 Moyens de paiement</h4>
              <p className="text-muted-foreground mb-4">
                Fonctionnalité à venir - Compte séquestre et Mobile Money
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">Compte bancaire</Label>
                  <Input placeholder="À configurer prochainement" disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mobile Money</Label>
                  <Input placeholder="À configurer prochainement" disabled className="mt-1" />
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Équipe & collaborateurs
              </h4>
              <p className="text-muted-foreground mb-4">
                Ajoutez des employés, livreurs ou gestionnaires (optionnel)
              </p>
              
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Vous pourrez ajouter votre équipe après la création
                </p>
              </div>
            </div>
          </div>;
      case 5:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <Rocket className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Validation & mise en ligne</h3>
              <p className="text-muted-foreground">
                Vérifiez vos informations avant de lancer votre entreprise
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-lg">📋 Récapitulatif</h4>
              
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="font-medium">Nom:</span>
                  <span>{data.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Catégorie:</span>
                  <span>{businessCategories.find(c => c.value === data.businessCategory)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Localisation:</span>
                  <span className="text-right">
                    {data.quartier && `${data.quartier}, `}
                    {data.department && `${data.department}, `}
                    {data.province}
                  </span>
                </div>
                {data.businessPhone && <div className="flex justify-between">
                    <span className="font-medium">Téléphone:</span>
                    <span>{data.businessPhone}</span>
                  </div>}
              </div>
              
              <Separator />
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                      Prêt pour le lancement !
                    </h5>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Votre entreprise sera visible par tous les utilisateurs de Consogab et indexée dans notre moteur de recherche.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h5 className="font-semibold mb-2">🚀 Après la création</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bascule automatique sur votre profil business</li>
                <li>• Ajout de produits et services</li>
                <li>• Gestion des commandes et clients</li>
                <li>• Badge "vérifié" disponible avec justificatifs</li>
              </ul>
            </div>
          </div>;
      default:
        return null;
    }
  };
  return <Card className="w-full max-w-4xl mx-auto bg-background/95 backdrop-blur-sm shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Créer mon entreprise
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Simplicité, rapidité et professionnalisation
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((s, index) => <div key={s.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step >= s.number ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-muted-foreground/30'}`}>
                {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              {index < steps.length - 1 && <div className={`w-16 h-0.5 mx-2 ${step > s.number ? 'bg-primary' : 'bg-muted-foreground/30'}`} />}
            </div>)}
        </div>

        <div className="flex justify-center mt-3">
          <Badge variant={step === 5 ? "default" : "secondary"} className="text-xs rounded-3xl bg-[fcd116] bg-[#fcd116]/[0.96]">
            Étape {step}/5: {steps[step - 1].title}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1} className="px-6 text-white bg-slate-600 hover:bg-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} className="bg-red-600 hover:bg-red-500 text-white rounded-3xl">
              Annuler
            </Button>

            {step < 5 ? <Button onClick={handleNext} disabled={!canNext()} className="px-6 from-primary to-accent text-white bg-[3a75c4] bg-[#3a75c4]/[0.96] rounded-3xl">
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button> : <Button onClick={handleCreate} disabled={loading || !canNext()} className="px-8 bg-gradient-to-r from-primary to-accent text-white" size="lg">
                {loading ? <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création en cours...
                  </> : <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Lancer mon entreprise
                  </>}
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
};