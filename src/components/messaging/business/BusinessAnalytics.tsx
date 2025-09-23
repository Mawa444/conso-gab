import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  MessageCircle, 
  Users, 
  Clock,
  DollarSign,
  Star,
  Target,
  Calendar,
  Zap
} from "lucide-react";

export const BusinessAnalytics: React.FC = () => {
  const analyticsData = [
    {
      category: "Performance Messagerie",
      icon: MessageCircle,
      metrics: [
        { label: "Messages envoyés", value: "847", change: "+23%", color: "text-blue-600" },
        { label: "Messages reçus", value: "1,203", change: "+18%", color: "text-green-600" },
        { label: "Temps de réponse moyen", value: "12min", change: "-8min", color: "text-green-600" },
        { label: "Taux de réponse", value: "96%", change: "+4%", color: "text-green-600" }
      ]
    },
    {
      category: "Conversion & Ventes",
      icon: DollarSign,
      metrics: [
        { label: "CA via messagerie", value: "12,450€", change: "+34%", color: "text-green-600" },
        { label: "Taux de conversion", value: "18.5%", change: "+2.3%", color: "text-green-600" },
        { label: "Panier moyen", value: "89€", change: "+12€", color: "text-green-600" },
        { label: "Commandes finalisées", value: "156", change: "+45", color: "text-green-600" }
      ]
    },
    {
      category: "Satisfaction Client",
      icon: Star,
      metrics: [
        { label: "Note moyenne", value: "4.8/5", change: "+0.2", color: "text-yellow-600" },
        { label: "Avis positifs", value: "94%", change: "+6%", color: "text-green-600" },
        { label: "Clients satisfaits", value: "89%", change: "+5%", color: "text-green-600" },
        { label: "Recommandations", value: "92%", change: "+8%", color: "text-green-600" }
      ]
    }
  ];

  const topPerformers = [
    { type: "Commandes", count: 45, percentage: 85, trend: "+12%" },
    { type: "Devis", count: 23, percentage: 68, trend: "+8%" },
    { type: "Réservations", count: 67, percentage: 92, trend: "+15%" },
    { type: "Support", count: 12, percentage: 45, trend: "-3%" }
  ];

  const recentTrends = [
    {
      period: "Cette semaine",
      highlights: [
        "🚀 Meilleure semaine en termes de conversion (+34%)",
        "⚡ Temps de réponse record (12min en moyenne)",
        "🎯 96% de taux de réponse maintenu",
        "💬 +180 nouvelles conversations initiées"
      ]
    },
    {
      period: "Tendances du mois",
      highlights: [
        "📈 Croissance constante du CA (+28% vs mois dernier)",
        "👥 +45 nouveaux clients via messagerie",
        "⭐ Note de satisfaction stable à 4.8/5",
        "🔄 78% de clients récurrents"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Analytics Business Pro</span>
        </div>
        <h1 className="text-3xl font-bold text-gaboma-gradient">
          Tableau de Bord Analytique
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Analysez les performances de votre messagerie, optimisez vos processus et maximisez votre ROI.
        </p>
      </div>

      {/* Analytics Categories */}
      {analyticsData.map((category, categoryIndex) => {
        const CategoryIcon = category.icon;
        return (
          <Card key={categoryIndex} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    Métriques clés et évolution
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="p-4 rounded-lg bg-background/50 border border-border/30">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{metric.label}</span>
                        <Badge variant="secondary" className={`${metric.color} bg-transparent border-current text-xs`}>
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Performance par Type */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Performance par Type de Conversation</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Efficacité par catégorie de messagerie
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topPerformers.map((performer, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{performer.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {performer.count} conversations
                    </Badge>
                    <Badge variant="secondary" className={`text-xs ${
                      performer.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {performer.trend}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efficacité</span>
                    <span className="font-medium">{performer.percentage}%</span>
                  </div>
                  <Progress value={performer.percentage} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tendances et Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentTrends.map((trend, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{trend.period}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    Points marquants
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trend.highlights.map((highlight, highlightIndex) => (
                <div key={highlightIndex} className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-sm">{highlight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Insights IA</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Recommandations personnalisées pour optimiser vos performances
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Optimisation des horaires</h4>
                <p className="text-sm text-muted-foreground">
                  Vos clients sont plus actifs entre 14h-18h. Considérez d'augmenter votre présence sur cette plage horaire pour améliorer le taux de conversion de +15%.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border border-accent/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Messages automatisés</h4>
                <p className="text-sm text-muted-foreground">
                  Les réponses automatiques pour les questions fréquentes pourraient réduire votre temps de réponse de 40% et améliorer la satisfaction client.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};