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
      {/* Header with mode switch */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-6 mb-6 border border-primary/20 bg-white">
        <div className="flex items-center justify-between mb-4 bg-[3a75c4] bg-white">
          <div>
            <h2 className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-[3a75c4] text-black">
              Gestion des Profils
            </h2>
            <p className="text-[3a75c4] text-black">Gérez vos profils business</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBusinessMode ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'}`}>
                {isBusinessMode ? <Building2 className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">
                  {isBusinessMode ? 'Mode Professionnel' : 'Mode Consommateur'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isBusinessMode ? `Entreprise: ${currentBusiness?.business_name || 'Non défini'}` : 'Profil personnel actif'}
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
        <Card className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${currentMode === 'consumer' ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/20' : 'hover:bg-muted/30'}`}>
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
                {currentMode === 'consumer' && <Badge variant="secondary" className="text-xs bg-[fcd116] bg-[#fcd116]/[0.96]">ACTUEL</Badge>}
                <Button variant="default" size="sm" onClick={() => switchMode('consumer', undefined, navigate)} className="text-[fcd116] text-white">
                  {currentMode === 'consumer' ? 'Actuel' : 'Basculer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profiles */}
        <div className="space-y-3 rounded-3xl bg-[009e60] mx-0 bg-[#095c39]/[0.96]">
          <h3 className="font-bold text-[#fcd116]/[0.96] text-base my-[12px]">Mes Profils Business</h3>

          {businessProfiles.length > 0 ? <div className="space-y-3 px-[26px] py-[12px]">
              {businessProfiles.map(business => <Card key={business.id} className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${currentMode === 'business' && currentBusiness?.id === business.id ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-muted/30'}`}>
                  <CardContent className="p-4 bg-white my-0 px-[37px] py-0 rounded-3xl">
                    <div className="flex items-center justify-between my-[10px]">
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
                        {business.is_primary && <Badge variant="outline" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Principal
                          </Badge>}
                        {currentMode === 'business' && currentBusiness?.id === business.id && <Badge variant="default" className="text-xs rounded-3xl">ACTUEL</Badge>}
                        <Button variant="default" size="sm" onClick={() => switchMode('business', business.id, navigate)} className="rounded-3xl">
                          {currentMode === 'business' && currentBusiness?.id === business.id ? 'Actuel' : 'Basculer'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
              
              {/* Bouton unique pour créer une nouvelle entreprise */}
              <CreateBusinessButton size="lg" className="h-14 from-primary to-accent hover:scale-[1.02] transition-all duration-300 shadow-lg rounded-3xl my-[15px] bg-[fcd116] bg-[#fcd116]/[0.97] text-black" fullWidth>
                <span className="text-lg font-bold">Créer un nouveau profil business</span>
              </CreateBusinessButton>
            </div> : <Card className="border-dashed border-2 border-muted-foreground/30">
              <CardContent className="p-8 text-center bg-inherit rounded-3xl">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="font-semibold text-xl mb-3">Aucune entreprise</h3>
                <p className="text-muted-foreground mb-6 text-base">
                  Créez votre première entreprise pour accéder aux fonctionnalités business
                </p>
                <CreateBusinessButton className="bg-gradient-to-r from-primary to-accent text-white h-14 px-8 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg" size="lg">
                  Créer mon entreprise
                </CreateBusinessButton>
              </CardContent>
            </Card>}
        </div>
      </div>

      {/* Quick Actions for Business Mode */}
      {currentMode === 'business' && currentBusiness && <div className="bg-gradient-to-br from-blue-50 to-accent-50 dark:from-blue-950/20 dark:to-accent-950/20 rounded-2xl p-6 border border-blue-200/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Actions Rapides - {currentBusiness.business_name}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="default" className="h-16 flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Gérer Profil</span>
            </Button>
            <Button variant="default" className="h-16 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Collaborateurs</span>
            </Button>
            <Button variant="default" className="h-16 flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Statistiques</span>
            </Button>
            <Button variant="default" className="h-16 flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Voir Profil</span>
            </Button>
          </div>
        </div>}

    </div>;
};