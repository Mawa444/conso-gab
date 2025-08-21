import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Store, Users, Camera, Phone, MapPin, Save } from "lucide-react";

interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  userType?: "client" | "commerçant" | "employé";
}

export const ProfileSettings = ({ open, onClose, userType = "client" }: ProfileSettingsProps) => {
  const [profile, setProfile] = useState({
    name: "Marie Nzé",
    phone: "+241 01 23 45 67",
    email: "marie.nze@email.com",
    address: "Quartier Nombakélé, Libreville",
    bio: "",
    notifications: true,
    visibility: true,
    commerceName: "Boulangerie Chez Mama Nzé",
    commerceType: "Boulangerie",
    employeeRole: "Vendeuse"
  });

  const handleSave = () => {
    console.log("Profil sauvegardé:", profile);
    onClose();
  };

  const ProfileTypeSelector = () => (
    <div className="space-y-3">
      <label className="text-sm font-medium">Type de profil</label>
      <div className="flex gap-2">
        {[
          { id: "client", label: "Client", icon: User },
          { id: "commerçant", label: "Commerçant", icon: Store },
          { id: "employé", label: "Employé", icon: Users }
        ].map(type => {
          const Icon = type.icon;
          return (
            <Badge
              key={type.id}
              variant={userType === type.id ? "default" : "outline"}
              className="cursor-pointer p-3 flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-white">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
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
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Adresse</label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio (optionnel)</label>
                <Textarea
                  placeholder="Parlez-nous de vous..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Informations commerce (si commerçant) */}
          {userType === "commerçant" && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Store className="w-4 h-4" />
                Informations commerce
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium">Nom du commerce</label>
                  <Input
                    value={profile.commerceName}
                    onChange={(e) => setProfile({ ...profile, commerceName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Type d'activité</label>
                  <Input
                    value={profile.commerceType}
                    onChange={(e) => setProfile({ ...profile, commerceType: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informations employé (si employé) */}
          {userType === "employé" && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Informations employé
              </h3>
              
              <div>
                <label className="text-sm font-medium">Poste/Rôle</label>
                <Input
                  value={profile.employeeRole}
                  onChange={(e) => setProfile({ ...profile, employeeRole: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Paramètres de confidentialité */}
          <div className="space-y-4">
            <h3 className="font-semibold">Paramètres</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-muted-foreground">Recevoir les notifications push</div>
                </div>
                <Switch
                  checked={profile.notifications}
                  onCheckedChange={(checked) => setProfile({ ...profile, notifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profil visible</div>
                  <div className="text-sm text-muted-foreground">Apparaître dans les recherches</div>
                </div>
                <Switch
                  checked={profile.visibility}
                  onCheckedChange={(checked) => setProfile({ ...profile, visibility: checked })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};