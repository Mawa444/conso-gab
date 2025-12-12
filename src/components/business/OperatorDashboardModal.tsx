import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Plus, 
  Settings, 
  Users, 
  BarChart3,
  Package,
  MessageSquare,
  Eye,
  Zap,
  Crown,
  Megaphone,
  ArrowLeft,
} from 'lucide-react';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { MultiBusinessManager } from './MultiBusinessManager';
import { CreateStoryDialog } from '@/features/stories/components/CreateStoryDialog';
import { ClientsTab } from '@/features/dashboard/components/ClientsTab';
import { FeaturesSettings } from '@/features/dashboard/components/FeaturesSettings';

interface OperatorDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OperatorDashboardModal = ({ open, onOpenChange }: OperatorDashboardModalProps) => {
  const { 
    currentMode, 
    currentBusinessId, 
    businessProfiles, 
    switchMode, 
    getCurrentBusiness, 
  } = useProfileMode();

  const [view, setView] = useState<'overview' | 'collaborators' | 'clients' | 'settings'>('overview');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const currentBusiness = getCurrentBusiness();

  // Reset view when closing
  const handleOpenChange = (open: boolean) => {
    if (!open) setView('overview');
    onOpenChange(open);
  };

  const handleBusinessSwitch = (businessId: string) => {
    switchMode('business', businessId);
    onOpenChange(false);
  };

  const quickActions = [
    {
      title: 'Créer une entreprise',
      description: 'Nouveau profil',
      icon: Plus,
      action: () => {
        // TODO: Ouvrir wizard création business
      },
      variant: 'default' as const,
    },
    {
      title: 'Marketing / Story',
      description: 'Publier une annonce',
      icon: Megaphone,
      action: () => setShowCreateStory(true),
      variant: 'default' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Clients / CRM',
      description: 'Gérer mes clients',
      icon: Users,
      action: () => setView('clients'),
      variant: 'default' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Gérer catalogues',
      description: 'Produits & services',
      icon: Package,
      action: () => {
        // Navigation vers catalogues
      },
      variant: 'outline' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Statistiques',
      description: 'Performance',
      icon: BarChart3,
      action: () => {
        // Navigation vers stats
      },
      variant: 'outline' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Messages',
      description: 'Conversations',
      icon: MessageSquare,
      action: () => {
        // Navigation vers messages
      },
      variant: 'outline' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Modules & Abo',
      description: 'Configuration',
      icon: Settings,
      action: () => setView('settings'),
      variant: 'outline' as const,
      disabled: currentMode !== 'business',
    },
    {
      title: 'Collaborateurs',
      description: 'Équipe',
      icon: Users,
      action: () => setView('collaborators'),
      variant: 'outline' as const,
    },
  ];

  const renderContent = () => {
    if (view === 'collaborators') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setView('overview')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">Gestion des collaborateurs</h2>
          </div>
          <MultiBusinessManager />
        </div>
      );
    }

    if (view === 'clients') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setView('overview')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">Mes Clients</h2>
          </div>
          {currentBusiness && <ClientsTab business={currentBusiness} />}
        </div>
      );
    }

    if (view === 'settings') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setView('overview')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">Modules & Abonnements</h2>
          </div>
          {currentBusiness && <FeaturesSettings business={currentBusiness} />}
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${view !== 'overview' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto transition-all`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Dashboard Opérateur
            {view !== 'overview' && <span className="text-muted-foreground">/ {view === 'clients' ? 'Clients' : view === 'settings' ? 'Modules' : 'Collaborateurs'}</span>}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        {currentBusinessId && (
          <CreateStoryDialog 
            businessId={currentBusinessId} 
            open={showCreateStory} 
            onOpenChange={setShowCreateStory} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
