import { useEffect, useMemo, useState } from "react";
import { useToast, toast } from "@/hooks/use-toast";
import { CheckCircle2, Info, AlertTriangle, VolumeX, EyeOff, Power, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

/***** Dynamic Island inspired toaster *****/
export const DynamicIslandToaster = () => {
  const { toasts, dismiss } = useToast();
  const [expanded, setExpanded] = useState(false);

  // Preferences in localStorage
  const [mutedUntil, setMutedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem("notificationsMutedUntil");
    return v ? Number(v) : null;
  });
  const [disabled, setDisabled] = useState<boolean>(() => {
    return localStorage.getItem("notificationsDisabled") === "true";
  });

  // Simulation de notifications pour démonstration
  useEffect(() => {
    const simulateNotifications = () => {
      const notifications = [
        {
          variant: "default" as const,
          title: "Commande confirmée",
          description: "Votre commande #1234 a été confirmée avec succès",
        },
        {
          variant: "default" as const,
          title: "Nouveau message",
          description: "Vous avez reçu un message de Restaurant Le Bistrot",
        },
        {
          variant: "destructive" as const,
          title: "Connexion échouée",
          description: "Impossible de se connecter au serveur",
        },
        {
          variant: "default" as const,
          title: "Promotion disponible",
          description: "30% de réduction chez Boulangerie Martin",
        }
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < notifications.length) {
          toast(notifications[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    };

    // Démarrer les simulations après 2 secondes
    const timeout = setTimeout(simulateNotifications, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (mutedUntil) localStorage.setItem("notificationsMutedUntil", String(mutedUntil));
    else localStorage.removeItem("notificationsMutedUntil");
  }, [mutedUntil]);

  useEffect(() => {
    localStorage.setItem("notificationsDisabled", String(disabled));
  }, [disabled]);

  const now = Date.now();
  const isMuted = mutedUntil !== null && mutedUntil > now;

  const activeToasts = useMemo(() => {
    if (disabled || isMuted) return [];
    return toasts.filter(toast => toast.open !== false);
  }, [toasts, disabled, isMuted]);

  const current = activeToasts[0];
  const hasMultiple = activeToasts.length > 1;

  if (activeToasts.length === 0) return null;

  const handleMute = (ms: number) => {
    setMutedUntil(Date.now() + ms);
    if (current) dismiss(current.id);
  };

  const handleHide = () => {
    if (current) dismiss(current.id);
  };
  
  const handleHideAll = () => {
    activeToasts.forEach(toast => dismiss(toast.id));
  };

  const handleDisable = () => {
    setDisabled(true);
    if (current) dismiss(current.id);
  };

  const Icon = (() => {
    const v = (current as any).variant as string | undefined;
    if (v === "destructive") return AlertTriangle;
    return CheckCircle2; // Utiliser CheckCircle2 par défaut pour les notifications de succès
  })();

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[110]",
        "mt-[calc(env(safe-area-inset-top)_+_8px)] top-0"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Dynamic Island Container */}
      <div
        className={cn(
          "dynamic-island-enter will-change-transform cursor-pointer",
          expanded ? "min-w-[320px] max-w-[95vw] sm:max-w-[420px]" : "min-w-[280px] max-w-[92vw] sm:max-w-[380px]",
          "rounded-full border border-border bg-card/90 backdrop-blur shadow-[var(--shadow-elevated)]",
          "transition-all duration-300 ease-out",
          expanded ? "rounded-3xl px-6 py-4" : "px-4 py-2"
        )}
        role="status"
        onClick={() => hasMultiple && setExpanded(!expanded)}
      >
        {/* Badge pour le nombre de notifications */}
        {hasMultiple && !expanded && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-destructive-foreground animate-pulse-soft">
            {activeToasts.length}
          </div>
        )}

        {/* Vue condensée - une seule notification */}
        {!expanded && current && (
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-gaboma)]">
              <Icon className="w-5 h-5" />
              <span className="sr-only">Notification</span>
            </div>

            <div className="flex-1 overflow-hidden">
              {current.title && (
                <div className="text-sm font-semibold truncate">{current.title}</div>
              )}
              {current.description && (
                <div className="text-xs text-muted-foreground truncate">{current.description}</div>
              )}
            </div>

            {/* Badge cliquable pour développer */}
            {hasMultiple && (
              <div className="shrink-0">
                <Bell className="w-4 h-4 text-muted-foreground animate-pulse" />
              </div>
            )}

            {/* Action principale si présente */}
            {current.action && (
              <div className="shrink-0">
                {current.action}
              </div>
            )}

            {/* Contrôles condensés */}
            <div className="flex items-center gap-1">
              <button
                aria-label="Masquer"
                className="w-7 h-7 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
                onClick={(e) => { e.stopPropagation(); handleHide(); }}
                title="Masquer"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Vue développée - toutes les notifications */}
        {expanded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications ({activeToasts.length})
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                className="w-8 h-8 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
                aria-label="Réduire"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeToasts.map((toast, index) => {
                const ToastIcon = (() => {
                  const v = (toast as any).variant as string | undefined;
                  if (v === "destructive") return AlertTriangle;
                  return CheckCircle2; // Utiliser CheckCircle2 par défaut 
                })();

                return (
                  <div
                    key={toast.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                      <ToastIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {toast.title && (
                        <div className="text-sm font-semibold">{toast.title}</div>
                      )}
                      {toast.description && (
                        <div className="text-xs text-muted-foreground mt-1">{toast.description}</div>
                      )}
                    </div>

                    {toast.action && (
                      <div className="shrink-0">
                        {toast.action}
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
                      className="w-6 h-6 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
                      aria-label="Supprimer cette notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Actions groupées */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <button
                onClick={(e) => { e.stopPropagation(); handleMute(60 * 60 * 1000); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-gaboma"
              >
                <VolumeX className="w-4 h-4" />
                Sourdine 1h
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleHideAll(); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-gaboma"
              >
                <EyeOff className="w-4 h-4" />
                Tout masquer
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleDisable(); }}
                className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-gaboma"
              >
                <Power className="w-4 h-4" />
                Désactiver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};