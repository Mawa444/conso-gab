import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { SplashScreen } from "./SplashScreen";
import { ProfileChoicePage } from "./ProfileChoicePage";
import { RegistrationPage } from "./RegistrationPage";
import { OnboardingPage } from "./OnboardingPage";
import { LoginPage } from "./LoginPage";

type AuthStep = 
  | 'splash' 
  | 'profile-choice' 
  | 'registration' 
  | 'login' 
  | 'onboarding' 
  | 'complete';

interface AuthFlowPageProps {
  onComplete: () => void;
}

export const AuthFlowPage = ({ onComplete }: AuthFlowPageProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('splash');
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'merchant'>('consumer');

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
      case 'profile-choice':
        setStep('splash');
        break;
      case 'registration':
        setStep('profile-choice');
        break;
      case 'login':
        setStep('splash');
        break;
      case 'onboarding':
        setStep('registration');
        break;
      default:
        setStep('splash');
    }
  };

  const handleProfileChoice = (role: 'consumer' | 'merchant') => {
    setSelectedRole(role);
    setStep('registration');
  };

  const handleRegistrationSuccess = () => {
    setStep('onboarding');
  };

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleOnboardingComplete = () => {
    navigate('/');
  };

  const handleForgotPassword = () => {
    // TODO: Implémenter la récupération de mot de passe
    console.log('Forgot password flow');
  };

  switch (step) {
    case 'splash':
      return (
        <div className="relative">
          <SplashScreen onStart={() => setStep('profile-choice')} />
          
          {/* Lien vers connexion en bas */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <button
              onClick={() => setStep('login')}
              className="text-white/90 hover:text-white text-sm underline"
            >
              Déjà inscrit ? Se connecter
            </button>
          </div>
        </div>
      );

    case 'profile-choice':
      return (
        <ProfileChoicePage
          onChoice={handleProfileChoice}
          onBack={handleBack}
        />
      );

    case 'registration':
      return (
        <RegistrationPage
          role={selectedRole}
          onBack={handleBack}
          onSuccess={handleRegistrationSuccess}
        />
      );

    case 'login':
      return (
        <LoginPage
          onBack={handleBack}
          onSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
        />
      );

    case 'onboarding':
      return (
        <OnboardingPage
          onComplete={handleOnboardingComplete}
        />
      );

    default:
      return null;
  }
};