import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import gabomaLogo from "@/assets/gaboma-logo.png";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
}

export const Header = ({ title, showBack, onBack, showNotifications = true }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-accent to-primary/90 text-white shadow-[var(--shadow-elevated)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Côté gauche - Logo et titre */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <img 
                src={gabomaLogo} 
                alt="100% Gaboma" 
                className="w-8 h-8 rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-lg font-bold">100% Gaboma</h1>
                {title && (
                  <p className="text-sm text-white/80">{title}</p>
                )}
              </div>
            </div>
          )}
          
          {showBack && title && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>

        {/* Côté droit - Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse-soft" />
          </Button>
        )}
      </div>
    </header>
  );
};