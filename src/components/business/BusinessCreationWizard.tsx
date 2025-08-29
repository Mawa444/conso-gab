import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LocationStep } from "@/components/auth/LocationStep";
import { Loader2, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

interface BusinessCreationWizardProps {
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}

interface BusinessCreationData {
  businessName: string;
  businessCategory: string;
  description?: string;
  businessPhone?: string;
  businessEmail?: string;
  website?: string;
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const BusinessCreationWizard = ({ onCancel, onCreated }: BusinessCreationWizardProps) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<BusinessCreationData>>({});
  const { refreshBusinessProfiles, switchMode } = useProfileMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canNext = () => {
    if (step === 0) return !!data.businessName && !!data.businessCategory;
    if (step === 1) return true; // contact facultatif
    if (step === 2) return !!data.province || (!!data.latitude && !!data.longitude);
    return true;
  };

  const categoryOptions = [
    { value: "artisan", label: "Artisan" },
    { value: "commerce", label: "Commerce" },
    { value: "service", label: "Service" },
    { value: "restauration", label: "Restauration" },
    { value: "technologie", label: "Technologie" },
    { value: "transport", label: "Transport" },
  ];

  const categoryMap: Record<string, string> = {
    artisan: "manufacturing",
    commerce: "retail",
    service: "services",
    restauration: "restaurant",
    technologie: "technology",
    transport: "automotive",
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }
      if (!data.businessName || !data.businessCategory) {
        toast.error("Veuillez renseigner le nom et la catégorie");
        return;
      }

      const mappedCategory = categoryMap[data.businessCategory] || "other";

      // Créer le profil business avec tous les champs nécessaires pour la visibilité
      const { data: inserted, error } = await supabase
        .from("business_profiles")
        .insert({
          user_id: user.id,
          business_name: data.businessName,
          business_category: mappedCategory as any,
          description: data.description,
          phone: data.businessPhone,
          email: data.businessEmail,
          website: data.website,
          country: data.country || "Gabon",
          province: data.province,
          department: data.department,
          arrondissement: data.arrondissement,
          quartier: data.quartier,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          // Garantir que l'entreprise est visible par tous
          is_active: true,
          is_sleeping: false,
          is_deactivated: false,
          is_verified: false,
          is_primary: true
        })
        .select("*")
        .single();

      if (error) {
        console.error("Erreur création business_profiles:", error);
        throw error;
      }

      const newBusinessId = inserted?.id as string;
      
      // Note: Le trigger create_business_owner_collaborator() devrait créer automatiquement
      // le collaborateur owner, mais on le fait manuellement pour être sûr
      const { error: collaboratorError } = await supabase
        .from("business_collaborators")
        .insert({
          business_id: newBusinessId,
          user_id: user.id,
          role: "owner",
          status: "accepted",
          accepted_at: new Date().toISOString(),
          permissions: { all: true }
        });

      if (collaboratorError) {
        console.error("Erreur création collaborateur:", collaboratorError);
        // Ne pas échouer si le trigger a déjà créé le collaborateur
      }

      toast.success(`Entreprise "${data.businessName}" créée avec succès 🇬🇦`);

      // Rafraîchir les profils et basculer automatiquement en mode business
      await refreshBusinessProfiles();
      await switchMode("business", newBusinessId, navigate);
 
      onCreated?.(newBusinessId);
    } catch (e: any) {
      console.error("Erreur création business:", e);
      toast.error(e.message || "Impossible de créer l'entreprise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Créer une nouvelle entreprise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Étapes */}
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={step >= 0 ? "default" : "outline"}>Infos</Badge>
          <Separator className="flex-1" />
          <Badge variant={step >= 1 ? "default" : "outline"}>Contact</Badge>
          <Separator className="flex-1" />
          <Badge variant={step >= 2 ? "default" : "outline"}>Localisation</Badge>
          <Separator className="flex-1" />
          <Badge variant={step >= 3 ? "default" : "outline"}>Validation</Badge>
        </div>

        {step === 0 && (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nom de l'entreprise *</Label>
              <Input
                id="businessName"
                value={data.businessName || ""}
                onChange={(e) => setData((p) => ({ ...p, businessName: e.target.value }))}
                placeholder="Mon Entreprise Gabonaise"
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie d'activité *</Label>
              <Select
                value={data.businessCategory || ""}
                onValueChange={(v) => setData((p) => ({ ...p, businessCategory: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Description de l'activité</Label>
              <Input
                id="businessDescription"
                value={data.description || ""}
                onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Décrivez brièvement votre activité..."
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!canNext()}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Téléphone professionnel</Label>
              <Input
                id="businessPhone"
                value={data.businessPhone || ""}
                onChange={(e) => setData((p) => ({ ...p, businessPhone: e.target.value }))}
                placeholder="+241 XX XX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Email professionnel</Label>
              <Input
                id="businessEmail"
                type="email"
                value={data.businessEmail || ""}
                onChange={(e) => setData((p) => ({ ...p, businessEmail: e.target.value }))}
                placeholder="contact@monentreprise.ga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessWebsite">Site web (optionnel)</Label>
              <Input
                id="businessWebsite"
                type="url"
                value={data.website || ""}
                onChange={(e) => setData((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://monentreprise.ga"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button onClick={() => setStep(2)}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <LocationStep
              onLocationChange={(loc) =>
                setData((p) => ({
                  ...p,
                  country: loc.country,
                  province: loc.province || loc.region,
                  department: loc.department,
                  arrondissement: loc.arrondissement,
                  quartier: loc.quartier || loc.neighborhood,
                  address: loc.address || loc.formattedAddress,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))
              }
              initialLocation={{
                country: data.country,
                province: data.province,
                department: data.department,
                arrondissement: data.arrondissement,
                quartier: data.quartier,
                address: data.address,
              }}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canNext()}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">Tout est prêt. Validez pour créer votre profil business.</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button onClick={handleCreate} disabled={loading} className="min-w-[8rem]">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
