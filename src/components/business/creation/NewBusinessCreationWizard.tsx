import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { BusinessCreationProvider, useBusinessCreationContext, BusinessFormData } from './BusinessCreationContext';
import { StepIndicator } from './StepIndicator';
import { StepBasicInfo } from './StepBasicInfo';
import { StepLocation } from './StepLocation';
import { StepContact } from './StepContact';

interface Props {
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}

const WizardContent = ({ onCancel, onCreated }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshBusinessProfiles } = useProfileMode();
  const [loading, setLoading] = useState(false);
  
  const {
    formData,
    currentStep,
    totalSteps,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    resetFormData,
  } = useBusinessCreationContext();

  const handleCancel = () => {
    resetFormData();
    if (onCancel) {
      onCancel();
    } else {
      navigate('/entreprises');
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);

    try {
      // Cast pour le type Supabase
      type BusinessCategory = 'agriculture' | 'automotive' | 'beauty' | 'education' | 'entertainment' | 'finance' | 'fitness' | 'healthcare' | 'manufacturing' | 'other' | 'real_estate' | 'restaurant' | 'retail' | 'services' | 'technology';

      const businessData = {
        user_id: user.id,
        business_name: formData.businessName.trim(),
        business_category: formData.businessCategory as BusinessCategory,
        description: formData.description.trim(),
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        website: formData.website || null,
        address: formData.address || null,
        country: formData.country || 'Gabon',
        province: formData.province || null,
        department: formData.department || null,
        arrondissement: formData.arrondissement || null,
        quartier: formData.quartier || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        is_active: true,
        is_verified: false,
      };

      const { data: business, error } = await supabase
        .from('business_profiles')
        .insert([businessData])
        .select()
        .single();

      if (error) throw error;

      await refreshBusinessProfiles();
      toast.success('Entreprise créée avec succès !');
      resetFormData();

      if (onCreated) {
        onCreated(business.id);
      } else {
        navigate(`/business/${business.id}/profile`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepLocation />;
      case 3:
        return <StepContact />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="p-6">
        <StepIndicator />
        
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex justify-between gap-4 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={canGoBack ? goBack : handleCancel}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {canGoBack ? 'Retour' : 'Annuler'}
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleCreate}
              disabled={loading || !canGoNext}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Créer l'entreprise
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canGoNext}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const NewBusinessCreationWizard = (props: Props) => {
  return (
    <BusinessCreationProvider>
      <WizardContent {...props} />
    </BusinessCreationProvider>
  );
};

export default NewBusinessCreationWizard;
