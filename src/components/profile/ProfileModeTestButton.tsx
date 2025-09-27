import { useProfileMode } from "@/hooks/use-profile-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2 } from "lucide-react";

export const ProfileModeTestButton = () => {
  const { 
    currentMode, 
    currentBusinessId, 
    businessProfiles, 
    loading, 
    switchMode 
  } = useProfileMode();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Basculement Profils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Basculement Profils</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État actuel */}
        <div className="flex items-center gap-2">
          <Badge variant={currentMode === 'consumer' ? 'default' : 'secondary'}>
            {currentMode === 'consumer' ? (
              <>
                <User className="w-3 h-3 mr-1" />
                Consommateur
              </>
            ) : (
              <>
                <Building2 className="w-3 h-3 mr-1" />
                Business ({currentBusinessId})
              </>
            )}
          </Badge>
        </div>

        {/* Profils business disponibles */}
        <div>
          <h4 className="text-sm font-medium mb-2">
            Profils Business ({businessProfiles.length})
          </h4>
          {businessProfiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun profil business</p>
          ) : (
            <div className="space-y-1">
              {businessProfiles.map((business) => (
                <div key={business.id} className="text-xs">
                  {business.business_name} ({business.is_owner ? 'Propriétaire' : business.role})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons de test */}
        <div className="space-y-2">
          <Button 
            onClick={() => switchMode('consumer')}
            variant={currentMode === 'consumer' ? 'default' : 'outline'}
            size="sm"
            className="w-full"
          >
            <User className="w-4 h-4 mr-2" />
            Mode Consommateur
          </Button>

          {businessProfiles.map((business) => (
            <Button
              key={business.id}
              onClick={() => switchMode('business', business.id)}
              variant={currentMode === 'business' && currentBusinessId === business.id ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              <Building2 className="w-4 h-4 mr-2" />
              {business.business_name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};