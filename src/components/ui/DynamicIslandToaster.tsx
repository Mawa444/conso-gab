import { useEffect, useMemo, useState } from "react";
import { useToast, toast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, Wifi, WifiOff, Lock, User, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/***** Toaster français avec icônes explicatives *****/
const getIconAndMessage = (variant?: string, title?: string, description?: string) => {
  // Messages de connexion
  if (title?.toLowerCase().includes('connexion') || title?.toLowerCase().includes('connection') || description?.toLowerCase().includes('connexion')) {
    if (title?.toLowerCase().includes('échoué') || title?.toLowerCase().includes('failed') || title?.toLowerCase().includes('error')) {
      return {
        icon: WifiOff,
        iconColor: 'text-red-400',
        title: 'Connexion échouée',
        message: 'Vérifiez votre connexion internet et réessayez'
      };
    }
    return {
      icon: Wifi,
      iconColor: 'text-green-400',
      title: 'Connexion réussie',
      message: 'Vous êtes maintenant connecté'
    };
  }

  // Messages d'erreur de mot de passe
  if (title?.toLowerCase().includes('password') || title?.toLowerCase().includes('mot de passe') || description?.toLowerCase().includes('mot de passe')) {
    return {
      icon: Lock,
      iconColor: 'text-red-400',
      title: 'Mot de passe incorrect',
      message: 'Vérifiez votre mot de passe et réessayez'
    };
  }

  // Messages d'authentification
  if (title?.toLowerCase().includes('auth') || title?.toLowerCase().includes('login') || title?.toLowerCase().includes('connexion')) {
    return {
      icon: User,
      iconColor: 'text-blue-400',
      title: title || 'Authentification',
      message: description || 'Action d\'authentification en cours'
    };
  }

  // Messages de succès par défaut
  if (variant !== 'destructive') {
    return {
      icon: CheckCircle2,
      iconColor: 'text-green-400',
      title: title || 'Succès',
      message: description || 'Opération réussie'
    };
  }

  // Messages d'erreur par défaut
  return {
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    title: title || 'Erreur',
    message: description || 'Une erreur est survenue'
  };
};

/***** Dynamic Island Toaster - Style capture d'écran *****/
export const DynamicIslandToaster = () => {
  const { toasts, dismiss } = useToast();

  const activeToasts = useMemo(() => {
    return toasts.filter(toast => toast.open !== false);
  }, [toasts]);

  const current = activeToasts[0];

  if (!current) return null;

  const { icon: IconComponent, iconColor, title, message } = getIconAndMessage(
    (current as any).variant,
    typeof current.title === 'string' ? current.title : '',
    typeof current.description === 'string' ? current.description : ''
  );

  const handleDismiss = () => {
    dismiss(current.id);
  };

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      {/* Pillule noire inspirée de la capture d'écran */}
      <div className="bg-black/90 backdrop-blur-sm text-white px-4 py-3 rounded-full shadow-xl border border-white/10 max-w-[90vw] min-w-[280px]">
        <div className="flex items-center gap-3">
          {/* Icône explicative */}
          <div className="flex-shrink-0">
            <IconComponent className={cn("w-5 h-5", iconColor)} />
          </div>
          
          {/* Contenu du message */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {title}
            </div>
            {message && message !== title && (
              <div className="text-xs text-white/80 truncate mt-0.5">
                {message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {current.action && (
              <div className="flex-shrink-0">
                {current.action}
              </div>
            )}
            
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};