import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Loader2, CheckCircle, Globe, MapIcon } from "lucide-react";
import { toast } from "sonner";
import { useProvinces, useDepartments, useArrondissements, useQuartiers } from "@/hooks/use-location-data";
import { useGeocoding } from "@/hooks/use-geocoding";
interface LocationData {
  country?: string;
  countryCode?: string;
  region?: string;
  province?: string;
  department?: string;
  arrondissement?: string;
  quartier?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  road?: string;
  houseNumber?: string;
  postcode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  displayName?: string;
}
interface LocationStepProps {
  onLocationChange: (location: LocationData) => void;
  initialLocation?: LocationData;
}
export const LocationStep = ({
  onLocationChange,
  initialLocation = {}
}: LocationStepProps) => {
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [locationMethod, setLocationMethod] = useState<'manual' | 'gps'>('manual');
  const [showDetails, setShowDetails] = useState(false);
  const [skipLocation, setSkipLocation] = useState(false);
  const {
    data: provinces
  } = useProvinces();
  const {
    data: departments
  } = useDepartments(location.province);
  const {
    data: arrondissements
  } = useArrondissements(location.department);
  const {
    data: quartiers
  } = useQuartiers(location.arrondissement);
  const {
    location: detailedLocation,
    isLoading: isGettingLocation,
    getDetailedLocation
  } = useGeocoding();
  const updateLocation = (updates: Partial<LocationData>) => {
    const newLocation = {
      ...location,
      ...updates
    };
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
    updateLocation({
      quartier: quartierName
    });
  };
  const getGPSLocation = async () => {
    try {
      const result = await getDetailedLocation();
      if (result) {
        // Remplir automatiquement tous les champs avec les données détaillées
        const newLocation: LocationData = {
          country: result.country,
          countryCode: result.countryCode,
          region: result.region,
          province: result.province,
          city: result.city,
          district: result.district,
          neighborhood: result.neighborhood,
          road: result.road,
          houseNumber: result.houseNumber,
          postcode: result.postcode,
          address: result.road,
          latitude: result.latitude,
          longitude: result.longitude,
          formattedAddress: result.formattedAddress,
          displayName: result.displayName
        };
        setLocation(newLocation);
        onLocationChange(newLocation);
        setLocationMethod('gps');
        setShowDetails(true);
        toast.success("Position GPS détaillée récupérée avec succès ! 🌍");
      } else {
        toast.error("Impossible de récupérer votre position. Veuillez sélectionner manuellement.");
      }
    } catch (error) {
      console.error('Erreur GPS:', error);
      toast.error("Erreur lors de la récupération de votre position GPS");
    }
  };
  return <div className="space-y-3">
      <div className="text-center space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Renseignez votre localisation pour découvrir les opérateurs près de chez vous
        </p>
        <Button variant="ghost" size="sm" onClick={() => {
        setSkipLocation(true);
        onLocationChange({
          country: 'Gabon'
        }); // Valeur par défaut
      }} className="text-xs text-muted-foreground hover:text-primary">
          Passer cette étape (configurer plus tard)
        </Button>
      </div>

      {!skipLocation && <>
          {/* GPS Option */}
          <Card>
            <CardHeader className="pb-2 bg-white">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Navigation className="h-4 w-4 text-primary" />
                <span>Position GPS automatique</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Obtenez automatiquement tous les détails de votre localisation précise
              </p>
            </CardHeader>
            <CardContent className="pt-3">
          <Button onClick={getGPSLocation} disabled={isGettingLocation} variant={locationMethod === 'gps' ? 'default' : 'outline'} className="w-full">
            {isGettingLocation ? <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Localisation en cours...
              </> : <>
                <MapPin className="h-4 w-4 mr-2" />
                Utiliser ma position GPS
              </>}
          </Button>
          
          {detailedLocation && showDetails && <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Position détaillée trouvée !</span>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {detailedLocation.country && <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Pays:</span>
                      <span>{detailedLocation.country}</span>
                    </div>}
                  
                  {detailedLocation.region && <div className="flex items-center space-x-2">
                      <MapIcon className="h-3 w-3 text-green-500" />
                      <span className="font-medium">Région:</span>
                      <span>{detailedLocation.region}</span>
                    </div>}
                  
                  {detailedLocation.city && <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-orange-500" />
                      <span className="font-medium">Ville:</span>
                      <span>{detailedLocation.city}</span>
                    </div>}
                  
                  {detailedLocation.neighborhood && <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-purple-500" />
                      <span className="font-medium">Quartier:</span>
                      <span>{detailedLocation.neighborhood}</span>
                    </div>}
                  
                  {detailedLocation.road && <div className="flex items-center space-x-2 col-span-2">
                      <MapPin className="h-3 w-3 text-red-500" />
                      <span className="font-medium">Rue:</span>
                      <span>{detailedLocation.road}</span>
                    </div>}
                  
                  {detailedLocation.postcode && <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Code postal:</span>
                      <span>{detailedLocation.postcode}</span>
                    </div>}
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Adresse complète:</span> {detailedLocation.formattedAddress}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="secondary" className="text-xs">
                    GPS: {detailedLocation.latitude.toFixed(6)}, {detailedLocation.longitude.toFixed(6)}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Position vérifiée ✓
                  </Badge>
                </div>
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Manual Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Sélection manuelle</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Choisissez votre localisation étape par étape
          </p>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid gap-2.5">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={provinces?.find(p => p.name === location.province)?.id || ''} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map(province => <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {location.province && departments && departments.length > 0 && <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select value={departments?.find(d => d.name === location.department)?.id || ''} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(department => <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}

            {location.department && arrondissements && arrondissements.length > 0 && <div className="space-y-2">
                <Label htmlFor="arrondissement">Arrondissement</Label>
                <Select value={arrondissements?.find(a => a.name === location.arrondissement)?.id || ''} onValueChange={handleArrondissementChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un arrondissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {arrondissements?.map(arrondissement => <SelectItem key={arrondissement.id} value={arrondissement.id}>
                        {arrondissement.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}

            {location.arrondissement && quartiers && quartiers.length > 0 && <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Select value={quartiers?.find(q => q.name === location.quartier)?.id || ''} onValueChange={handleQuartierChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un quartier" />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers?.map(quartier => <SelectItem key={quartier.id} value={quartier.id}>
                        {quartier.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input id="address" value={location.address || ''} onChange={e => updateLocation({
                address: e.target.value
              })} placeholder="Précision d'adresse (rue, bâtiment...)" />
            </div>
          </div>
        </CardContent>
      </Card>
      </>}
      
      {skipLocation && <div className="text-center p-6 border border-dashed rounded-lg bg-muted/30">
          <div className="space-y-2">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-foreground">
              Localisation configurée plus tard
            </p>
            <p className="text-xs text-muted-foreground">
              Vous pourrez configurer votre localisation dans vos paramètres après l'inscription.
            </p>
          </div>
        </div>}
    </div>;
};