import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin, 
  Home, 
  Building, 
  Edit, 
  Shield, 
  Eye,
  EyeOff,
  Navigation,
  Trash2
} from "lucide-react";
import { LocationStep } from "@/components/auth/LocationStep";
import { useLocationSecurity } from "@/hooks/use-location-security";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserLocationManagerProps {
  className?: string;
}

interface SavedLocation {
  encrypted_data: string;
  address?: string;
  formatted_address?: string;
  updated_at: string;
}

export const UserLocationManager = ({ className }: UserLocationManagerProps) => {
  const [homeLocation, setHomeLocation] = useState<SavedLocation | null>(null);
  const [officeLocation, setOfficeLocation] = useState<SavedLocation | null>(null);
  const [homePrivacy, setHomePrivacy] = useState<'private' | 'shared_with_contacts'>('private');
  const [officePrivacy, setOfficePrivacy] = useState<'private' | 'public' | 'shared_with_contacts'>('private');
  const [editingLocation, setEditingLocation] = useState<'home' | 'office' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { saveUserLocation, decryptLocation } = useLocationSecurity();

  useEffect(() => {
    loadUserLocations();
  }, []);

  const loadUserLocations = async () => {
    setIsLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Charger la position domicile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('home_location, home_location_type')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.home_location) {
        setHomeLocation(userProfile.home_location as unknown as SavedLocation);
        setHomePrivacy((userProfile.home_location_type as 'private' | 'shared_with_contacts') || 'private');
      }

      // Charger la position bureau (si profil business)
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('office_location, office_location_type')
        .eq('user_id', user.id)
        .single();

      if (businessProfile?.office_location) {
        setOfficeLocation(businessProfile.office_location as unknown as SavedLocation);
        setOfficePrivacy((businessProfile.office_location_type as 'private' | 'public' | 'shared_with_contacts') || 'private');
      }
    } catch (error) {
      console.error('Erreur chargement positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSave = async (locationData: any) => {
    if (!editingLocation) return;

    const location = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address || locationData.road,
      formatted_address: locationData.formattedAddress || locationData.displayName
    };

    await saveUserLocation(location, editingLocation);
    setEditingLocation(null);
    loadUserLocations();
  };

  const updateLocationPrivacy = async (locationType: 'home' | 'office', privacy: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      if (locationType === 'home') {
        await supabase
          .from('user_profiles')
          .update({ home_location_type: privacy })
          .eq('user_id', user.id);
        setHomePrivacy(privacy as any);
      } else {
        await supabase
          .from('business_profiles')
          .update({ office_location_type: privacy })
          .eq('user_id', user.id);
        setOfficePrivacy(privacy as any);
      }

      toast.success('Paramètres de confidentialité mis à jour');
    } catch (error) {
      console.error('Erreur mise à jour confidentialité:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteLocation = async (locationType: 'home' | 'office') => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      if (locationType === 'home') {
        await supabase
          .from('user_profiles')
          .update({ 
            home_location: null, 
            home_location_type: 'private',
            location_updated_at: null
          })
          .eq('user_id', user.id);
        setHomeLocation(null);
      } else {
        await supabase
          .from('business_profiles')
          .update({ 
            office_location: null, 
            office_location_type: 'private',
            office_location_updated_at: null
          })
          .eq('user_id', user.id);
        setOfficeLocation(null);
      }

      toast.success(`Position ${locationType === 'home' ? 'domicile' : 'bureau'} supprimée`);
    } catch (error) {
      console.error('Erreur suppression position:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const renderLocationCard = (
    title: string,
    icon: any,
    location: SavedLocation | null,
    privacy: string,
    locationType: 'home' | 'office'
  ) => {
    const decryptedLocation = location ? decryptLocation(location.encrypted_data) : null;
    
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
            {location && (
              <Badge variant="outline" className="ml-auto">
                Configurée
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {location && decryptedLocation ? (
            <div className="space-y-4">
              {/* Adresse */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Adresse enregistrée</p>
                <p className="text-sm text-gray-600">
                  {location.formatted_address || `${decryptedLocation.latitude}, ${decryptedLocation.longitude}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mis à jour le {new Date(location.updated_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Paramètres de confidentialité */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Confidentialité
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Privé</span>
                    </div>
                    <Switch
                      checked={privacy === 'private'}
                      onCheckedChange={(checked) => 
                        updateLocationPrivacy(locationType, checked ? 'private' : 'shared_with_contacts')
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Partagé avec mes contacts</span>
                    </div>
                    <Switch
                      checked={privacy === 'shared_with_contacts'}
                      onCheckedChange={(checked) => 
                        updateLocationPrivacy(locationType, checked ? 'shared_with_contacts' : 'private')
                      }
                    />
                  </div>

                  {locationType === 'office' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Public (visible dans le profil business)</span>
                      </div>
                      <Switch
                        checked={privacy === 'public'}
                        onCheckedChange={(checked) => 
                          updateLocationPrivacy(locationType, checked ? 'public' : 'private')
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => setEditingLocation(locationType)}
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  onClick={() => deleteLocation(locationType)}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Navigation className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Aucune position {locationType === 'home' ? 'domicile' : 'bureau'} configurée
              </p>
              <Button 
                onClick={() => setEditingLocation(locationType)}
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Définir la position
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Mes Positions</h2>
            <p className="text-sm text-muted-foreground">
              Gérez vos positions de base et leur confidentialité
            </p>
          </div>
        </div>

        {/* Avertissement sécurité */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800">Sécurité et confidentialité</p>
                <p className="text-sm text-blue-700">
                  Vos positions sont chiffrées et ne sont jamais partagées sans votre autorisation explicite. 
                  Vous contrôlez qui peut voir ces informations et quand.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartes de position */}
        <div className="grid gap-6 md:grid-cols-2">
          {renderLocationCard(
            "Position Domicile",
            <Home className="w-5 h-5 text-blue-500" />,
            homeLocation,
            homePrivacy,
            'home'
          )}

          {renderLocationCard(
            "Position Bureau",
            <Building className="w-5 h-5 text-green-500" />,
            officeLocation,
            officePrivacy,
            'office'
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      <Dialog 
        open={editingLocation !== null} 
        onOpenChange={(open) => !open && setEditingLocation(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation === 'home' ? 'Configurer la position domicile' : 'Configurer la position bureau'}
            </DialogTitle>
          </DialogHeader>
          
          {editingLocation && (
            <LocationStep
              onLocationChange={handleLocationSave}
              initialLocation={
                editingLocation === 'home' 
                  ? (homeLocation ? decryptLocation(homeLocation.encrypted_data) : {})
                  : (officeLocation ? decryptLocation(officeLocation.encrypted_data) : {})
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};