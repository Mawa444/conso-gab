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
  return <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-accent to-primary/90 text-white shadow-[var(--shadow-elevated)] backdrop-blur-sm noselect">
        <div className="flex items-center justify-between rounded-none bg-[3a75c4] bg-[#3a75c4]/95 px-[15px] py-[15px]">
        {/* Côté gauche - Logo et titre */}
        <div className="flex items-center gap-3">
          {showBack ? <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button> : <div style={{
          letterSpacing: '0.1em'
        }} className="flex items-center my-0 mx-0">
                <span style={{
            marginRight: '0.1em'
          }} className="font-lalezar text-white font-normal text-2xl">CONS</span>
                <img src={gabomaLogo} alt="ConsoGab" style={{
            margin: '0 0.1em'
          }} className="w-8 max-h-80 max-h-8 " />
                <span style={{
            marginLeft: '0.1em'
          }} className="font-lalezar text-white font-normal text-2xl">GAB</span>
             </div>}
          
          {showBack && title && <h1 className="text-title-large font-roboto noselect">{title}</h1>}
        </div>

        {/* Côté droit - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Bouton localisation */}
          
          
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