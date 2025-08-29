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

interface BusinessCreationWizardProps {
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}

interface BusinessCreationData {
  businessName: string;
  businessCategory: string;
  businessPhone?: string;
  businessEmail?: string;
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

      const { data: inserted, error } = await supabase
        .from("business_profiles")
        .insert({
          user_id: user.id,
          business_name: data.businessName,
          business_category: mappedCategory as any,
          phone: data.businessPhone,
          email: data.businessEmail,
          country: data.country,
          province: data.province,
          department: data.department,
          arrondissement: data.arrondissement,
          quartier: data.quartier,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      const newId = inserted?.id as string;
      toast.success("Entreprise créée avec succès 🇬🇦");

      // Rafraîchir les profils et basculer automatiquement en mode business
      await refreshBusinessProfiles();
      await switchMode("business", newId);

      onCreated?.(newId);
    } catch (e: any) {
      toast.error(e.message || "Création impossible");
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
