import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
/* ... imports ... */

export const OperatorDashboardModal = ({ open, onOpenChange }: OperatorDashboardModalProps) => {
  const navigate = useNavigate();
  const { 
    currentMode, 
    currentBusinessId, 
    /* ... */
  } = useProfileMode();

  /* ... */

  const quickActions = [
    {
      title: "Créer une entreprise",
      description: "Nouveau profil",
      icon: Plus,
      action: () => {
        navigate('/entreprises/create');
        onOpenChange(false);
      },
      variant: "default" as const
    },
    {
      title: "Gérer catalogues",
      description: "Produits & services",
      icon: Package,
      action: () => {
        if (currentBusinessId) {
          navigate(`/business/${currentBusinessId}/dashboard`);
          onOpenChange(false);
        }
      },
      variant: "outline" as const,
      disabled: currentMode !== 'business'
    },
    {
      title: "Statistiques",
      description: "Performance",
      icon: BarChart3,
      action: () => {
        if (currentBusinessId) {
          navigate(`/business/${currentBusinessId}/dashboard`);
          onOpenChange(false);
        }
      },
      variant: "outline" as const,
      disabled: currentMode !== 'business'
    },
    {
      title: "Messages",
      description: "Conversations",
      icon: MessageSquare,
      action: () => {
        if (currentBusinessId) {
          navigate(`/messaging`); // Assuming global messaging route for now
          onOpenChange(false);
        }
      },
      variant: "outline" as const,
      disabled: currentMode !== 'business'
    },
    {
      title: "Paramètres",
      description: "Configuration",
      icon: Settings,
      action: () => {
        if (currentBusinessId) {
          navigate(`/business/${currentBusinessId}/settings`); // Assuming separate settings route or dashboard tab
          onOpenChange(false);
        }
      },
      variant: "outline" as const,
      disabled: currentMode !== 'business'
    },
    {
      title: "Collaborateurs",
      description: "Équipe",
      icon: Users,
      action: () => setShowMultiManager(true),
      variant: "outline" as const
    }
  ];

  if (showMultiManager) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestion des collaborateurs
            </DialogTitle>
          </DialogHeader>
          <MultiBusinessManager />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Dashboard Opérateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut actuel */}
          <Card className={`border-2 ${
            currentMode === 'business' 
              ? 'border-blue-200 bg-blue-50/50' 
              : 'border-green-200 bg-green-50/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentMode === 'business' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {currentMode === 'business' ? (
                      <Building2 className="w-6 h-6" />
                    ) : (
                      <Eye className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      Mode: {currentMode === 'business' ? 'Professionnel' : 'Consommateur'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentMode === 'business' && currentBusiness 
                        ? currentBusiness.business_name
                        : 'Consultation et achats'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={currentMode === 'business' ? 'default' : 'secondary'}>
                  {currentMode === 'business' ? 'Actif' : 'Standard'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div>
            <h3 className="font-semibold mb-3">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.action}
                    disabled={action.disabled}
                    className="h-auto p-4 justify-start relative"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Mes entreprises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Mes entreprises ({businessProfiles.length})</h3>
              <Button size="sm" variant="outline" onClick={() => {}}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>
            
            <div className="space-y-2">
              {businessProfiles.map((business) => (
                <Card 
                  key={business.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentMode === 'business' && currentBusinessId === business.id
                      ? 'ring-2 ring-blue-500 bg-blue-50/50'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleBusinessSwitch(business.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{business.business_name}</h4>
                          {business.is_primary && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Propriétaire
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentMode === 'business' && currentBusinessId === business.id && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Zap className="w-3 h-3 mr-1" />
                            Actuel
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bouton retour mode consommateur */}
          {currentMode === 'business' && (
            <Button
              variant="outline"
              onClick={() => switchMode('consumer')}
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Revenir en mode consommateur
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};