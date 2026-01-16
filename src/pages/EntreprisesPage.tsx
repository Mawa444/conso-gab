import { useNavigate } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Building2, Plus, Crown, Users, Settings } from "lucide-react";
import { toast } from "sonner";

export const EntreprisesPage = () => {
  const navigate = useNavigate();
  const { businessProfiles, switchMode, currentMode, currentBusinessId } = useProfileMode();

  const handleCreateBusiness = () => {
    navigate('/entreprises/create');
  };

  const handleSwitchToBusiness = async (businessId: string) => {
    try {
      await switchMode('business', businessId, () => {
        navigate(`/business/${businessId}`);
        toast.success("Basculé en mode Business");
      });
    } catch (error) {
      toast.error("Erreur lors du changement de mode");
    }
  };

  const handleQuit = () => {
    navigate('/profil?tab=entreprises');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <Header 
        title="Mes Entreprises" 
        showBack 
        onBack={handleQuit}
        backLabel="Quitter"
        showNotifications={false}
      />
      
      <div className="max-w-4xl mx-auto space-y-6 pt-24 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Entreprises</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos profils business ou créez-en un nouveau
            </p>
          </div>
          <Button onClick={handleCreateBusiness} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Créer une entreprise
          </Button>
        </div>

        {/* Liste des entreprises */}
        {businessProfiles.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune entreprise</h3>
              <p className="text-muted-foreground text-center mb-6">
                Vous n'avez pas encore créé d'entreprise.<br />
                Commencez dès maintenant pour gérer vos activités professionnelles.
              </p>
              <Button onClick={handleCreateBusiness} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Créer ma première entreprise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {businessProfiles.map((business) => {
              const isActive = currentMode === 'business' && currentBusinessId === business.id;
              
              return (
                <Card 
                  key={business.id} 
                  className={`transition-all ${isActive ? 'border-primary border-2 shadow-lg' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          {business.logo_url ? (
                            <img 
                              src={business.logo_url} 
                              alt={business.business_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {business.business_name}
                            {business.is_owner && (
                              <Badge variant="secondary" className="gap-1">
                                <Crown className="w-3 h-3" />
                                Propriétaire
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className="gap-1">
                                Actif
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {business.role === 'owner' ? 'Propriétaire' : business.role}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSwitchToBusiness(business.id)}
                          variant="default"
                        >
                          Gérer
                        </Button>
                        
                        {business.is_owner && (
                          <Button 
                            onClick={() => navigate(`/business/${business.id}/settings`)}
                            variant="outline"
                            size="icon"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Collaborateurs</span>
                      </div>
                      {business.is_primary && (
                        <Badge variant="outline">Entreprise principale</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntreprisesPage;
