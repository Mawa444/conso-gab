import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import gabomaLogo from "@/assets/gaboma-logo.png";

export const SplashScreenOverlay = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState<'loading' | 'welcome' | 'hidden'>('loading');

  useEffect(() => {
    // L'app est prête quand l'auth est complètement chargée
    if (!loading) {
      setAppReady(true);
      
      // Si l'utilisateur est connecté, montrer le message de bienvenue
      if (user) {
        setWelcomeStep('welcome');
        // Masquer après 1.5s
        const timer = setTimeout(() => {
          setWelcomeStep('hidden');
          setShowSplash(false);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Si pas connecté, masquer immédiatement
        const timer = setTimeout(() => {
          setShowSplash(false);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user]);

  if (!showSplash) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
      welcomeStep === 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Arrière-plan avec dégradé Gaboma */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent" />
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
            <img 
              src={gabomaLogo} 
              alt="Gaboma Logo" 
              className="w-14 h-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <span class="text-xl font-bold text-primary">G</span>
                  </div>
                `;
              }}
            />
          </div>
        </div>

        {welcomeStep === 'loading' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Gaboma</h1>
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/90 text-sm">Chargement...</p>
          </div>
        )}

        {welcomeStep === 'welcome' && user && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-lg text-white/90">Bienvenue</p>
            <h2 className="text-2xl font-bold text-white">
              {user.email?.split('@')[0] || 'Utilisateur'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};