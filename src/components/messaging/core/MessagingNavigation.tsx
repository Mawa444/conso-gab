import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMessagingContext } from "../UniversalMessagingOS";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { 
  Menu, 
  Inbox, 
  Settings, 
  BarChart3, 
  Maximize2, 
  Minimize2,
  MessageSquare,
  Zap,
  Star
} from "lucide-react";

export const MessagingNavigation: React.FC = () => {
  const { currentView, setCurrentView, isFullScreen, setIsFullScreen } = useMessagingContext();
  const { currentMode } = useProfileMode();
  
  const navigationItems = [
    {
      id: 'inbox' as const,
      label: 'Boîte de réception',
      icon: Inbox,
      description: 'Toutes vos conversations',
      available: true
    },
    {
      id: 'analytics' as const,
      label: 'Analytiques',
      icon: BarChart3,
      description: 'Statistiques et performances',
      available: currentMode === 'business'
    },
    {
      id: 'settings' as const,
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration et préférences',
      available: true
    }
  ];

  const availableItems = navigationItems.filter(item => item.available);

  return (
    <div className="flex items-center gap-2">
      {/* Bouton plein écran */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="hover:bg-accent/20"
      >
        {isFullScreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </Button>

      {/* Menu de navigation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Navigation</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/50">
          <div className="p-3 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              Navigation Messagerie
            </div>
          </div>
          
          {availableItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`p-3 cursor-pointer ${isActive ? 'bg-primary/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Actuel
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
          
          {currentMode === 'business' && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2 text-xs text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Fonctionnalités Pro
              </div>
              <DropdownMenuItem className="p-3 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs">🔌</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Plugins Sectoriels</div>
                    <div className="text-xs text-muted-foreground">
                      Bientôt disponible
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Soon
                  </Badge>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};