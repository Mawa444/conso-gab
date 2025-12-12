import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusinessFeatures } from '@/features/dashboard/hooks/useBusinessCRM';
import { Users, Megaphone, BarChart3, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface FeaturesSettingsProps {
  business: any;
}

export const FeaturesSettings = ({ business }: FeaturesSettingsProps) => {
  const { toggleFeature } = useBusinessFeatures(business.id);
  const features = business.settings?.features || {};

  const handleToggle = (key: string, currentValue: boolean) => {
    toggleFeature.mutate(
      { key, enabled: !currentValue },
      {
        onSuccess: () => {
          toast.success(`Module ${key} ${!currentValue ? 'activé' : 'désactivé'}`);
        },
        onError: () => {
          toast.error('Erreur lors de la modification');
        },
      },
    );
  };

  const modules = [
    {
      key: 'crm',
      title: 'CRM Clients',
      description: 'Gérez vos clients, ajoutez des notes et suivez leur historique.',
      icon: Users,
      price: 'Inclus',
    },
    {
      key: 'marketing',
      title: 'Marketing & Stories',
      description: 'Publiez des stories géolocalisées pour attirer des clients.',
      icon: Megaphone,
      price: 'Premium',
    },
    {
      key: 'analytics',
      title: 'Statistiques Avancées',
      description: 'Analysez vos ventes et votre trafic en détail.',
      icon: BarChart3,
      price: 'Premium',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Mes Modules & Abonnements</h3>
      <div className="grid gap-4">
        {modules.map((module) => {
          const isEnabled = features[module.key] === true;
          return (
            <Card key={module.key} className={isEnabled ? 'border-primary/50 bg-primary/5' : 'opacity-80'}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <module.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{module.title}</h4>
                      <Badge variant={isEnabled ? 'default' : 'outline'} className="text-[10px]">
                        {isEnabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {module.price}
                  </span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(module.key, isEnabled)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 mt-6">
        <Lock className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <h4 className="font-semibold text-blue-800">Gérer mon abonnement</h4>
          <p className="text-sm text-blue-600">
                Certains modules nécessitent un abonnement Pro. Contactez le support pour mettre à jour votre plan.
          </p>
        </div>
      </div>
    </div>
  );
};
