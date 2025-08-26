import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Phone, 
  MessageSquare, 
  Mail, 
  ExternalLink,
  Verified,
  Eye,
  EyeOff
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  business_name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  telegram?: string;
  website?: string;
  is_verified: boolean;
  is_active: boolean;
}

interface BusinessSettingsProps {
  businessProfile: BusinessProfile | null;
  onUpdate: () => void;
}

export const BusinessSettings = ({ businessProfile, onUpdate }: BusinessSettingsProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleActiveStatus = async () => {
    if (!businessProfile) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({ is_active: !businessProfile.is_active })
        .eq('id', businessProfile.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Profil ${businessProfile.is_active ? 'désactivé' : 'activé'}`,
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error updating business status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: businessProfile?.phone,
      href: businessProfile?.phone ? `tel:${businessProfile.phone}` : null,
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: businessProfile?.whatsapp,
      href: businessProfile?.whatsapp ? `https://wa.me/${businessProfile.whatsapp.replace(/\D/g, '')}` : null,
    },
    {
      icon: Mail,
      label: 'Email',
      value: businessProfile?.email,
      href: businessProfile?.email ? `mailto:${businessProfile.email}` : null,
    },
    {
      icon: MessageSquare,
      label: 'Telegram',
      value: businessProfile?.telegram,
      href: businessProfile?.telegram ? `https://t.me/${businessProfile.telegram.replace('@', '')}` : null,
    },
    {
      icon: ExternalLink,
      label: 'Site web',
      value: businessProfile?.website,
      href: businessProfile?.website,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramètres business</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Statut du profil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="business-active">Profil actif</Label>
                <p className="text-sm text-muted-foreground">
                  Rendre votre business visible aux clients
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="business-active"
                  checked={businessProfile?.is_active || false}
                  onCheckedChange={toggleActiveStatus}
                  disabled={isUpdating}
                />
                {businessProfile?.is_active ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Statut de vérification</Label>
                <p className="text-sm text-muted-foreground">
                  Profil vérifié par l'équipe ConsoGab
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={businessProfile?.is_verified ? "default" : "secondary"}>
                  {businessProfile?.is_verified ? "Vérifié" : "Non vérifié"}
                </Badge>
                {businessProfile?.is_verified && (
                  <Verified className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </div>

            {!businessProfile?.is_verified && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Comment obtenir la vérification ?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complétez toutes les informations de votre profil</li>
                  <li>• Ajoutez au moins un catalogue avec des produits</li>
                  <li>• Fournissez des informations de contact valides</li>
                  <li>• Respectez les conditions d'utilisation</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contactMethods.map((method) => (
                <div key={method.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <method.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>{method.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {method.value || 'Non configuré'}
                      </p>
                    </div>
                  </div>
                  {method.value && method.href && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={method.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Conseils pour optimiser vos contacts
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Renseignez au moins 2 méthodes de contact</li>
                <li>• Vérifiez que vos numéros sont corrects</li>
                <li>• Répondez rapidement aux messages clients</li>
                <li>• Maintenez vos informations à jour</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Actions avancées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                Zone de danger
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                Ces actions sont irréversibles. Assurez-vous de bien comprendre les conséquences.
              </p>
              <Button variant="destructive" size="sm">
                Supprimer le profil business
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};