import { QrCode, MapPin, Trophy, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileMode } from "@/hooks/use-profile-mode";

interface ActionButtonsBlockProps {
  onScanClick?: () => void;
  onNearbyClick?: () => void;
  onRankingsClick?: () => void;
  onTopBusinessesClick?: () => void;
  onOperatorDashboardClick?: () => void;
  className?: string;
}

export const ActionButtonsBlock = ({ 
  onScanClick, 
  onNearbyClick, 
  onRankingsClick, 
  onTopBusinessesClick,
  onOperatorDashboardClick,
  className 
}: ActionButtonsBlockProps) => {
  const { businessProfiles, currentMode } = useProfileMode();
  // Actions de base toujours disponibles
  const baseActions = [
    {
      title: "Scanner QR",
      description: "Découvrir un commerce",
      icon: QrCode,
      onClick: onScanClick,
      variant: "primary" as const,
      className: "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-gaboma)] hover:shadow-[var(--shadow-elevated)] border-2 border-white/20"
    },
    {
      title: "Autour de moi",
      description: "Commerces proches",
      icon: MapPin,
      onClick: onNearbyClick,
      variant: "outline" as const,
      className: "border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
    },
    {
      title: "Classements",
      description: "Top commerces",
      icon: Trophy,
      onClick: onRankingsClick,
      variant: "outline" as const,
      className: "border-2 border-accent/30 hover:bg-accent/5 hover:border-accent/50"
    }
  ];

  // Action conditionnelle selon le profil utilisateur
  const conditionalAction = businessProfiles.length > 0 ? {
    title: "Dashboard Opérateur",
    description: `${businessProfiles.length} entreprise${businessProfiles.length > 1 ? 's' : ''}`,
    icon: Settings,
    onClick: onOperatorDashboardClick,
    variant: "outline" as const,
    className: `border-2 transition-all duration-300 ${
      currentMode === 'business' 
        ? 'border-blue-500/50 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-600/70' 
        : 'border-secondary/30 hover:bg-secondary/5 hover:border-secondary/50'
    }`
  } : {
    title: "Tendances",
    description: "Commerces populaires",
    icon: Zap,
    onClick: onTopBusinessesClick,
    variant: "outline" as const,
    className: "border-2 border-secondary/30 hover:bg-secondary/5 hover:border-secondary/50"
  };

  const actions = [...baseActions, conditionalAction];

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        
        return (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${action.className}`}
            onClick={action.onClick}
          >
            <CardContent className="p-6 text-center space-y-3">
              {/* Icône avec animation */}
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                index === 0 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-muted/30 to-muted/10 group-hover:from-primary/10 group-hover:to-accent/10'
              }`}>
                <IconComponent className={`w-8 h-8 ${
                  index === 0 ? 'text-white' : 'text-primary group-hover:text-accent'
                }`} />
              </div>
              
              {/* Titre */}
              <div>
                <h3 className={`text-lg font-bold ${
                  index === 0 ? 'text-white' : 'text-foreground'
                }`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${
                  index === 0 ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {action.description}
                </p>
              </div>

              {/* Indicateur visuel pour l'action principale */}
              {index === 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg animate-pulse-soft" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};