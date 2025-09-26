import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  Search, 
  Users, 
  Settings,
  Home,
  Plus,
  ShoppingCart,
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

interface MessagingBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navItems = [
  { id: "messages", icon: MessageSquare, label: "Messages", route: "/messaging" },
  { id: "search", icon: Search, label: "Recherche", route: "/messaging/search" },
  { id: "new", icon: Plus, label: "Nouveau", route: "/messaging/new", isMain: true },
  { id: "requests", icon: MapPin, label: "Demandes", route: "/messaging/requests" },
  { id: "home", icon: Home, label: "Accueil", route: "/" },
];

export const MessagingBottomNav = ({ activeTab, onTabChange }: MessagingBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleTabClick = (item: typeof navItems[0]) => {
    if (item.id === "new") {
      // Handle new conversation creation
      onTabChange?.(item.id);
      return;
    }
    
    if (onTabChange) {
      onTabChange(item.id);
    } else {
      navigate(item.route);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (activeTab) {
      return activeTab === item.id;
    }
    return location.pathname === item.route;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick(item)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 relative",
                item.isMain
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg scale-110 hover:scale-115 border border-white/20 -mt-4"
                  : active
                  ? "bg-gradient-to-t from-accent/20 to-primary/10 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.isMain && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl animate-pulse opacity-30" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </>
              )}
              
              <Icon 
                className={cn(
                  "relative",
                  item.isMain ? "w-5 h-5" : "w-4 h-4"
                )} 
              />
              
              <span className={cn(
                "text-xs font-medium mt-1 relative",
                item.isMain ? "text-primary-foreground" : ""
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};