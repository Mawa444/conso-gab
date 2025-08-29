import { User, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { Badge } from "@/components/ui/badge";

interface ProfileModeSwitchProps {
  className?: string;
}

export const ProfileModeSwitch = ({ className }: ProfileModeSwitchProps) => {
  const { 
    currentMode, 
    businessProfiles, 
    switchMode, 
    getCurrentBusiness,
    loading 
  } = useProfileMode();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className={className}>
        <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const currentBusiness = getCurrentBusiness();
  const isBusinessMode = currentMode === 'business';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={isBusinessMode ? "default" : "secondary"}
          size="icon" 
          className={`${className} relative transition-all duration-500 transform hover:scale-110 ${
            isBusinessMode 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400/30' 
              : 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 border-2 border-green-400/30'
          }`}
        >
          {isBusinessMode ? (
            <Building2 className="w-6 h-6 drop-shadow-sm" />
          ) : (
            <User className="w-6 h-6 drop-shadow-sm" />
          )}
          
          {/* Indicateur visuel animé du mode actuel */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse ${
            isBusinessMode ? 'bg-blue-400' : 'bg-green-400'
          }`} />
          
          {/* Effet de lueur en arrière-plan */}
          <div className={`absolute inset-0 rounded-md blur-lg opacity-30 ${
            isBusinessMode ? 'bg-blue-600' : 'bg-green-600'
          }`} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Changer de profil</p>
            <p className="text-xs leading-none text-muted-foreground">
              Mode actuel: {isBusinessMode ? 'Professionnel' : 'Consommateur'}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Mode Consommateur */}
        <DropdownMenuItem 
          onClick={() => switchMode('consumer')}
          className={`flex items-center gap-3 p-3 ${
            currentMode === 'consumer' ? 'bg-green-50 text-green-700' : ''
          }`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Mode Consommateur</p>
            <p className="text-xs text-muted-foreground">Explorer et acheter</p>
          </div>
          {currentMode === 'consumer' && (
            <Badge variant="secondary" className="text-xs">Actuel</Badge>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
          Mes Entreprises
        </DropdownMenuLabel>

        {/* Liste des profils business */}
        {businessProfiles.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => switchMode('business', business.id)}
            className={`flex items-center gap-3 p-3 ${
              currentMode === 'business' && currentBusiness?.id === business.id 
                ? 'bg-blue-50 text-blue-700' 
                : ''
            }`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={business.logo_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                <Building2 className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{business.business_name}</p>
              <p className="text-xs text-muted-foreground">Mode Professionnel</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {business.is_primary && (
                <Badge variant="outline" className="text-xs">Principal</Badge>
              )}
              {currentMode === 'business' && currentBusiness?.id === business.id && (
                <Badge variant="secondary" className="text-xs">Actuel</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        {businessProfiles.length === 0 && (
          <DropdownMenuItem disabled className="text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2 p-2">
              <Building2 className="w-6 h-6 text-muted-foreground" />
              <p className="text-xs">Aucune entreprise</p>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-center text-primary">
          <div className="flex items-center gap-2 w-full justify-center">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Créer une nouvelle entreprise</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};