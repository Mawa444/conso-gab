import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PhoneInput } from "@/components/ui/phone-input";
import { Settings, User, Store, Users, Camera, Phone, MapPin, Save, Plus, X } from "lucide-react";
interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  userType?: "client" | "commerçant" | "employé";
  onProfileUpdated?: () => void; // Nouveau callback pour notifier les changements
}
export const ProfileSettings = ({
  open,
  onClose,
  userType = "client",
  onProfileUpdated
}: ProfileSettingsProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    bio: "",
    // Champ UI seulement pour l'instant
    notifications: true,
    // Champ UI seulement pour l'instant
    visibility: true,
    commerceName: "",
    // Champ UI seulement pour l'instant
    commerceType: "",
    // Champ UI seulement pour l'instant
    employeeRole: "",
    // Champ UI seulement pour l'instant
    hasPhone: false,
    hasAddress: false,
    hasBio: false
  });
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !open) return;
      try {
        const {
          data,
          error
        } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
        if (error) {
          console.error('Erreur récupération profil:', error);
          return;
        }
        if (data) {
          const addressParts = [data.quartier, data.arrondissement, data.department, data.province, data.country].filter(Boolean);
          const fullAddress = addressParts.join(', ');
          setProfile({
            name: data.pseudo || "",
            phone: data.phone || "",
            email: user.email || "",
            address: fullAddress,
            bio: "",
            // À implémenter dans le schéma DB plus tard
            notifications: true,
            // À implémenter dans le schéma DB plus tard
            visibility: data.visibility === 'public',
            commerceName: "",
            // À implémenter dans le schéma DB plus tard
            commerceType: "",
            // À implémenter dans le schéma DB plus tard
            employeeRole: "",
            // À implémenter dans le schéma DB plus tard
            hasPhone: Boolean(data.phone),
            hasAddress: Boolean(fullAddress),
            hasBio: false
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchProfile();
  }, [user, open]);
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('user_profiles').update({
        pseudo: profile.name,
        phone: profile.phone,
        visibility: profile.visibility ? 'public' : 'private',
        updated_at: new Date().toISOString()
        // Note: bio, notifications, commerce_name, commerce_type, employee_role 
        // seront ajoutés au schéma DB dans une prochaine version
      }).eq('user_id', user.id);
      if (error) {
        throw error;
      }
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
      });

      // Notifier le parent des changements
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const ProfileTypeSelector = () => <div className="space-y-3">
      <label className="text-sm font-medium">Type de profil</label>
      <div className="flex gap-2">
        {[{
        id: "client",
        label: "Client",
        icon: User
      }, {
        id: "commerçant",
        label: "Commerçant",
        icon: Store
      }, {
        id: "employé",
        label: "Employé",
        icon: Users
      }].map(type => {
        const Icon = type.icon;
        return <Badge key={type.id} variant={userType === type.id ? "default" : "outline"} className="cursor-pointer p-3 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {type.label}
            </Badge>;
      })}
      </div>
    </div>;
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configuration du profil
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-5xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button variant="default" size="sm" className="text-white">
              <Camera className="w-4 h-4 mr-2" />
              Changer la photo
            </Button>
          </div>

          <ProfileTypeSelector />

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-inherit">
                <label className="text-sm font-medium">Nom complet</label>
                <Input value={profile.name} onChange={e => setProfile({
                ...profile,
                name: e.target.value
              })} className="bg-white" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setProfile({
                  ...profile,
                  hasPhone: !profile.hasPhone,
                  phone: profile.hasPhone ? "" : profile.phone
                })} className="text-xs">
                    {profile.hasPhone ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {profile.hasPhone ? "Supprimer" : "Ajouter"}
                  </Button>
                </div>
                {profile.hasPhone ? <PhoneInput value={profile.phone} onChange={phone => setProfile({
                ...profile,
                phone
              })} placeholder="Numéro de téléphone" /> : <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">
                    Aucun numéro de téléphone renseigné
                  </div>}
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={profile.email} onChange={e => setProfile({
                ...profile,
                email: e.target.value
              })} disabled className="bg-muted" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setProfile({
                  ...profile,
                  hasAddress: !profile.hasAddress
                })} className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {profile.hasAddress ? "Masquer" : "Afficher"}
                  </Button>
                </div>
                {profile.hasAddress ? <div>
                    <Input value={profile.address} onChange={e => setProfile({
                  ...profile,
                  address: e.target.value
                })} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Adresse basée sur votre localisation d'inscription
                    </p>
                  </div> : <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">
                    Adresse non affichée dans le profil
                  </div>}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Bio (optionnel)</label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setProfile({
                  ...profile,
                  hasBio: !profile.hasBio,
                  bio: profile.hasBio ? "" : profile.bio
                })} className="text-xs">
                    {profile.hasBio ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {profile.hasBio ? "Supprimer" : "Ajouter"}
                  </Button>
                </div>
                {profile.hasBio ? <Textarea placeholder="Parlez-nous de vous... (fonctionnalité à venir)" value={profile.bio} onChange={e => setProfile({
                ...profile,
                bio: e.target.value
              })} rows={2} disabled className="bg-muted" /> : <div className="rounded-md p-3 text-sm text-muted-foreground bg-white">
                    Aucune biographie ajoutée
                  </div>}
              </div>
            </div>
          </div>

          {/* Informations commerce (si commerçant) */}
          {userType === "commerçant" && <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Store className="w-4 h-4" />
                Informations commerce
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium">Nom du commerce</label>
                  <Input value={profile.commerceName} onChange={e => setProfile({
                ...profile,
                commerceName: e.target.value
              })} placeholder="Fonctionnalité à venir" disabled className="bg-muted" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Type d'activité</label>
                  <Input value={profile.commerceType} onChange={e => setProfile({
                ...profile,
                commerceType: e.target.value
              })} placeholder="Fonctionnalité à venir" disabled className="bg-muted" />
                </div>
              </div>
            </div>}

          {/* Informations employé (si employé) */}
          {userType === "employé" && <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Informations employé
              </h3>
              
              <div>
                <label className="text-sm font-medium">Poste/Rôle</label>
                <Input value={profile.employeeRole} onChange={e => setProfile({
              ...profile,
              employeeRole: e.target.value
            })} placeholder="Fonctionnalité à venir" disabled className="bg-muted" />
              </div>
            </div>}

          {/* Paramètres de confidentialité */}
          <div className="space-y-4">
            <h3 className="font-semibold">Paramètres</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-muted-foreground">Recevoir les notifications push (à venir)</div>
                </div>
                <Switch checked={profile.notifications} onCheckedChange={checked => setProfile({
                ...profile,
                notifications: checked
              })} disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profil visible</div>
                  <div className="text-sm text-muted-foreground">Apparaître dans les recherches</div>
                </div>
                <Switch checked={profile.visibility} onCheckedChange={checked => setProfile({
                ...profile,
                visibility: checked
              })} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};