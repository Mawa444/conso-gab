import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import gabomaLogo from "@/assets/gaboma-logo.png";
interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
  onLocationClick?: () => void;
  onMessageClick?: () => void;
}
export const Header = ({
  title,
  showBack,
  onBack,
  showNotifications = true,
  onLocationClick,
  onMessageClick
}: HeaderProps) => {
  return <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-accent to-primary/90 text-white shadow-[var(--shadow-elevated)] backdrop-blur-sm safe-top">
        <div className="responsive-container flex items-center justify-between py-4 bg-[#3a75c4]/95 safe-horizontal min-h-[96px] sm:min-h-[80px]">
        {/* Côté gauche - Logo et titre */}
        <div className="flex items-center gap-3">
          {showBack ? <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button> : <div className="flex items-center gap-2">
               <img src={gabomaLogo} alt="ConsoGab" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              <div className="rounded-none">
                <h1 className="text-base sm:text-lg font-bold">ConsoGab</h1>
                <p className="text-xs sm:text-sm text-white/70 hidden sm:block">Découvrez le commerce gabonais</p>
                {title}
              </div>
            </div>}
          
          {showBack && title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>

        {/* Côté droit - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Bouton localisation */}
          <Button variant="ghost" size="icon" onClick={onLocationClick} className="text-white hover:bg-white/20 transition-colors" title="Autour de moi">
            <MapPin className="w-5 h-5" />
          </Button>
          
          {/* Bouton messages */}
          <Button variant="ghost" size="icon" onClick={onMessageClick} className="text-white hover:bg-white/20 transition-colors relative" title="Messages">
            <MessageCircle className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
          </Button>

          {/* Notifications */}
          {showNotifications && <div className="[&_button]:text-white [&_button]:hover:bg-white/20">
              <NotificationCenter />
            </div>}
        </div>
      </div>
    </header>;
};