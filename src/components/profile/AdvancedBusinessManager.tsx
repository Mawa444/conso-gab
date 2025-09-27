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
  const [showCreateForm, setShowCreateForm] = useState(false);
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
                {currentMode === 'consumer' && <Badge variant="secondary" className="text-xs">ACTUEL</Badge>}
                <Button variant="default" size="sm" onClick={() => switchMode('consumer', undefined, navigate)}>
                  {currentMode === 'consumer' ? 'Actuel' : 'Basculer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profiles */}
        <div className="space-y-3 rounded-3xl bg-[009e60] mx-0 bg-[#095c39]/[0.96]">
          <h3 className="font-bold text-[#fcd116]/[0.96] my-[6px] text-base">Mes Entreprises</h3>

          {businessProfiles.length > 0 ? <div className="space-y-3">
              {businessProfiles.map(business => <Card key={business.id} className={`transition-all duration-300 cursor-pointer hover:scale-[1.02] ${currentMode === 'business' && currentBusiness?.id === business.id ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-muted/30'}`}>
                  <CardContent className="p-4 bg-white rounded-full py-[5px] my-0 px-[10px]">
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
              <Button onClick={() => setShowCreateForm(true)} size="lg" className="w-full h-14 from-primary to-accent text-white hover:scale-[1.02] transition-all duration-300 shadow-lg rounded-3xl bg-[009e60] bg-[#009e60]/[0.96]">
                <Plus className="w-5 h-5 mr-3" />
                <span className="text-lg font-semibold">Créer mon entreprise</span>
              </Button>
            </div> : <Card className="border-dashed border-2 border-muted-foreground/30">
              <CardContent className="p-8 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="font-semibold text-xl mb-3">Aucune entreprise</h3>
                <p className="text-muted-foreground mb-6 text-base">
                  Créez votre première entreprise pour accéder aux fonctionnalités business
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-to-r from-primary to-accent text-white h-14 px-8 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg" size="lg">
                  <Plus className="w-5 h-5 mr-3" />
                  Créer mon entreprise
                </Button>
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

      {/* Create Business Form */}
      {showCreateForm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in">
          <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <BusinessCreationWizard onCancel={() => setShowCreateForm(false)} onCreated={businessId => {
          setShowCreateForm(false);
          toast.success("Entreprise créée avec succès !");
          // Redirection automatique vers le profil business
          setTimeout(() => {
            switchMode('business', businessId, navigate);
          }, 1000);
        }} />
          </div>
        </div>}
    </div>;
};