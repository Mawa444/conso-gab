import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  MessageSquare,
  Smartphone,
  Mail,
  Volume2,
  Eye,
  Lock,
  Trash2,
  Download
} from "lucide-react";

export const ConsumerSettings: React.FC = () => {
  const settingsGroups = [
    {
      title: "Notifications",
      icon: Bell,
      description: "Gérez comment vous recevez les alertes",
      settings: [
        { id: "push_messages", label: "Messages instantanés", description: "Notifications push pour nouveaux messages", enabled: true },
        { id: "email_summary", label: "Résumé par email", description: "Résumé quotidien par email", enabled: false },
        { id: "sms_urgent", label: "SMS urgents", description: "SMS pour les messages importants", enabled: true },
        { id: "sound_alerts", label: "Alertes sonores", description: "Sons de notification", enabled: true }
      ]
    },
    {
      title: "Confidentialité",
      icon: Shield,
      description: "Contrôlez vos données et votre visibilité",
      settings: [
        { id: "read_receipts", label: "Accusés de lecture", description: "Indiquer quand vous avez lu les messages", enabled: true },
        { id: "last_seen", label: "Dernière connexion", description: "Afficher votre dernière activité", enabled: false },
        { id: "profile_visibility", label: "Profil public", description: "Permettre aux entreprises de vous trouver", enabled: true },
        { id: "data_sharing", label: "Partage de données", description: "Améliorer les recommandations", enabled: false }
      ]
    },
    {
      title: "Expérience",
      icon: Palette,
      description: "Personnalisez votre interface",
      settings: [
        { id: "dark_mode", label: "Mode sombre", description: "Interface sombre pour vos yeux", enabled: false },
        { id: "compact_view", label: "Vue compacte", description: "Plus de conversations visibles", enabled: false },
        { id: "auto_translate", label: "Traduction auto", description: "Traduire les messages automatiquement", enabled: true },
        { id: "smart_replies", label: "Réponses intelligentes", description: "Suggestions de réponses IA", enabled: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
          <Settings className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Paramètres Client</span>
        </div>
        <h1 className="text-3xl font-bold text-gaboma-gradient">
          Votre Expérience Personnalisée
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Configurez votre messagerie pour qu'elle s'adapte parfaitement à vos besoins et préférences.
        </p>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon;
        return (
          <Card key={groupIndex} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <GroupIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">{group.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.settings.map((setting, settingIndex) => (
                <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{setting.label}</h4>
                      {setting.enabled && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Activé
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Actions Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Actions Rapides</h3>
              <p className="text-sm text-muted-foreground font-normal">Gérez vos données et votre compte</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-background/50 border-border/50">
            <Download className="w-4 h-4 mr-2" />
            Exporter mes données
          </Button>
          <Button variant="outline" className="w-full justify-start bg-background/50 border-border/50">
            <Lock className="w-4 h-4 mr-2" />
            Changer le mot de passe
          </Button>
          <Separator />
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 bg-background/50 border-border/50">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};