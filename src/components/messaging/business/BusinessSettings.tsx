import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Zap, 
  Bell, 
  MessageSquare, 
  Users,
  Shield,
  Palette,
  Bot,
  Clock,
  Target,
  Sparkles,
  Download,
  Upload,
  Trash2
} from "lucide-react";

export const BusinessSettings: React.FC = () => {
  const settingsGroups = [
    {
      title: "Réponses Automatiques",
      icon: Bot,
      description: "Configurez vos messages et workflows automatisés",
      badge: "IA",
      settings: [
        { id: "auto_welcome", label: "Message de bienvenue", description: "Saluer automatiquement les nouveaux clients", enabled: true },
        { id: "auto_away", label: "Message d'absence", description: "Réponse quand vous n'êtes pas disponible", enabled: false },
        { id: "auto_faq", label: "FAQ intelligente", description: "Réponses aux questions fréquentes", enabled: true },
        { id: "auto_booking", label: "Réservation automatique", description: "Proposition de créneaux disponibles", enabled: false }
      ]
    },
    {
      title: "Notifications Business",
      icon: Bell,
      description: "Gérez vos alertes et notifications professionnelles",
      badge: "Pro",
      settings: [
        { id: "instant_messages", label: "Messages instantanés", description: "Alerte immédiate pour chaque message", enabled: true },
        { id: "order_notifications", label: "Nouvelles commandes", description: "Notification pour chaque commande", enabled: true },
        { id: "review_alerts", label: "Nouveaux avis", description: "Alerte pour les avis clients", enabled: true },
        { id: "daily_summary", label: "Résumé quotidien", description: "Rapport d'activité par email", enabled: false }
      ]
    },
    {
      title: "Workflow & Intégrations",
      icon: Zap,
      description: "Automatisez vos processus métier",
      badge: "Advanced",
      settings: [
        { id: "crm_sync", label: "Synchronisation CRM", description: "Sync avec votre système CRM", enabled: false },
        { id: "inventory_alerts", label: "Alertes stock", description: "Notification quand stock faible", enabled: true },
        { id: "payment_tracking", label: "Suivi paiements", description: "Suivi automatique des transactions", enabled: true },
        { id: "analytics_export", label: "Export automatique", description: "Export quotidien des données", enabled: false }
      ]
    },
    {
      title: "Expérience Client",
      icon: Users,
      description: "Optimisez l'expérience de vos clients",
      badge: "Customer",
      settings: [
        { id: "typing_indicators", label: "Indicateurs de frappe", description: "Montrer quand vous tapez", enabled: true },
        { id: "read_receipts", label: "Accusés de lecture", description: "Confirmer la lecture des messages", enabled: true },
        { id: "customer_history", label: "Historique client", description: "Afficher l'historique des interactions", enabled: true },
        { id: "satisfaction_survey", label: "Enquête satisfaction", description: "Sondage automatique post-conversation", enabled: false }
      ]
    }
  ];

  const quickTemplates = [
    {
      category: "Accueil",
      templates: [
        "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        "Merci de nous avoir contactés. Que puis-je faire pour vous ?",
        "Bienvenue ! Je suis là pour répondre à toutes vos questions."
      ]
    },
    {
      category: "Commandes",
      templates: [
        "Votre commande a été reçue et sera traitée dans les plus brefs délais.",
        "Le suivi de votre commande est disponible à ce lien : [LIEN]",
        "Votre commande est en préparation. Livraison prévue : [DATE]"
      ]
    },
    {
      category: "Support",
      templates: [
        "Je comprends votre problème. Laissez-moi vous aider à le résoudre.",
        "Merci pour votre patience. Je traite votre demande immédiatement.",
        "Votre demande a été transmise à notre équipe technique."
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Configuration Business</span>
        </div>
        <h1 className="text-3xl font-bold text-gaboma-gradient">
          Paramètres Professionnels
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Configurez votre messagerie business pour optimiser vos processus et offrir une expérience client exceptionnelle.
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{group.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {group.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">{group.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.settings.map((setting, settingIndex) => (
                <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{setting.label}</h4>
                      {setting.enabled && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Actif
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

      {/* Templates Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Templates de Messages</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Créez et gérez vos modèles de réponses rapides
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quickTemplates.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{category.category}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.templates.length} templates
                </Badge>
              </div>
              <div className="space-y-2">
                {category.templates.map((template, templateIndex) => (
                  <div key={templateIndex} className="p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-accent/5 transition-colors">
                    <p className="text-sm">{template}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Importer Templates
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Exporter Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Actions Avancées</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Gestion avancée de votre configuration
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-background/50 border-border/50">
            <Download className="w-4 h-4 mr-2" />
            Exporter toute la configuration
          </Button>
          <Button variant="outline" className="w-full justify-start bg-background/50 border-border/50">
            <Upload className="w-4 h-4 mr-2" />
            Importer une configuration
          </Button>
          <Button variant="outline" className="w-full justify-start bg-background/50 border-border/50">
            <Target className="w-4 h-4 mr-2" />
            Réinitialiser aux valeurs par défaut
          </Button>
          <Separator />
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 bg-background/50 border-border/50">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer toutes les données de messagerie
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};