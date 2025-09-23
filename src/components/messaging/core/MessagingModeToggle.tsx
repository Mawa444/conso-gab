import React from "react";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, ChevronDown, Zap } from "lucide-react";

export const MessagingModeToggle: React.FC = () => {
  const { currentMode, businessProfiles, switchMode, getCurrentBusiness } = useProfileMode();
  
  const currentBusiness = getCurrentBusiness();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80">
          <div className="flex items-center gap-2">
            {currentMode === 'business' && currentBusiness ? (
              <>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={currentBusiness.logo_url} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {currentBusiness.business_name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{currentBusiness.business_name}</span>
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span className="font-medium">Mode Client</span>
                <Badge variant="outline" className="text-xs">Personnel</Badge>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 bg-card/95 backdrop-blur-xl border-border/50">
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Zap className="w-4 h-4" />
            Basculer vers un autre mode
          </div>
        </div>
        
        <DropdownMenuItem 
          onClick={() => switchMode('consumer')}
          className={`p-3 cursor-pointer ${currentMode === 'consumer' ? 'bg-accent/20' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Mode Client</div>
              <div className="text-xs text-muted-foreground">
                Interface consommateur, commandes, réservations
              </div>
            </div>
            {currentMode === 'consumer' && (
              <Badge variant="secondary" className="text-xs">Actuel</Badge>
            )}
          </div>
        </DropdownMenuItem>
        
        {businessProfiles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-muted-foreground">
              Vos entreprises
            </div>
            
            {businessProfiles.map((business) => (
              <DropdownMenuItem
                key={business.id}
                onClick={() => switchMode('business', business.id)}
                className={`p-3 cursor-pointer ${
                  currentMode === 'business' && currentBusiness?.id === business.id ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={business.logo_url} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {business.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{business.business_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Interface professionnelle
                    </div>
                  </div>
                  {currentMode === 'business' && currentBusiness?.id === business.id && (
                    <Badge variant="default" className="text-xs">Actuel</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};