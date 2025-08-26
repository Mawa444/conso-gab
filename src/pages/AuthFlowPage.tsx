import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { WelcomePage } from "./WelcomePage";
import { MissionPage } from "./MissionPage";
import { IdentityCreationPage } from "./IdentityCreationPage";
import { LocationPage } from "./LocationPage";
import { ProfileChoicePage } from "./ProfileChoicePage";
import { ConsumerRegistrationPage } from "./ConsumerRegistrationPage";
import { MerchantRegistrationPage } from "./MerchantRegistrationPage";
import { FinalWelcomePage } from "./FinalWelcomePage";
import { LoginPage } from "./LoginPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuthStep = 
  | 'welcome'
  | 'mission' 
  | 'identity'
  | 'location'
  | 'profile-choice' 
  | 'consumer-registration'
  | 'merchant-registration'
  | 'final-welcome'
  | 'login' 
  | 'complete';

interface IdentityData {
  pseudo: string;
  firstName?: string;
  lastName?: string;
}

interface LocationData {
  useGPS: boolean;
  manualLocation?: string;
}

interface AuthFlowPageProps {
  onComplete: () => void;
}

export const AuthFlowPage = ({ onComplete }: AuthFlowPageProps) => {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('welcome');
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'merchant'>('consumer');
  const [identityData, setIdentityData] = useState<IdentityData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Si en cours de chargement, on peut afficher un loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#009739] via-[#FFD100] to-[#0066B3]">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    switch (step) {
      case 'mission':
        setStep('welcome');
        break;
      case 'identity':
        setStep('mission');
        break;
      case 'location':
        setStep('identity');
        break;
      case 'profile-choice':
        setStep('location');
        break;
      case 'consumer-registration':
        setStep('profile-choice');
        break;
      case 'merchant-registration':
        setStep('profile-choice');
        break;
      case 'login':
        setStep('welcome');
        break;
      default:
        setStep('welcome');
    }
  };

  const handleIdentityCreation = (data: IdentityData) => {
    setIdentityData(data);
    setStep('location');
  };

  const handleLocationChoice = (data: LocationData) => {
    setLocationData(data);
    setStep('profile-choice');
  };

  const handleProfileChoice = (role: 'consumer' | 'merchant') => {
    setSelectedRole(role);
    if (role === 'consumer') {
      setStep('consumer-registration');
    } else {
      setStep('merchant-registration');
    }
  };

  const handleConsumerRegistration = async (formData: any) => {
    if (!identityData) return;
    
    setRegistrationLoading(true);
    try {
      const userData = {
        role: 'consumer' as const,
        pseudo: identityData.pseudo,
        phone: formData.phone,
        visibility: formData.visibility,
        profile_picture_url: null // TODO: Handle file upload
      };

      const { error } = await signUp(
        formData.email || `${identityData.pseudo}@consogab.app`,
        'TempPassword123!', // Temporary password for OAuth users
        userData
      );

      if (error) throw error;

      setStep('final-welcome');
    } catch (error: any) {
      console.error('Consumer registration error:', error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleMerchantRegistration = async (formData: any) => {
    if (!identityData) return;
    
    setRegistrationLoading(true);
    try {
      const userData = {
        role: 'merchant' as const,
        pseudo: identityData.pseudo,
        phone: formData.businessPhone,
        visibility: formData.visibility,
        profile_picture_url: null // TODO: Handle file upload
      };

      const { error } = await signUp(
        formData.businessEmail || `${identityData.pseudo}@consogab.app`,
        'TempPassword123!', // Temporary password for OAuth users
        userData
      );

      if (error) throw error;

      setStep('final-welcome');
    } catch (error: any) {
      console.error('Merchant registration error:', error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleFinalComplete = () => {
    navigate('/');
  };

  const handleForgotPassword = () => {
    // TODO: Implémenter la récupération de mot de passe
    console.log('Forgot password flow');
  };

  switch (step) {
    case 'welcome':
      return (
        <div className="relative">
          <WelcomePage onNext={() => setStep('mission')} />
          
          {/* Lien vers connexion en bas */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <button
              onClick={() => setStep('login')}
              className="text-muted-foreground/90 hover:text-foreground text-sm underline"
            >
              Déjà inscrit ? Se connecter
            </button>
          </div>
        </div>
      );

    case 'mission':
      return (
        <MissionPage onNext={() => setStep('identity')} />
      );

    case 'identity':
      return (
        <IdentityCreationPage
          onNext={handleIdentityCreation}
          onBack={handleBack}
        />
      );

    case 'location':
      return (
        <LocationPage
          onNext={handleLocationChoice}
          onBack={handleBack}
        />
      );

    case 'profile-choice':
      return (
        <ProfileChoicePage
          onChoice={handleProfileChoice}
          onBack={handleBack}
        />
      );

    case 'consumer-registration':
      return identityData && locationData ? (
        <ConsumerRegistrationPage
          identityData={identityData}
          locationData={locationData}
          onNext={handleConsumerRegistration}
          onBack={handleBack}
        />
      ) : null;

    case 'merchant-registration':
      return identityData && locationData ? (
        <MerchantRegistrationPage
          identityData={identityData}
          locationData={locationData}
          onNext={handleMerchantRegistration}
          onBack={handleBack}
        />
      ) : null;

    case 'final-welcome':
      return identityData ? (
        <FinalWelcomePage
          userRole={selectedRole}
          userName={identityData.pseudo}
          onComplete={handleFinalComplete}
        />
      ) : null;

    case 'login':
      return (
        <LoginPage
          onBack={handleBack}
          onSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
        />
      );

    default:
      return null;
  }
};