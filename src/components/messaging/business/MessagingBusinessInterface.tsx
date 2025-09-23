import React from "react";
import { useMessagingContext } from "../UniversalMessagingOS";
import { BusinessInbox } from "./BusinessInbox";
import { BusinessAnalytics } from "./BusinessAnalytics";
import { BusinessSettings } from "./BusinessSettings";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { 
  MessageCircle, 
  Users, 
  ShoppingBag, 
  Calendar,
  TrendingUp,
  Zap,
  Star,
  Clock,
  DollarSign,
  Target
} from "lucide-react";

export const MessagingBusinessInterface: React.FC = () => {
  const { currentView } = useMessagingContext();
  const { getCurrentBusiness } = useProfileMode();
  
  const currentBusiness = getCurrentBusiness();

  const businessMetrics = [
    {
      icon: MessageCircle,
      label: "Messages Reçus",
      value: "47",
      change: "+12%",
      description: "Cette semaine",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Users,
      label: "Clients Actifs",
      value: "23",
      change: "+8%", 
      description: "Conversations ouvertes",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: DollarSign,
      label: "CA Généré",
      value: "2.4K€",
      change: "+15%",
      description: "Via messagerie",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Clock,
      label: "Temps Réponse",
      value: "12min",
      change: "-5min",
      description: "Moyenne",
      color: "from-purple-500 to-violet-600"
    }
  ];

  const quickActions = [
    {
      icon: Target,
      label: "Campagne Promo",
      description: "Envoyer une offre groupée",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Calendar,
      label: "Planning RDV",
      description: "Gérer les créneaux",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: ShoppingBag,
      label: "Gestion Commandes",
      description: "Traiter les demandes",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Star,
      label: "Avis Clients",
      description: "Répondre aux avis",
      color: "from-yellow-500 to-amber-600"
    }
  ];

  if (currentView === 'analytics') {
    return <BusinessAnalytics />;
  }

  if (currentView === 'settings') {
    return <BusinessSettings />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Interface Business Pro</span>
        </div>
        <h1 className="text-3xl font-bold text-gaboma-gradient">
          Dashboard {currentBusiness?.business_name}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Gérez vos conversations clients, automatisez vos processus et développez votre activité grâce à notre messagerie intelligente.
        </p>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change.startsWith('+') || metric.change.startsWith('-');
          const changeColor = metric.change.startsWith('+') ? 'text-green-600' : 
                             metric.change.startsWith('-') && metric.label === 'Temps Réponse' ? 'text-green-600' : 'text-red-600';
          
          return (
            <Card key={index} className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-soft transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className={`${changeColor} bg-transparent border-current`}>
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm font-medium">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-6 bg-gradient-to-br from-background to-background/50 border-border/50 hover:bg-accent/5 hover:shadow-soft transition-all duration-300 group"
            >
              <div className="space-y-3 text-left">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">{action.label}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Main Business Inbox */}
      <BusinessInbox />

      {/* Performance Insight */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Business
            </h3>
            <p className="text-sm text-muted-foreground">
              Votre entreprise performe bien ! Temps de réponse excellent et satisfaction client élevée.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">96%</div>
              <div className="text-xs text-muted-foreground">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">4.8</div>
              <div className="text-xs text-muted-foreground">Note Moy.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">87%</div>
              <div className="text-xs text-muted-foreground">Conversion</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};