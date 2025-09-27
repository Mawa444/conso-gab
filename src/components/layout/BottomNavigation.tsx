import { Home, MapPin, Trophy, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const navItems = [{
  id: "home",
  icon: Home,
  label: "Accueil"
}, {
  id: "map",
  icon: MapPin,
  label: "Carte"
}, {
  id: "scanner",
  icon: QrCode,
  label: "Scanner",
  isMain: true
}, {
  id: "profile",
  icon: User,
  label: "Profil"
}];
export const BottomNavigation = ({
  activeTab,
  onTabChange
}: BottomNavigationProps) => {
  return <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t-2 border-border shadow-[var(--shadow-elevated)] safe-area-pb z-[999] noselect">
      <div className="flex items-center justify-around rounded-none px-[240px] py-[12px] bg-[f2f4f7] bg-[#f2f4f7]/[0.96]">
        {navItems.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return <button key={item.id} onClick={() => onTabChange(item.id)} className={cn("flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300", item.isMain ? "relative -mt-6 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-gaboma)] scale-125 hover:scale-130 border-2 border-white/20" : isActive ? "bg-gradient-to-t from-accent/20 to-primary/10 text-accent border border-accent/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg")}>
              {item.isMain && <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl" />}
              <Icon className={cn("relative", item.isMain ? "w-6 h-6" : "w-5 h-5")} />
                <span className={cn("text-label-small font-roboto mt-1 relative noselect", item.isMain ? "text-primary-foreground" : "")}>
                 {item.label}
                </span>
            </button>;
      })}
      </div>
    </div>;
};