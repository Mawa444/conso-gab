import { Home, MapPin, Trophy, User, QrCode } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab?: string;
  onScannerClick?: () => void;
}

const navItems = [
  {
    id: "home",
    icon: Home,
    label: "Accueil",
    path: "/consumer/home"
  },
  {
    id: "map", 
    icon: MapPin,
    label: "Carte",
    path: "/consumer/map"
  },
  {
    id: "scanner",
    icon: QrCode,
    label: "Scanner",
    isMain: true
  },
  {
    id: "profile",
    icon: User,
    label: "Profil", 
    path: "/consumer/profile"
  }
];

export const BottomNavigation = ({
  activeTab,
  onScannerClick
}: BottomNavigationProps) => {
  const location = useLocation();
  
  // Auto-detect active tab from current route if not provided
  const currentTab = activeTab || (() => {
    const pathname = location.pathname;
    if (pathname.includes('/map')) return 'map';
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/rankings')) return 'rankings';
    return 'home';
  })();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-2 border-border shadow-[var(--shadow-elevated)] safe-area-pb z-[999]">
      <div className="flex items-center justify-around px-4 py-3 rounded-none bg-black">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          
          if (item.isMain) {
            return (
              <button 
                key={item.id} 
                onClick={() => onScannerClick?.()}
                className="relative -mt-6 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-gaboma)] scale-125 hover:scale-130 border-2 border-white/20 flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent animate-pulse-soft rounded-3xl" />
                <Icon className="relative w-6 h-6" />
                <span className="text-xs font-medium mt-1 relative text-primary-foreground">
                  {item.label}
                </span>
              </button>
            );
          }
          
          return (
            <Link 
              key={item.id} 
              to={item.path!}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-t from-accent/20 to-primary/10 text-accent border border-accent/30" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};