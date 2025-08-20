import { Home, MapPin, Trophy, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Accueil" },
  { id: "map", icon: MapPin, label: "Carte" },
  { id: "scanner", icon: QrCode, label: "Scanner", isMain: true },
  { id: "rankings", icon: Trophy, label: "Classements" },
  { id: "profile", icon: User, label: "Profil" },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 safe-area-pb z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300",
                item.isMain
                  ? "relative -mt-6 bg-primary text-primary-foreground shadow-lg scale-125 hover:scale-130"
                  : isActive
                  ? "bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.isMain && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse-soft" />
              )}
              <Icon 
                className={cn(
                  "relative",
                  item.isMain ? "w-6 h-6" : "w-5 h-5"
                )} 
              />
              <span className={cn(
                "text-xs font-medium mt-1 relative",
                item.isMain ? "text-primary-foreground" : ""
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};