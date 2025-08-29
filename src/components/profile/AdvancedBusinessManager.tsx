import { useState } from "react";
import { Building2, Plus, Crown, Settings, Users, BarChart3, Eye, ChevronRight, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { toast } from "sonner";
import { BusinessCreationWizard } from "@/components/business/BusinessCreationWizard";
import { useNavigate } from "react-router-dom";

interface AdvancedBusinessManagerProps {
  className?: string;
}

export const AdvancedBusinessManager = ({ className }: AdvancedBusinessManagerProps) => {
  const { 
    currentMode, 
    businessProfiles, 
    switchMode, 
    getCurrentBusiness,
    loading 
  } = useProfileMode();
  const navigate = useNavigate();
  
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentBusiness = getCurrentBusiness();
  const isBusinessMode = currentMode === 'business';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/30 animate-pulse rounded-xl" />
        <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
      </div>
    );
  }

  const handleCreateBusiness = () => {
    toast.info("Création d'entreprise - Fonctionnalité à venir");
    setShowCreateForm(false);
  };

  return (
    <div className={className}>
      {/* Header with mode switch */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-6 mb-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gestion des Profils
            </h2>
            <p className="text-muted-foreground text-sm">
              Gérez vos profils consommateur et business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isBusinessMode 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
              }`}>
                {isBusinessMode ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <Shield className="w-6 h-6" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">
                  {isBusinessMode ? 'Mode Professionnel' : 'Mode Consommateur'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isBusinessMode 
                    ? `Entreprise: ${currentBusiness?.business_name || 'Non défini'}` 
                    : 'Profil personnel actif'
                  }
                </p>
              </div>
            </div>
            
            <Badge variant={isBusinessMode ? "default" : "secondary"} className="text-xs">
              {isBusinessMode ? 'BUSINESS' : 'CONSUMER'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Switcher */}
      <div className="grid gap-4 mb-6">
        {/* Consumer Profile */}
        <Card className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
          currentMode === 'consumer' 
            ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/20' 
            : 'hover:bg-muted/30'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Profil Consommateur</h3>
                  <p className="text-sm text-muted-foreground">Explorer et acheter</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {currentMode === 'consumer' && (
                  <Badge variant="secondary" className="text-xs">ACTUEL</Badge>
                )}
                <Button 
                  variant={currentMode === 'consumer' ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchMode('consumer', undefined, navigate)}
                >
                  {currentMode === 'consumer' ? 'Actuel' : 'Basculer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profiles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Mes Entreprises</h3>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Entreprise
            </Button>
          </div>

          {businessProfiles.length > 0 ? (
            businessProfiles.map((business) => (
              <Card key={business.id} className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                currentMode === 'business' && currentBusiness?.id === business.id
                  ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'hover:bg-muted/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={business.logo_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <Building2 className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{business.business_name}</h3>
                        <p className="text-sm text-muted-foreground">Mode Professionnel</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {business.is_primary && (
                        <Badge variant="outline" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                      {currentMode === 'business' && currentBusiness?.id === business.id && (
                        <Badge variant="default" className="text-xs">ACTUEL</Badge>
                      )}
                      <Button 
                        variant={
                          currentMode === 'business' && currentBusiness?.id === business.id 
                            ? "default" 
                            : "outline"
                        }
                        size="sm"
                        onClick={() => switchMode('business', business.id, navigate)}
                      >
                        {currentMode === 'business' && currentBusiness?.id === business.id 
                          ? 'Actuel' 
                          : 'Basculer'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/30">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucune entreprise</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre première entreprise pour accéder aux fonctionnalités business
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une entreprise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions for Business Mode */}
      {currentMode === 'business' && currentBusiness && (
        <div className="bg-gradient-to-br from-blue-50 to-accent-50 dark:from-blue-950/20 dark:to-accent-950/20 rounded-2xl p-6 border border-blue-200/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Actions Rapides - {currentBusiness.business_name}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span className="text-sm">Gérer Profil</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-sm">Collaborateurs</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              <span className="text-sm">Statistiques</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Voir Profil</span>
            </Button>
          </div>
        </div>
      )}

      {/* Create Business Form */}
      {showCreateForm && (
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer une nouvelle entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez créer et gérer plusieurs profils business.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCreateBusiness} className="flex-1">
                Créer
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};