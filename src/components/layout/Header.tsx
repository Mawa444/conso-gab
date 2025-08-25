import { ArrowLeft, Bell, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import gabomaLogo from "@/assets/gaboma-logo.png";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
  onLocationClick?: () => void;
  onMessageClick?: () => void;
}

export const Header = ({ title, showBack, onBack, showNotifications = true, onLocationClick, onMessageClick }: HeaderProps) => {
  return (
      <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-accent to-primary/90 text-white shadow-[var(--shadow-elevated)] backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
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
                alt="ConsoGab" 
                className="w-8 h-8 rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-lg font-bold">ConsoGab</h1>
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

        {/* Côté droit - Actions */}
        <div className="flex items-center gap-2">
          {/* Bouton localisation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLocationClick}
            className="text-white hover:bg-white/20 transition-colors"
            title="Autour de moi"
          >
            <MapPin className="w-5 h-5" />
          </Button>
          
          {/* Bouton messages */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMessageClick}
            className="text-white hover:bg-white/20 transition-colors relative"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse-soft" />
          </Button>

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse-soft" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};