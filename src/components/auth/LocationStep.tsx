import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProvinces, useDepartments, useArrondissements, useQuartiers } from "@/hooks/use-location-data";

interface LocationData {
  country?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationStepProps {
  onLocationChange: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export const LocationStep = ({ onLocationChange, initialLocation = {} }: LocationStepProps) => {
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'manual' | 'gps'>('manual');

  const { data: provinces } = useProvinces();
  const { data: departments } = useDepartments(location.province);
  const { data: arrondissements } = useArrondissements(location.department);
  const { data: quartiers } = useQuartiers(location.arrondissement);

  const updateLocation = (updates: Partial<LocationData>) => {
    const newLocation = { ...location, ...updates };
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  const handleProvinceChange = (value: string) => {
    const provinceName = provinces?.find(p => p.id === value)?.name;
    updateLocation({
      province: provinceName,
      department: undefined,
      arrondissement: undefined,
      quartier: undefined
    });
  };

  const handleDepartmentChange = (value: string) => {
    const departmentName = departments?.find(d => d.id === value)?.name;
    updateLocation({
      department: departmentName,
      arrondissement: undefined,
      quartier: undefined
    });
  };

  const handleArrondissementChange = (value: string) => {
    const arrondissementName = arrondissements?.find(a => a.id === value)?.name;
    updateLocation({
      arrondissement: arrondissementName,
      quartier: undefined
    });
  };

  const handleQuartierChange = (value: string) => {
    const quartierName = quartiers?.find(q => q.id === value)?.name;
    updateLocation({ quartier: quartierName });
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation({ latitude, longitude });
        setLocationMethod('gps');
        setIsGettingLocation(false);
        toast.success("Position GPS enregistrée avec succès");
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Erreur lors de la récupération de votre position";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position indisponible";
            break;
          case error.TIMEOUT:
            message = "Délai d'attente dépassé";
            break;
        }
        
        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Renseignez votre localisation pour découvrir les opérateurs près de chez vous
        </p>
      </div>

      {/* GPS Option */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Position GPS automatique</h3>
              <p className="text-xs text-muted-foreground">Utiliser votre position actuelle</p>
            </div>
          </div>
          <Button
            onClick={getGPSLocation}
            disabled={isGettingLocation}
            variant={locationMethod === 'gps' ? 'default' : 'outline'}
            size="sm"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {isGettingLocation ? 'Localisation...' : 'Localiser'}
          </Button>
        </div>
        
        {location.latitude && location.longitude && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="secondary" className="text-xs">
              Position GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Badge>
          </div>
        )}
      </Card>

      {/* Manual Selection */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Sélection manuelle</h3>
          </div>

          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select
                value={provinces?.find(p => p.name === location.province)?.id || ''}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {location.province && departments && departments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select
                  value={departments?.find(d => d.name === location.department)?.id || ''}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {location.department && arrondissements && arrondissements.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="arrondissement">Arrondissement</Label>
                <Select
                  value={arrondissements?.find(a => a.name === location.arrondissement)?.id || ''}
                  onValueChange={handleArrondissementChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un arrondissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {arrondissements?.map((arrondissement) => (
                      <SelectItem key={arrondissement.id} value={arrondissement.id}>
                        {arrondissement.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {location.arrondissement && quartiers && quartiers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Select
                  value={quartiers?.find(q => q.name === location.quartier)?.id || ''}
                  onValueChange={handleQuartierChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un quartier" />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers?.map((quartier) => (
                      <SelectItem key={quartier.id} value={quartier.id}>
                        {quartier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input
                id="address"
                value={location.address || ''}
                onChange={(e) => updateLocation({ address: e.target.value })}
                placeholder="Précision d'adresse (rue, bâtiment...)"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};