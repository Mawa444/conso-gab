import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Info, AlertTriangle, VolumeX, EyeOff, Power } from "lucide-react";
import { cn } from "@/lib/utils";

/***** Dynamic Island inspired toaster *****/
export const DynamicIslandToaster = () => {
  const { toasts, dismiss } = useToast();

  // Preferences in localStorage
  const [mutedUntil, setMutedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem("notificationsMutedUntil");
    return v ? Number(v) : null;
  });
  const [disabled, setDisabled] = useState<boolean>(() => {
    return localStorage.getItem("notificationsDisabled") === "true";
  });

  useEffect(() => {
    if (mutedUntil) localStorage.setItem("notificationsMutedUntil", String(mutedUntil));
    else localStorage.removeItem("notificationsMutedUntil");
  }, [mutedUntil]);

  useEffect(() => {
    localStorage.setItem("notificationsDisabled", String(disabled));
  }, [disabled]);

  const now = Date.now();
  const isMuted = mutedUntil !== null && mutedUntil > now;

  const current = useMemo(() => {
    if (disabled || isMuted) return null;
    return toasts[0];
  }, [toasts, disabled, isMuted]);

  if (!current) return null;

  const handleMute = (ms: number) => {
    setMutedUntil(Date.now() + ms);
    dismiss(current.id);
  };

  const handleHide = () => dismiss(current.id);
  const handleDisable = () => {
    setDisabled(true);
    dismiss(current.id);
  };

  const Icon = (() => {
    const v = (current as any).variant as string | undefined;
    if (v === "destructive") return AlertTriangle;
    if (v === "success") return CheckCircle2;
    return Info;
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
      <div
        className={cn(
          "dynamic-island-enter will-change-transform",
          "min-w-[280px] max-w-[92vw] sm:max-w-[380px]",
          "rounded-full border border-border bg-card/90 backdrop-blur shadow-[var(--shadow-elevated)]",
          "px-4 py-2 flex items-center gap-3"
        )}
        role="status"
      >
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

        {/* Primary action (if any) */}
        {current.action && (
          <div className="shrink-0">
            {current.action}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 ml-1">
          <button
            aria-label="Mettre en sourdine"
            className="w-8 h-8 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
            onClick={() => handleMute(60 * 60 * 1000)}
            title="Sourdine 1h"
          >
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            aria-label="Masquer"
            className="w-8 h-8 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
            onClick={handleHide}
            title="Masquer"
          >
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            aria-label="Désactiver les notifications"
            className="w-8 h-8 rounded-full grid place-items-center hover:bg-muted/60 transition-gaboma"
            onClick={handleDisable}
            title="Désactiver"
          >
            <Power className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
