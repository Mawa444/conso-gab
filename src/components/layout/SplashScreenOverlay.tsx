import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
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
    <div className={`fixed inset-0 z-[var(--z-splash)] flex items-center justify-center ${
      welcomeStep === 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Arrière-plan avec dégradé Gaboma */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent" />
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={gabomaLogo} 
            alt="Gaboma Logo" 
            className="w-28 h-28 object-contain mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-4';
              fallback.innerHTML = '<span class="text-2xl font-bold text-primary">G</span>';
              e.currentTarget.parentElement!.appendChild(fallback);
            }}
          />
        </div>

        {welcomeStep === 'loading' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Gaboma</h1>
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/90 text-sm">Chargement...</p>
          </div>
        )}

        {welcomeStep === 'welcome' && user && (
          <div className="space-y-2">
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
