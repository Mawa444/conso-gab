import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import gabomaLogo from "@/assets/gaboma-logo.png";

export const SplashScreenOverlay = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState<'loading' | 'welcome' | 'hidden'>('loading');
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [variant, setVariant] = useState<'first' | 'welcomeBack' | 'longTime' | null>(null);

  useEffect(() => {
    if (loading) return;
    setAppReady(true);

    // Si non connecté, masquer rapidement
    if (!user) {
      const t = setTimeout(() => setShowSplash(false), 150);
      return () => clearTimeout(t);
    }

    // Connecté: ne montrer le message que 1x par session
    const welcomeShown = localStorage.getItem('gb_welcome_shown') === 'true';
    if (welcomeShown) {
      setShowSplash(false);
      return;
    }

    // Déterminer le message selon le temps écoulé depuis la dernière déconnexion
    const now = Date.now();
    const lastLogout = parseInt(localStorage.getItem('gb_last_logout_at') || '0');
    let v: 'first' | 'welcomeBack' | 'longTime' = 'first';
    if (lastLogout) {
      const diffHours = (now - lastLogout) / (1000 * 60 * 60);
      if (diffHours < 24) v = 'welcomeBack';
      else if (diffHours >= 24 * 30) v = 'longTime';
      else v = 'welcomeBack';
    }
    setVariant(v);

    // Récupérer le pseudo (de façon différée pour éviter tout deadlock auth)
    setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('pseudo')
          .eq('user_id', user.id)
          .single();
        if (data?.pseudo) setPseudo(data.pseudo);
      } catch {}
    }, 0);

    setWelcomeStep('welcome');
    const timer = setTimeout(() => {
      setWelcomeStep('hidden');
      setShowSplash(false);
      try { localStorage.setItem('gb_welcome_shown', 'true'); } catch {}
    }, 1500);
    return () => clearTimeout(timer);
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
            <p className="text-lg text-white/90">
              {variant === 'welcomeBack' && 'Heureux de vous revoir'}
              {variant === 'longTime' && "Quel plaisir de vous revoir !"}
              {variant === 'first' && 'Bienvenue'}
            </p>
            <h2 className="text-2xl font-bold text-white">
              {pseudo || user.email?.split('@')[0] || 'Utilisateur'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};