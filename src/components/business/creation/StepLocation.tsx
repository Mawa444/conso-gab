import { MapPin } from 'lucide-react';
import { LocationStep } from '@/components/auth/LocationStep';
import { useBusinessCreationContext } from './BusinessCreationContext';

export const StepLocation = () => {
  const { formData, updateFormData } = useBusinessCreationContext();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Localisation</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Aidez vos clients à vous trouver
        </p>
      </div>

      <LocationStep
        initialLocation={{
          country: formData.country,
          province: formData.province,
          department: formData.department,
          arrondissement: formData.arrondissement,
          quartier: formData.quartier,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }}
        onLocationChange={(location) => {
          updateFormData({
            country: location.country,
            province: location.province,
            department: location.department,
            arrondissement: location.arrondissement,
            quartier: location.quartier,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }}
      />
    </div>
  );
};
