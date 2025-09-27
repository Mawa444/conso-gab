import { Building2, Crown, Settings, Users, BarChart3, Eye, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { CreateBusinessButton } from "@/components/business/CreateBusinessButton";
import { useNavigate } from "react-router-dom";
interface AdvancedBusinessManagerProps {
  className?: string;
}
export const AdvancedBusinessManager = ({
  className
}: AdvancedBusinessManagerProps) => {
  const {
    currentMode,
    businessProfiles,
    switchMode,
    getCurrentBusiness,
    loading
  } = useProfileMode();
  const navigate = useNavigate();
  const currentBusiness = getCurrentBusiness();
  const isBusinessMode = currentMode === 'business';
  if (loading) {
    return <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-24 bg-muted/30 animate-pulse rounded-xl" />
        <p className="text-center text-sm text-muted-foreground">Chargement de vos entreprises...</p>
      </div>;
  }
  return <div className={`${className} min-h-96 p-4 bg-background`}>
      {/* Header optimisé mobile */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-title-medium font-roboto text-primary">Gestion des Profils</CardTitle>
              <p className="text-body-small font-roboto text-muted-foreground">Gérez vos profils business</p>
            </div>
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
          </div>
        </CardHeader>

        {/* Mode actuel optimisé mobile */}
        <CardContent className="pt-0">
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isBusinessMode 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }`}>
                {isBusinessMode ? <Building2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-body-large font-roboto font-medium">
                  {isBusinessMode ? 'Mode Professionnel' : 'Mode Consommateur'}
                </h3>
                <p className="text-label-small font-roboto text-muted-foreground truncate">
                  {isBusinessMode ? `${currentBusiness?.business_name || 'Non défini'}` : 'Profil personnel actif'}
                </p>
              </div>
              
              <Badge variant={isBusinessMode ? "default" : "secondary"} className="text-label-small font-roboto flex-shrink-0">
                {isBusinessMode ? 'BUSINESS' : 'CONSUMER'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basculement de profils optimisé mobile */}
      <div className="space-y-3 mb-4">
        {/* Profil Consommateur */}
        <Card className={`transition-all duration-200 ${
          currentMode === 'consumer' 
            ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/20' 
            : 'hover:bg-muted/30'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-body-large font-roboto font-medium">Profil Consommateur</h3>
                <p className="text-label-small font-roboto text-muted-foreground">Explorer et acheter</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {currentMode === 'consumer' && (
                  <Badge variant="secondary" className="text-label-small font-roboto">ACTUEL</Badge>
                )}
                <Button 
                  variant={currentMode === 'consumer' ? 'secondary' : 'default'} 
                  size="sm" 
                  onClick={() => switchMode('consumer', undefined, navigate)}
                  className="text-label-small font-roboto"
                >
                  {currentMode === 'consumer' ? 'Actuel' : 'Basculer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profils Business optimisés mobile */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-title-small font-roboto text-primary">Mes Profils Business</CardTitle>
          </CardHeader>
          <CardContent>
            {businessProfiles.length > 0 ? (
              <div className="space-y-3">
                {businessProfiles.map(business => (
                  <Card 
                    key={business.id} 
                    className={`transition-all duration-200 ${
                      currentMode === 'business' && currentBusiness?.id === business.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={business.logo_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <Building2 className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-large font-roboto font-medium truncate">{business.business_name}</h3>
                            {business.is_primary && (
                              <Badge variant="outline" className="text-label-small font-roboto flex-shrink-0">
                                <Crown className="w-3 h-3 mr-1" />
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-label-small font-roboto text-muted-foreground">Mode Professionnel</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {currentMode === 'business' && currentBusiness?.id === business.id && (
                            <Badge variant="default" className="text-label-small font-roboto">ACTUEL</Badge>
                          )}
                          <Button 
                            variant={currentMode === 'business' && currentBusiness?.id === business.id ? 'secondary' : 'default'} 
                            size="sm" 
                            onClick={() => switchMode('business', business.id, navigate)}
                            className="text-label-small font-roboto"
                          >
                            {currentMode === 'business' && currentBusiness?.id === business.id ? 'Actuel' : 'Basculer'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Bouton création nouvelle entreprise */}
                <CreateBusinessButton 
                  size="lg"
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium"
                  fullWidth
                >
                  <span className="text-label-large font-roboto">Créer un nouveau profil business</span>
                </CreateBusinessButton>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-title-small font-roboto font-medium mb-2">Aucune entreprise</h3>
                <p className="text-body-small font-roboto text-muted-foreground mb-6">
                  Créez votre première entreprise pour accéder aux fonctionnalités business
                </p>
                <CreateBusinessButton 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground h-12 px-6" 
                  size="lg"
                >
                  <span className="text-label-large font-roboto">Créer mon entreprise</span>
                </CreateBusinessButton>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides Business optimisées mobile */}
      {currentMode === 'business' && currentBusiness && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-title-small font-roboto text-blue-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Actions - {currentBusiness.business_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="h-14 flex-col gap-1 p-2">
                <Settings className="w-4 h-4" />
                <span className="text-label-small font-roboto">Gérer Profil</span>
              </Button>
              <Button variant="default" className="h-14 flex-col gap-1 p-2">
                <Users className="w-4 h-4" />
                <span className="text-label-small font-roboto">Équipe</span>
              </Button>
              <Button variant="default" className="h-14 flex-col gap-1 p-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-label-small font-roboto">Statistiques</span>
              </Button>
              <Button variant="default" className="h-14 flex-col gap-1 p-2">
                <Eye className="w-4 h-4" />
                <span className="text-label-small font-roboto">Voir Profil</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>;
};