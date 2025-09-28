import { MessageCircle, MapPin, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";
interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const navItems = [{
  id: "home",
  icon: MessageCircle,
  label: "Chats"
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
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/20 safe-area-pb z-[999] noselect">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return <button key={item.id} onClick={() => onTabChange(item.id)} className={cn("flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200", item.isMain ? "relative bg-green-500 text-white shadow-lg scale-110 rounded-full p-3" : isActive ? "text-green-600" : "text-gray-500 hover:text-gray-700")}>
              <Icon className={cn(item.isMain ? "w-6 h-6" : "w-6 h-6")} />
                <span className={cn("text-xs mt-1 font-medium", item.isMain ? "text-white" : "")}>
                 {item.label}
                </span>
            </button>;
      })}
      </div>
    </div>;
};